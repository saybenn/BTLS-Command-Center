import "server-only";

import {
  executeMediaCleanupCandidate,
  evaluateMediaCleanupEligibility,
  findMediaCleanupCandidates,
  type MediaCleanupAsset,
  type MediaCleanupOutcome,
} from "@/server/storage/media-cleanup";
import { enqueueJobExecution, RetryableJobExecutionError } from "@/server/jobs/job-execution";
import {
  mediaCleanupJobPayloadSchema,
  type MediaCleanupJobPayload,
} from "@/server/jobs/job-contracts";
import {
  createPrismaJobExecutionDependencies,
  type JobExecutionDependencies,
} from "@/server/jobs/job-execution";
import { z } from "zod";

export const scheduledMediaCleanupBatchSize = 25;

type ScheduledMediaCleanupDependencies = {
  findCandidates: typeof findMediaCleanupCandidates;
  jobExecution: JobExecutionDependencies;
};

type MediaCleanupExecutionDependencies = {
  executeCandidate: typeof executeMediaCleanupCandidate;
  findAsset: (input: {
    where: { id: string; propertyId: string };
  }) => Promise<MediaCleanupAsset | null>;
  now?: () => Date;
};

export type ScheduledMediaCleanupJob = {
  created: boolean;
  jobExecutionId: string;
  mediaAssetId: string;
  propertyId: string;
};

export class MediaCleanupJobRetryableError extends RetryableJobExecutionError {
  constructor(
    readonly failureCategory: "MEDIA_CLEANUP_CLAIM_UNAVAILABLE" | "STORAGE_DELETE_FAILED",
  ) {
    super("Media cleanup remains eligible for a safe retry.");
    this.name = "MediaCleanupJobRetryableError";
  }
}

function createScheduledMediaCleanupDependencies(): ScheduledMediaCleanupDependencies {
  return {
    findCandidates: findMediaCleanupCandidates,
    jobExecution: createPrismaJobExecutionDependencies(),
  };
}

function createMediaCleanupExecutionDependencies(): MediaCleanupExecutionDependencies {
  return {
    executeCandidate: executeMediaCleanupCandidate,
    now: () => new Date(),
    findAsset: async (input) => {
      const { prisma } = await import("@/server/database/prisma");
      return prisma.mediaAsset.findFirst(input) as Promise<MediaCleanupAsset | null>;
    },
  };
}

export async function scheduleMediaCleanupJobs(
  input: { scheduleKey: string },
  dependencies: ScheduledMediaCleanupDependencies = createScheduledMediaCleanupDependencies(),
): Promise<{ discovered: number; jobs: ScheduledMediaCleanupJob[] }> {
  const scheduleKey = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .parse(input.scheduleKey);
  const candidates = await dependencies.findCandidates({
    limit: scheduledMediaCleanupBatchSize,
  });
  const jobs: ScheduledMediaCleanupJob[] = [];

  for (const candidate of candidates) {
    const payload = mediaCleanupJobPayloadSchema.parse({
      propertyId: candidate.propertyId,
      correlationId: candidate.id,
      idempotencyKey: "media-cleanup:" + candidate.id + ":" + scheduleKey,
      mediaAssetId: candidate.id,
    });
    const job = await enqueueJobExecution(
      {
        jobType: "storage.media_cleanup",
        origin: "SYSTEM",
        payload,
      },
      dependencies.jobExecution,
    );
    jobs.push({
      created: job.created,
      jobExecutionId: job.record.id,
      mediaAssetId: candidate.id,
      propertyId: candidate.propertyId,
    });
  }

  return { discovered: candidates.length, jobs };
}

export async function runScheduledMediaCleanupJob(
  input: MediaCleanupJobPayload,
  dependencies: MediaCleanupExecutionDependencies = createMediaCleanupExecutionDependencies(),
): Promise<MediaCleanupOutcome | "SKIPPED_UNAVAILABLE"> {
  const payload = mediaCleanupJobPayloadSchema.parse(input);
  const candidate = await dependencies.findAsset({
    where: {
      id: payload.mediaAssetId,
      propertyId: payload.propertyId,
    },
  });
  if (!candidate) return "SKIPPED_UNAVAILABLE";
  if (candidate.status === "DELETED") return "SKIPPED_UNAVAILABLE";
  if (
    candidate.status !== "DELETION_PENDING" &&
    !evaluateMediaCleanupEligibility(candidate, dependencies.now?.() ?? new Date()).eligible
  ) {
    return "SKIPPED_NO_LONGER_ELIGIBLE";
  }

  const result = await dependencies.executeCandidate(candidate);
  if (result.outcome === "RETRY_SCHEDULED") {
    throw new MediaCleanupJobRetryableError("STORAGE_DELETE_FAILED");
  }
  if (result.outcome === "SKIPPED_CLAIM_RACE") {
    throw new MediaCleanupJobRetryableError("MEDIA_CLEANUP_CLAIM_UNAVAILABLE");
  }
  return result.outcome;
}

export type { MediaCleanupExecutionDependencies, ScheduledMediaCleanupDependencies };
