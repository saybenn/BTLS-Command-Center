import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { mediaTiming, type MediaProfile, type MediaStorageBucket } from "./media-policy";
import {
  createMediaStorageAdapter,
  MediaStorageProviderError,
  type MediaStorageAdapter,
} from "./supabase-storage";

type MediaDatabaseBucket =
  "PUBLIC_MEDIA" | "PUBLIC_CONTENT" | "PRIVATE_MEDIA" | "TEMPORARY_UPLOADS";
type MediaAssetStatus = "PENDING_UPLOAD" | "READY" | "DELETION_PENDING" | "DELETED";

export type MediaCleanupAsset = {
  id: string;
  propertyId: string;
  profile: MediaProfile;
  durability: "DURABLE" | "TEMPORARY";
  storageBucket: MediaDatabaseBucket;
  objectPath: string;
  status: MediaAssetStatus;
  finalizationDeadlineAt: Date;
  finalizedAt: Date | null;
  expiresAt: Date | null;
  cleanupEligibleAt: Date | null;
  deletionClaimId: string | null;
  deletionLeaseExpiresAt: Date | null;
  createdAt: Date;
};

type MediaAssetCleanupRepository = {
  findFirst: (input: { where: Record<string, unknown> }) => Promise<MediaCleanupAsset | null>;
  findMany: (input: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc" | "desc">;
    take: number;
  }) => Promise<MediaCleanupAsset[]>;
  updateMany: (input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

export type MediaCleanupDependencies = {
  database: { mediaAsset: MediaAssetCleanupRepository };
  storage: Pick<MediaStorageAdapter, "deleteObject">;
  createId: () => string;
  now: () => Date;
};

export type MediaCleanupEligibility =
  | { eligible: true; reason: "ABANDONED_UPLOAD" | "EXPLICITLY_RELEASED" | "EXPIRED_TEMPORARY" }
  | { eligible: false; reason: "NOT_READY_FOR_CLEANUP" | "RETAINED_DURABLE" };

export type MediaCleanupOutcome =
  | "DRY_RUN_ELIGIBLE"
  | "SKIPPED_CLAIM_RACE"
  | "SKIPPED_NO_LONGER_ELIGIBLE"
  | "DELETED"
  | "DELETED_OBJECT_ALREADY_MISSING"
  | "RETRY_SCHEDULED";

export type MediaCleanupResult = {
  mediaAssetId: string;
  outcome: MediaCleanupOutcome;
  reason: MediaCleanupEligibility["reason"] | "STALE_DELETION_CLAIM";
};

export type MediaCleanupRun = {
  dryRun: boolean;
  discovered: number;
  results: MediaCleanupResult[];
};

const cleanupRequestSchema = z.object({
  dryRun: z.boolean().default(true),
  limit: z
    .number()
    .int()
    .min(1)
    .max(mediaTiming.maximumCleanupBatchSize)
    .default(mediaTiming.defaultCleanupBatchSize),
});

const providerBucketByDatabaseBucket: Record<MediaDatabaseBucket, MediaStorageBucket> = {
  PUBLIC_MEDIA: "public-media",
  PUBLIC_CONTENT: "public-content",
  PRIVATE_MEDIA: "private-media",
  TEMPORARY_UPLOADS: "temporary-uploads",
};

export function createMediaCleanupDependencies(): MediaCleanupDependencies {
  return {
    database: {
      mediaAsset: new Proxy({} as MediaAssetCleanupRepository, {
        get(_target, method) {
          return async (...argumentsList: unknown[]) => {
            const { prisma } = await import("@/server/database/prisma");
            const delegate = prisma.mediaAsset as unknown as Record<
              string,
              (...args: unknown[]) => unknown
            >;
            return delegate[String(method)](...argumentsList);
          };
        },
      }),
    },
    storage: createMediaStorageAdapter(),
    createId: randomUUID,
    now: () => new Date(),
  };
}

function addMinutes(now: Date, minutes: number): Date {
  return new Date(now.getTime() + minutes * 60 * 1000);
}

function providerBucketForAsset(asset: MediaCleanupAsset): MediaStorageBucket {
  return providerBucketByDatabaseBucket[asset.storageBucket];
}

/**
 * An orphan in Feature 06 is an unfinalized reservation whose server-owned finalization window
 * ended. There are intentionally no generic owning-record relations to infer orphanhood for a
 * finalized durable asset; those records remain protected until an owning feature explicitly
 * makes them cleanup eligible.
 */
export function evaluateMediaCleanupEligibility(
  asset: MediaCleanupAsset,
  now: Date,
): MediaCleanupEligibility {
  if (asset.cleanupEligibleAt !== null && asset.cleanupEligibleAt <= now) {
    return { eligible: true, reason: "EXPLICITLY_RELEASED" };
  }
  if (asset.finalizedAt === null && asset.finalizationDeadlineAt <= now) {
    return { eligible: true, reason: "ABANDONED_UPLOAD" };
  }
  if (asset.durability === "TEMPORARY" && asset.expiresAt !== null && asset.expiresAt <= now) {
    return { eligible: true, reason: "EXPIRED_TEMPORARY" };
  }
  return {
    eligible: false,
    reason: asset.durability === "DURABLE" ? "RETAINED_DURABLE" : "NOT_READY_FOR_CLEANUP",
  };
}

function candidateWhere(now: Date): Record<string, unknown> {
  return {
    OR: [
      {
        status: "PENDING_UPLOAD",
        OR: [{ cleanupEligibleAt: { lte: now } }, { finalizationDeadlineAt: { lte: now } }],
      },
      {
        status: "READY",
        OR: [
          { cleanupEligibleAt: { lte: now } },
          { durability: "TEMPORARY", expiresAt: { lte: now } },
        ],
      },
      { status: "DELETION_PENDING", deletionLeaseExpiresAt: { lte: now } },
    ],
  };
}

export async function findMediaCleanupCandidates(
  input: { limit?: number } = {},
  dependencies: MediaCleanupDependencies = createMediaCleanupDependencies(),
): Promise<MediaCleanupAsset[]> {
  const { limit } = cleanupRequestSchema.parse({ ...input, dryRun: true });
  return dependencies.database.mediaAsset.findMany({
    where: candidateWhere(dependencies.now()),
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

function claimWhere(asset: MediaCleanupAsset, now: Date): Record<string, unknown> {
  if (asset.status === "DELETION_PENDING") {
    return {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "DELETION_PENDING",
      deletionLeaseExpiresAt: { lte: now },
    };
  }
  if (asset.status === "PENDING_UPLOAD") {
    return {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "PENDING_UPLOAD",
      OR: [{ cleanupEligibleAt: { lte: now } }, { finalizationDeadlineAt: { lte: now } }],
    };
  }
  return {
    id: asset.id,
    propertyId: asset.propertyId,
    status: "READY",
    OR: [{ cleanupEligibleAt: { lte: now } }, { durability: "TEMPORARY", expiresAt: { lte: now } }],
  };
}

async function claimMediaCleanup(
  asset: MediaCleanupAsset,
  dependencies: MediaCleanupDependencies,
): Promise<{ claimId: string; claimedAt: Date } | null> {
  const claimedAt = dependencies.now();
  const claimId = dependencies.createId();
  const update = await dependencies.database.mediaAsset.updateMany({
    where: claimWhere(asset, claimedAt),
    data: {
      status: "DELETION_PENDING",
      deletionClaimId: claimId,
      deletionClaimedAt: claimedAt,
      deletionLeaseExpiresAt: addMinutes(claimedAt, mediaTiming.cleanupLeaseMinutes),
      deletionAttemptCount: { increment: 1 },
    },
  });
  return update.count === 1 ? { claimId, claimedAt } : null;
}

async function getClaimedAsset(
  asset: MediaCleanupAsset,
  claimId: string,
  dependencies: MediaCleanupDependencies,
): Promise<MediaCleanupAsset | null> {
  return dependencies.database.mediaAsset.findFirst({
    where: {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "DELETION_PENDING",
      deletionClaimId: claimId,
    },
  });
}

async function releaseNoLongerEligibleClaim(
  asset: MediaCleanupAsset,
  claimId: string,
  now: Date,
  dependencies: MediaCleanupDependencies,
): Promise<void> {
  await dependencies.database.mediaAsset.updateMany({
    where: {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "DELETION_PENDING",
      deletionClaimId: claimId,
    },
    data: {
      status: asset.finalizedAt === null ? "PENDING_UPLOAD" : "READY",
      deletionClaimId: null,
      deletionClaimedAt: null,
      deletionLeaseExpiresAt: null,
      lastCleanupFailureCategory: "CLEANUP_NO_LONGER_ELIGIBLE",
      lastCleanupFailureAt: now,
    },
  });
}

async function markCleanupDeleted(
  asset: MediaCleanupAsset,
  claimId: string,
  now: Date,
  dependencies: MediaCleanupDependencies,
): Promise<void> {
  await dependencies.database.mediaAsset.updateMany({
    where: {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "DELETION_PENDING",
      deletionClaimId: claimId,
    },
    data: {
      status: "DELETED",
      deletedAt: now,
      deletionLeaseExpiresAt: null,
      lastCleanupFailureCategory: null,
      lastCleanupFailureAt: null,
    },
  });
}

async function recordCleanupFailure(
  asset: MediaCleanupAsset,
  claimId: string,
  now: Date,
  dependencies: MediaCleanupDependencies,
): Promise<void> {
  await dependencies.database.mediaAsset.updateMany({
    where: {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "DELETION_PENDING",
      deletionClaimId: claimId,
    },
    data: {
      deletionLeaseExpiresAt: addMinutes(now, mediaTiming.cleanupLeaseMinutes),
      lastCleanupFailureCategory: "STORAGE_DELETE_FAILED",
      lastCleanupFailureAt: now,
    },
  });
}

function isMissingStorageObject(error: unknown): boolean {
  return error instanceof MediaStorageProviderError && error.kind === "OBJECT_NOT_FOUND";
}

export async function executeMediaCleanupCandidate(
  candidate: MediaCleanupAsset,
  dependencies: MediaCleanupDependencies = createMediaCleanupDependencies(),
): Promise<MediaCleanupResult> {
  const initialEligibility = evaluateMediaCleanupEligibility(candidate, dependencies.now());
  const initialReason =
    initialEligibility.eligible || candidate.status !== "DELETION_PENDING"
      ? initialEligibility.reason
      : "STALE_DELETION_CLAIM";
  const claim = await claimMediaCleanup(candidate, dependencies);
  if (!claim) {
    return { mediaAssetId: candidate.id, outcome: "SKIPPED_CLAIM_RACE", reason: initialReason };
  }

  // Candidate discovery is advisory. Re-read the claimed row immediately before deletion.
  const claimedAsset = await getClaimedAsset(candidate, claim.claimId, dependencies);
  if (!claimedAsset) {
    return { mediaAssetId: candidate.id, outcome: "SKIPPED_CLAIM_RACE", reason: initialReason };
  }
  const eligibility = evaluateMediaCleanupEligibility(claimedAsset, dependencies.now());
  if (!eligibility.eligible) {
    await releaseNoLongerEligibleClaim(
      claimedAsset,
      claim.claimId,
      dependencies.now(),
      dependencies,
    );
    return {
      mediaAssetId: candidate.id,
      outcome: "SKIPPED_NO_LONGER_ELIGIBLE",
      reason: eligibility.reason,
    };
  }

  try {
    await dependencies.storage.deleteObject({
      bucket: providerBucketForAsset(claimedAsset),
      objectPath: claimedAsset.objectPath,
    });
  } catch (error) {
    if (isMissingStorageObject(error)) {
      await markCleanupDeleted(claimedAsset, claim.claimId, dependencies.now(), dependencies);
      return {
        mediaAssetId: candidate.id,
        outcome: "DELETED_OBJECT_ALREADY_MISSING",
        reason: eligibility.reason,
      };
    }
    await recordCleanupFailure(claimedAsset, claim.claimId, dependencies.now(), dependencies);
    return { mediaAssetId: candidate.id, outcome: "RETRY_SCHEDULED", reason: eligibility.reason };
  }

  await markCleanupDeleted(claimedAsset, claim.claimId, dependencies.now(), dependencies);
  return { mediaAssetId: candidate.id, outcome: "DELETED", reason: eligibility.reason };
}

export async function runMediaCleanup(
  input: { dryRun?: boolean; limit?: number } = {},
  dependencies: MediaCleanupDependencies = createMediaCleanupDependencies(),
): Promise<MediaCleanupRun> {
  const request = cleanupRequestSchema.parse(input);
  const candidates = await findMediaCleanupCandidates({ limit: request.limit }, dependencies);
  if (request.dryRun) {
    return {
      dryRun: true,
      discovered: candidates.length,
      results: candidates.flatMap((candidate) => {
        const eligibility = evaluateMediaCleanupEligibility(candidate, dependencies.now());
        return eligibility.eligible
          ? [
              {
                mediaAssetId: candidate.id,
                outcome: "DRY_RUN_ELIGIBLE" as const,
                reason: eligibility.reason,
              },
            ]
          : [];
      }),
    };
  }

  const results: MediaCleanupResult[] = [];
  for (const candidate of candidates) {
    results.push(await executeMediaCleanupCandidate(candidate, dependencies));
  }
  return { dryRun: false, discovered: candidates.length, results };
}
