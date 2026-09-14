import { describe, expect, it, vi } from "vitest";

import {
  MediaCleanupJobRetryableError,
  runScheduledMediaCleanupJob,
  scheduleMediaCleanupJobs,
  scheduledMediaCleanupBatchSize,
} from "@/server/jobs/media-cleanup-job";
import type { JobExecutionDependencies } from "@/server/jobs/job-execution";
import type { MediaCleanupAsset } from "@/server/storage/media-cleanup";

const ids = {
  asset: "20000000-0000-4000-8000-000000000001",
  job: "20000000-0000-4000-8000-000000000002",
  property: "20000000-0000-4000-8000-000000000003",
};
const now = new Date("2026-09-10T12:00:00.000Z");

function candidate(overrides: Partial<MediaCleanupAsset> = {}): MediaCleanupAsset {
  return {
    id: ids.asset,
    propertyId: ids.property,
    profile: "ATTACHMENT",
    durability: "DURABLE",
    storageBucket: "PRIVATE_MEDIA",
    objectPath: ids.property + "/attachment/" + ids.asset + ".pdf",
    status: "PENDING_UPLOAD",
    finalizationDeadlineAt: new Date("2026-09-09T12:00:00.000Z"),
    finalizedAt: null,
    expiresAt: null,
    cleanupEligibleAt: null,
    deletionClaimId: null,
    deletionLeaseExpiresAt: null,
    createdAt: now,
    ...overrides,
  };
}

function schedulingFixture() {
  let record: Record<string, unknown> | null = null;
  const create = vi.fn().mockImplementation(async ({ data }) => {
    if (record) throw { code: "P2002" };
    record = {
      id: ids.job,
      ...data,
      jobVersion: 1,
      status: "QUEUED",
      retryRequestedAt: null,
      startedAt: null,
      finishedAt: null,
      failureCategory: null,
      failureMessage: null,
      failedAt: null,
    };
    return record;
  });
  const findFirst = vi.fn().mockImplementation(async () => record);
  const findCandidates = vi.fn().mockResolvedValue([candidate()]);
  const jobExecution: JobExecutionDependencies["jobExecution"] = {
    create,
    findFirst,
    findMany: vi.fn(),
    updateMany: vi.fn(),
  };
  const jobExecutionAttempt: JobExecutionDependencies["jobExecutionAttempt"] = {
    create: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  };
  const jobDependencies: JobExecutionDependencies = {
    jobExecution,
    jobExecutionAttempt,
    now: () => now,
    transaction: (operation) => operation({ jobExecution, jobExecutionAttempt }),
  };

  return {
    create,
    findCandidates,
    dependencies: {
      findCandidates,
      jobExecution: jobDependencies,
    },
  };
}

describe("Feature 07 scheduled Media cleanup adapter", () => {
  it("discovers only the bounded Feature 06 batch and reuses one durable job", async () => {
    const fixture = schedulingFixture();

    const first = await scheduleMediaCleanupJobs(
      { scheduleKey: "2026-09-10" },
      fixture.dependencies,
    );
    const duplicate = await scheduleMediaCleanupJobs(
      { scheduleKey: "2026-09-10" },
      fixture.dependencies,
    );

    expect(fixture.findCandidates).toHaveBeenCalledWith({
      limit: scheduledMediaCleanupBatchSize,
    });
    expect(first.jobs).toEqual([
      {
        created: true,
        jobExecutionId: ids.job,
        mediaAssetId: ids.asset,
        propertyId: ids.property,
      },
    ]);
    expect(duplicate.jobs[0]).toMatchObject({ created: false, jobExecutionId: ids.job });
    expect(fixture.create).toHaveBeenCalledTimes(2);
    expect(fixture.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        propertyId: ids.property,
        jobType: "storage.media_cleanup",
        correlationId: ids.asset,
        idempotencyKey: "media-cleanup:" + ids.asset + ":2026-09-10",
        safePayload: {
          propertyId: ids.property,
          correlationId: ids.asset,
          idempotencyKey: "media-cleanup:" + ids.asset + ":2026-09-10",
          mediaAssetId: ids.asset,
        },
      }),
    });
  });

  it("loads the exact property asset and delegates deletion behavior to Feature 06", async () => {
    const asset = candidate();
    const findAsset = vi.fn().mockResolvedValue(asset);
    const executeCandidate = vi.fn().mockResolvedValue({
      mediaAssetId: asset.id,
      outcome: "DELETED",
      reason: "ABANDONED_UPLOAD",
    });

    await expect(
      runScheduledMediaCleanupJob(
        {
          propertyId: ids.property,
          correlationId: ids.asset,
          idempotencyKey: "media-cleanup:" + ids.asset,
          mediaAssetId: ids.asset,
        },
        { findAsset, executeCandidate },
      ),
    ).resolves.toBe("DELETED");
    expect(findAsset).toHaveBeenCalledWith({
      where: { id: ids.asset, propertyId: ids.property },
    });
    expect(executeCandidate).toHaveBeenCalledWith(asset);
  });

  it("converts only Feature 06 retry outcomes into a retryable job failure", async () => {
    await expect(
      runScheduledMediaCleanupJob(
        {
          propertyId: ids.property,
          correlationId: ids.asset,
          idempotencyKey: "media-cleanup:" + ids.asset,
          mediaAssetId: ids.asset,
        },
        {
          findAsset: vi.fn().mockResolvedValue(candidate()),
          executeCandidate: vi.fn().mockResolvedValue({
            mediaAssetId: ids.asset,
            outcome: "RETRY_SCHEDULED",
            reason: "ABANDONED_UPLOAD",
          }),
        },
      ),
    ).rejects.toMatchObject({
      failureCategory: "STORAGE_DELETE_FAILED",
    });
  });

  it("keeps an active Feature 06 deletion claim visible as retryable work", async () => {
    await expect(
      runScheduledMediaCleanupJob(
        {
          propertyId: ids.property,
          correlationId: ids.asset,
          idempotencyKey: "media-cleanup:" + ids.asset,
          mediaAssetId: ids.asset,
        },
        {
          findAsset: vi.fn().mockResolvedValue(candidate()),
          executeCandidate: vi.fn().mockResolvedValue({
            mediaAssetId: ids.asset,
            outcome: "SKIPPED_CLAIM_RACE",
            reason: "ABANDONED_UPLOAD",
          }),
        },
      ),
    ).rejects.toEqual(
      expect.objectContaining<Partial<MediaCleanupJobRetryableError>>({
        failureCategory: "MEDIA_CLEANUP_CLAIM_UNAVAILABLE",
      }),
    );
  });

  it("treats an unavailable asset as an idempotent no-op", async () => {
    const executeCandidate = vi.fn();
    await expect(
      runScheduledMediaCleanupJob(
        {
          propertyId: ids.property,
          correlationId: ids.asset,
          idempotencyKey: "media-cleanup:" + ids.asset,
          mediaAssetId: ids.asset,
        },
        { findAsset: vi.fn().mockResolvedValue(null), executeCandidate },
      ),
    ).resolves.toBe("SKIPPED_UNAVAILABLE");
    expect(executeCandidate).not.toHaveBeenCalled();
  });

  it("uses Feature 06 eligibility to skip an asset finalized before its job starts", async () => {
    const executeCandidate = vi.fn();
    await expect(
      runScheduledMediaCleanupJob(
        {
          propertyId: ids.property,
          correlationId: ids.asset,
          idempotencyKey: "media-cleanup:" + ids.asset,
          mediaAssetId: ids.asset,
        },
        {
          findAsset: vi.fn().mockResolvedValue(
            candidate({
              status: "READY",
              finalizedAt: now,
              finalizationDeadlineAt: new Date("2026-09-11T12:00:00.000Z"),
            }),
          ),
          executeCandidate,
          now: () => now,
        },
      ),
    ).resolves.toBe("SKIPPED_NO_LONGER_ELIGIBLE");
    expect(executeCandidate).not.toHaveBeenCalled();
  });
});
