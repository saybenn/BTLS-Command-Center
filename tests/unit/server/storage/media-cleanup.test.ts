import { describe, expect, it, vi } from "vitest";

import {
  evaluateMediaCleanupEligibility,
  executeMediaCleanupCandidate,
  findMediaCleanupCandidates,
  runMediaCleanup,
  type MediaCleanupAsset,
  type MediaCleanupDependencies,
} from "@/server/storage/media-cleanup";
import { MediaStorageProviderError } from "@/server/storage/supabase-storage";

const propertyId = "11111111-1111-4111-8111-111111111111";
const assetId = "22222222-2222-4222-8222-222222222222";
const claimId = "33333333-3333-4333-8333-333333333333";
const now = new Date("2026-08-30T12:00:00.000Z");

function createAsset(overrides: Record<string, unknown> = {}): MediaCleanupAsset {
  return {
    id: assetId,
    propertyId,
    profile: "ATTACHMENT",
    durability: "DURABLE",
    storageBucket: "PRIVATE_MEDIA",
    objectPath: `${propertyId}/attachment/${assetId}.pdf`,
    status: "PENDING_UPLOAD",
    finalizationDeadlineAt: new Date("2026-08-31T12:00:00.000Z"),
    finalizedAt: null,
    expiresAt: null,
    cleanupEligibleAt: null,
    deletionClaimId: null,
    deletionLeaseExpiresAt: null,
    createdAt: now,
    ...overrides,
  };
}

function createDependencies(
  candidate = createAsset({ finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z") }),
  claimedAsset = createAsset({
    finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z"),
    status: "DELETION_PENDING",
    deletionClaimId: claimId,
    deletionLeaseExpiresAt: new Date("2026-08-30T12:10:00.000Z"),
  }),
) {
  const findMany = vi.fn().mockResolvedValue([candidate]);
  const findFirst = vi.fn().mockResolvedValue(claimedAsset);
  const updateMany = vi.fn().mockResolvedValue({ count: 1 });
  const deleteObject = vi.fn().mockResolvedValue(undefined);
  const dependencies = {
    database: { mediaAsset: { findMany, findFirst, updateMany } },
    storage: { deleteObject },
    createId: vi.fn().mockReturnValue(claimId),
    now: () => now,
  } as unknown as MediaCleanupDependencies;

  return { dependencies, findMany, findFirst, updateMany, deleteObject };
}

describe("MediaAsset cleanup eligibility", () => {
  it("identifies expired unfinalized reservations as orphaned, cleanup-eligible uploads", () => {
    expect(
      evaluateMediaCleanupEligibility(
        createAsset({ finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z") }),
        now,
      ),
    ).toEqual({ eligible: true, reason: "ABANDONED_UPLOAD" });
  });

  it("keeps unexpired pending uploads recoverable", () => {
    expect(evaluateMediaCleanupEligibility(createAsset(), now)).toEqual({
      eligible: false,
      reason: "RETAINED_DURABLE",
    });
  });

  it("honors an explicit cleanup release for failed or future owning-feature assets", () => {
    expect(evaluateMediaCleanupEligibility(createAsset({ cleanupEligibleAt: now }), now)).toEqual({
      eligible: true,
      reason: "EXPLICITLY_RELEASED",
    });
  });

  it("identifies a finalized temporary input after its expiry", () => {
    expect(
      evaluateMediaCleanupEligibility(
        createAsset({
          profile: "TEMPORARY_INPUT",
          durability: "TEMPORARY",
          storageBucket: "TEMPORARY_UPLOADS",
          status: "READY",
          finalizedAt: new Date("2026-08-29T10:00:00.000Z"),
          expiresAt: new Date("2026-08-30T11:59:59.000Z"),
        }),
        now,
      ),
    ).toEqual({ eligible: true, reason: "EXPIRED_TEMPORARY" });
  });

  it("protects finalized durable evidence even when it was removed from the library", () => {
    expect(
      evaluateMediaCleanupEligibility(
        createAsset({
          profile: "EVIDENCE",
          status: "READY",
          finalizedAt: new Date("2026-08-29T10:00:00.000Z"),
        }),
        now,
      ),
    ).toEqual({ eligible: false, reason: "RETAINED_DURABLE" });
  });
});

describe("MediaAsset cleanup execution", () => {
  it("discovers a bounded candidate set and leaves dry runs non-destructive", async () => {
    const fixture = createDependencies();

    await expect(runMediaCleanup({ limit: 1 }, fixture.dependencies)).resolves.toEqual({
      dryRun: true,
      discovered: 1,
      results: [{ mediaAssetId: assetId, outcome: "DRY_RUN_ELIGIBLE", reason: "ABANDONED_UPLOAD" }],
    });
    expect(fixture.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ OR: expect.any(Array) }),
      orderBy: { createdAt: "asc" },
      take: 1,
    });
    expect(fixture.updateMany).not.toHaveBeenCalled();
    expect(fixture.deleteObject).not.toHaveBeenCalled();
    await expect(
      findMediaCleanupCandidates({ limit: 101 }, fixture.dependencies),
    ).rejects.toThrow();
  });

  it("re-checks the claimed row, deletes the object, and preserves a DELETED tombstone", async () => {
    const fixture = createDependencies();

    await expect(
      executeMediaCleanupCandidate(
        createAsset({
          finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z"),
        }),
        fixture.dependencies,
      ),
    ).resolves.toEqual({
      mediaAssetId: assetId,
      outcome: "DELETED",
      reason: "ABANDONED_UPLOAD",
    });
    expect(fixture.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({ status: "DELETION_PENDING", deletionClaimId: claimId }),
    });
    expect(fixture.deleteObject).toHaveBeenCalledWith({
      bucket: "private-media",
      objectPath: `${propertyId}/attachment/${assetId}.pdf`,
    });
    expect(fixture.updateMany).toHaveBeenLastCalledWith({
      where: expect.objectContaining({ status: "DELETION_PENDING", deletionClaimId: claimId }),
      data: expect.objectContaining({ status: "DELETED", deletedAt: now }),
    });
  });

  it("treats an already-missing object as a successful idempotent deletion", async () => {
    const fixture = createDependencies();
    fixture.deleteObject.mockRejectedValueOnce(
      new MediaStorageProviderError("DELETE", "OBJECT_NOT_FOUND"),
    );

    await expect(
      executeMediaCleanupCandidate(
        createAsset({ finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z") }),
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({ outcome: "DELETED_OBJECT_ALREADY_MISSING" });
    expect(fixture.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "DELETED" }) }),
    );
  });

  it("records provider failures for retry while retaining the atomic deletion claim", async () => {
    const fixture = createDependencies();
    fixture.deleteObject.mockRejectedValueOnce(
      new MediaStorageProviderError("DELETE", "PROVIDER_FAILURE"),
    );

    await expect(
      executeMediaCleanupCandidate(
        createAsset({ finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z") }),
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({ outcome: "RETRY_SCHEDULED" });
    expect(fixture.updateMany).toHaveBeenLastCalledWith({
      where: expect.objectContaining({ status: "DELETION_PENDING", deletionClaimId: claimId }),
      data: expect.objectContaining({
        lastCleanupFailureCategory: "STORAGE_DELETE_FAILED",
        lastCleanupFailureAt: now,
        deletionLeaseExpiresAt: new Date("2026-08-30T12:10:00.000Z"),
      }),
    });
  });

  it("does not delete when an atomic claim loses a concurrent race", async () => {
    const fixture = createDependencies();
    fixture.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      executeMediaCleanupCandidate(
        createAsset({ finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z") }),
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({ outcome: "SKIPPED_CLAIM_RACE" });
    expect(fixture.findFirst).not.toHaveBeenCalled();
    expect(fixture.deleteObject).not.toHaveBeenCalled();
  });

  it("releases a stale claim when eligibility changed before destructive deletion", async () => {
    const candidate = createAsset({ finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z") });
    const current = createAsset({
      status: "DELETION_PENDING",
      deletionClaimId: claimId,
      deletionLeaseExpiresAt: new Date("2026-08-30T12:10:00.000Z"),
    });
    const fixture = createDependencies(candidate, current);

    await expect(executeMediaCleanupCandidate(candidate, fixture.dependencies)).resolves.toEqual({
      mediaAssetId: assetId,
      outcome: "SKIPPED_NO_LONGER_ELIGIBLE",
      reason: "RETAINED_DURABLE",
    });
    expect(fixture.deleteObject).not.toHaveBeenCalled();
    expect(fixture.updateMany).toHaveBeenLastCalledWith({
      where: expect.objectContaining({ status: "DELETION_PENDING", deletionClaimId: claimId }),
      data: expect.objectContaining({
        status: "PENDING_UPLOAD",
        deletionClaimId: null,
        lastCleanupFailureCategory: "CLEANUP_NO_LONGER_ELIGIBLE",
      }),
    });
  });

  it("is safe to run repeatedly after the deleted tombstone leaves discovery", async () => {
    const fixture = createDependencies();
    fixture.findMany
      .mockResolvedValueOnce([
        createAsset({ finalizationDeadlineAt: new Date("2026-08-29T12:00:00.000Z") }),
      ])
      .mockResolvedValueOnce([]);

    await expect(runMediaCleanup({ dryRun: false }, fixture.dependencies)).resolves.toMatchObject({
      discovered: 1,
      results: [{ outcome: "DELETED" }],
    });
    await expect(runMediaCleanup({ dryRun: false }, fixture.dependencies)).resolves.toEqual({
      dryRun: false,
      discovered: 0,
      results: [],
    });
    expect(fixture.deleteObject).toHaveBeenCalledTimes(1);
  });
});
