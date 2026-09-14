import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { prisma } from "@/server/database/prisma";
import { runFeature07JobExecution } from "@/server/jobs/feature-07-job-workflows";
import {
  scheduleMediaCleanupJobs,
  type MediaCleanupExecutionDependencies,
} from "@/server/jobs/media-cleanup-job";
import {
  createPrismaJobExecutionDependencies,
  type JobExecutionDependencies,
} from "@/server/jobs/job-execution";
import {
  executeMediaCleanupCandidate,
  type MediaCleanupAsset,
  type MediaCleanupDependencies,
} from "@/server/storage/media-cleanup";
import { MediaStorageProviderError } from "@/server/storage/supabase-storage";

const ids = {
  account: randomUUID(),
  asset: randomUUID(),
  property: randomUUID(),
};
const now = new Date();
let actorId: string;

function jobDependencies(): JobExecutionDependencies {
  const dependencies = createPrismaJobExecutionDependencies();
  return { ...dependencies, now: () => now };
}

describe("Feature 07 scheduled Media cleanup database integration", () => {
  beforeAll(async () => {
    const admin = await prisma.appUser.findFirst({
      where: { platformRole: "BTLS_ADMIN", status: "ACTIVE" },
      select: { id: true },
    });
    if (!admin) throw new Error("The local seed must provide an active BTLS admin.");
    actorId = admin.id;

    await prisma.clientAccount.create({
      data: {
        id: ids.account,
        name: "Scheduled cleanup integration",
        properties: {
          create: {
            id: ids.property,
            name: "Scheduled cleanup property",
            domain: "scheduled-cleanup-" + ids.property.slice(0, 8) + ".example.test",
          },
        },
      },
    });
    await prisma.mediaAsset.create({
      data: {
        id: ids.asset,
        propertyId: ids.property,
        createdById: actorId,
        profile: "ATTACHMENT",
        visibility: "PRIVATE",
        sensitivity: "NORMAL",
        durability: "DURABLE",
        storageBucket: "PRIVATE_MEDIA",
        pathFamily: "attachment",
        objectPath: ids.property + "/attachment/" + ids.asset + ".pdf",
        displayFilename: "scheduled-cleanup.pdf",
        declaredMimeType: "application/pdf",
        declaredByteSize: 100,
        expectedExtension: "pdf",
        uploadUrlExpiresAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        finalizationDeadlineAt: new Date(now.getTime() - 60 * 60 * 1000),
      },
    });
  });

  afterAll(async () => {
    await prisma.jobExecution.deleteMany({ where: { propertyId: ids.property } });
    await prisma.mediaAsset.deleteMany({ where: { propertyId: ids.property } });
    await prisma.clientProperty.deleteMany({ where: { accountId: ids.account } });
    await prisma.clientAccount.deleteMany({ where: { id: ids.account } });
    await prisma.$disconnect();
  });

  it("persists one scheduled job, reuses duplicate dispatch, and delegates cleanup", async () => {
    const asset = (await prisma.mediaAsset.findUniqueOrThrow({
      where: { id: ids.asset },
    })) as unknown as MediaCleanupAsset;
    const dependencies = jobDependencies();
    const scheduleDependencies = {
      findCandidates: vi.fn().mockResolvedValue([asset]),
      jobExecution: dependencies,
    };

    const first = await scheduleMediaCleanupJobs(
      { scheduleKey: "2026-09-10" },
      scheduleDependencies,
    );
    const duplicate = await scheduleMediaCleanupJobs(
      { scheduleKey: "2026-09-10" },
      scheduleDependencies,
    );
    expect(first.jobs[0]).toMatchObject({ created: true, propertyId: ids.property });
    expect(duplicate.jobs[0]).toMatchObject({
      created: false,
      jobExecutionId: first.jobs[0]?.jobExecutionId,
    });
    await expect(
      prisma.jobExecution.count({
        where: { propertyId: ids.property, jobType: "storage.media_cleanup" },
      }),
    ).resolves.toBe(1);

    const deleteObject = vi.fn().mockResolvedValue(undefined);
    const cleanupDependencies: MediaCleanupDependencies = {
      database: { mediaAsset: prisma.mediaAsset as never },
      storage: { deleteObject },
      createId: randomUUID,
      now: () => now,
    };
    const mediaCleanupDependencies: MediaCleanupExecutionDependencies = {
      findAsset: (input) =>
        prisma.mediaAsset.findFirst(input) as unknown as Promise<MediaCleanupAsset | null>,
      executeCandidate: (candidate) => executeMediaCleanupCandidate(candidate, cleanupDependencies),
      now: () => now,
    };
    await expect(
      runFeature07JobExecution(first.jobs[0]!.jobExecutionId, dependencies, {
        mediaCleanupDependencies,
      }),
    ).resolves.toMatchObject({ outcome: "SUCCEEDED", attemptNumber: 1 });
    await expect(
      prisma.jobExecution.findUniqueOrThrow({
        where: { id: first.jobs[0]!.jobExecutionId },
        include: { attempts: true },
      }),
    ).resolves.toMatchObject({
      status: "SUCCEEDED",
      attempts: [{ attemptNumber: 1, status: "SUCCEEDED" }],
    });
    await expect(
      prisma.mediaAsset.findUniqueOrThrow({ where: { id: ids.asset } }),
    ).resolves.toMatchObject({ status: "DELETED", deletionAttemptCount: 1 });
    expect(deleteObject).toHaveBeenCalledOnce();
  });

  it("keeps provider failure visible in the cleanup asset, job, and attempt", async () => {
    const mediaAssetId = randomUUID();
    const asset = (await prisma.mediaAsset.create({
      data: {
        id: mediaAssetId,
        propertyId: ids.property,
        createdById: actorId,
        profile: "ATTACHMENT",
        visibility: "PRIVATE",
        sensitivity: "NORMAL",
        durability: "DURABLE",
        storageBucket: "PRIVATE_MEDIA",
        pathFamily: "attachment",
        objectPath: ids.property + "/attachment/" + mediaAssetId + ".pdf",
        displayFilename: "scheduled-cleanup-failure.pdf",
        declaredMimeType: "application/pdf",
        declaredByteSize: 100,
        expectedExtension: "pdf",
        uploadUrlExpiresAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        finalizationDeadlineAt: new Date(now.getTime() - 60 * 60 * 1000),
      },
    })) as unknown as MediaCleanupAsset;
    const dependencies = jobDependencies();
    const scheduled = await scheduleMediaCleanupJobs(
      { scheduleKey: "2026-09-10" },
      {
        findCandidates: vi.fn().mockResolvedValue([asset]),
        jobExecution: dependencies,
      },
    );
    const cleanupDependencies: MediaCleanupDependencies = {
      database: { mediaAsset: prisma.mediaAsset as never },
      storage: {
        deleteObject: vi
          .fn()
          .mockRejectedValue(new MediaStorageProviderError("DELETE", "PROVIDER_FAILURE")),
      },
      createId: randomUUID,
      now: () => now,
    };
    const mediaCleanupDependencies: MediaCleanupExecutionDependencies = {
      findAsset: (input) =>
        prisma.mediaAsset.findFirst(input) as unknown as Promise<MediaCleanupAsset | null>,
      executeCandidate: (candidate) => executeMediaCleanupCandidate(candidate, cleanupDependencies),
      now: () => now,
    };

    await expect(
      runFeature07JobExecution(scheduled.jobs[0]!.jobExecutionId, dependencies, {
        mediaCleanupDependencies,
      }),
    ).resolves.toMatchObject({ outcome: "RETRY_SCHEDULED", attemptNumber: 1 });
    await expect(
      prisma.jobExecution.findUniqueOrThrow({
        where: { id: scheduled.jobs[0]!.jobExecutionId },
        include: { attempts: true },
      }),
    ).resolves.toMatchObject({
      status: "RETRY_SCHEDULED",
      failureCategory: "RETRYABLE_FAILURE",
      attempts: [
        {
          attemptNumber: 1,
          status: "FAILED",
          failureCategory: "RETRYABLE_FAILURE",
        },
      ],
    });
    await expect(
      prisma.mediaAsset.findUniqueOrThrow({ where: { id: mediaAssetId } }),
    ).resolves.toMatchObject({
      status: "DELETION_PENDING",
      lastCleanupFailureCategory: "STORAGE_DELETE_FAILED",
      deletionAttemptCount: 1,
    });
  });
});
