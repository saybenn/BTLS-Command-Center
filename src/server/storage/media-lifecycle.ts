import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import {
  parseMediaUploadDeclaration,
  validateMediaUploadDeclaration,
  type MediaUploadDeclaration,
} from "@/server/storage/file-validation";
import {
  getMediaProfilePolicy,
  mediaProfiles,
  mediaTiming,
  type MediaProfile,
  type MediaStorageBucket,
} from "@/server/storage/media-policy";
import { buildMediaObjectPath } from "@/server/storage/object-path";
import {
  createMediaStorageAdapter,
  type MediaStorageAdapter,
  type MediaStorageObject,
  type SignedMediaUpload,
} from "@/server/storage/supabase-storage";

const mediaAssetIdSchema = z.string().uuid();
const mediaProfileSchema = z.enum(mediaProfiles);
const mediaSensitivitySchema = z.enum(["NORMAL", "SENSITIVE"]);

type MediaDatabaseBucket =
  "PUBLIC_MEDIA" | "PUBLIC_CONTENT" | "PRIVATE_MEDIA" | "TEMPORARY_UPLOADS";
type MediaAssetStatus = "PENDING_UPLOAD" | "READY" | "DELETION_PENDING" | "DELETED";

type MediaAssetRecord = {
  id: string;
  propertyId: string;
  createdById: string | null;
  replacesAssetId: string | null;
  profile: MediaProfile;
  visibility: "PUBLIC" | "PRIVATE";
  sensitivity: "NORMAL" | "SENSITIVE";
  durability: "DURABLE" | "TEMPORARY";
  storageBucket: MediaDatabaseBucket;
  pathFamily: string;
  targetKey: string | null;
  objectPath: string;
  displayFilename: string;
  declaredMimeType: string;
  declaredByteSize: number;
  expectedExtension: string;
  status: MediaAssetStatus;
  uploadUrlExpiresAt: Date;
  finalizationDeadlineAt: Date;
  finalizedAt: Date | null;
  expiresAt: Date | null;
  removedAt: Date | null;
  cleanupEligibleAt: Date | null;
  deletionClaimId: string | null;
  storageObjectId: string | null;
  storageObjectVersion: string | null;
  storageEtag: string | null;
};

type MediaAssetRepository = {
  create: (input: { data: Record<string, unknown> }) => Promise<MediaAssetRecord>;
  findFirst: (input: { where: Record<string, unknown> }) => Promise<MediaAssetRecord | null>;
  updateMany: (input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

export type MediaLifecycleDependencies = {
  database: { mediaAsset: MediaAssetRepository };
  storage: MediaStorageAdapter;
  createId: () => string;
  now: () => Date;
};

export type MediaUploadReservation = {
  mediaAssetId: string;
  objectPath: string;
  upload: SignedMediaUpload;
  uploadUrlExpiresAt: Date;
  finalizationDeadlineAt: Date;
};

export class MediaLifecycleError extends Error {
  constructor(
    readonly code:
      | "ACCESS_DENIED"
      | "ASSET_NOT_FOUND"
      | "INVALID_STATE"
      | "FINALIZATION_EXPIRED"
      | "OBJECT_NOT_FOUND"
      | "OBJECT_INVALID"
      | "DELETION_CLAIMED"
      | "RECOVERY_REQUIRES_NEW_RESERVATION",
  ) {
    super(
      code === "ACCESS_DENIED" || code === "ASSET_NOT_FOUND"
        ? "This media asset is unavailable."
        : "This media upload cannot continue.",
    );
    this.name = "MediaLifecycleError";
  }
}

const providerBucketByDatabaseBucket: Record<MediaDatabaseBucket, MediaStorageBucket> = {
  PUBLIC_MEDIA: "public-media",
  PUBLIC_CONTENT: "public-content",
  PRIVATE_MEDIA: "private-media",
  TEMPORARY_UPLOADS: "temporary-uploads",
};

const databaseBucketByProviderBucket: Record<MediaStorageBucket, MediaDatabaseBucket> = {
  "public-media": "PUBLIC_MEDIA",
  "public-content": "PUBLIC_CONTENT",
  "private-media": "PRIVATE_MEDIA",
  "temporary-uploads": "TEMPORARY_UPLOADS",
};

export function createMediaLifecycleDependencies(): MediaLifecycleDependencies {
  return {
    database: {
      mediaAsset: new Proxy({} as MediaAssetRepository, {
        get(_target, property) {
          return async (...argumentsList: unknown[]) => {
            const { prisma } = await import("@/server/database/prisma");
            const delegate = prisma.mediaAsset as unknown as Record<
              string,
              (...args: unknown[]) => unknown
            >;
            const method = delegate[String(property)];
            return method(...argumentsList);
          };
        },
      }),
    },
    storage: createMediaStorageAdapter(),
    createId: randomUUID,
    now: () => new Date(),
  };
}

function hasMediaManageCapability(context: AuthorizedPropertyContext): boolean {
  return (
    context.capabilities.platform.includes("platform.media.manage") ||
    context.capabilities.property.includes("media.manage")
  );
}

function requireMediaManage(context: AuthorizedPropertyContext, propertyId: string): void {
  if (context.property.id !== propertyId || !hasMediaManageCapability(context)) {
    throw new MediaLifecycleError("ACCESS_DENIED");
  }
}

function parseMediaAssetId(mediaAssetId: string): string {
  const parsed = mediaAssetIdSchema.safeParse(mediaAssetId);
  if (!parsed.success) {
    throw new MediaLifecycleError("ASSET_NOT_FOUND");
  }

  return parsed.data;
}

function addSeconds(now: Date, seconds: number): Date {
  return new Date(now.getTime() + seconds * 1000);
}

function addHours(now: Date, hours: number): Date {
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

function providerBucketForAsset(asset: MediaAssetRecord): MediaStorageBucket {
  return providerBucketByDatabaseBucket[asset.storageBucket];
}

function toReservation(asset: MediaAssetRecord, upload: SignedMediaUpload): MediaUploadReservation {
  return {
    mediaAssetId: asset.id,
    objectPath: asset.objectPath,
    upload,
    uploadUrlExpiresAt: asset.uploadUrlExpiresAt,
    finalizationDeadlineAt: asset.finalizationDeadlineAt,
  };
}

type ReserveMediaUploadInput = {
  propertyId: string;
  profile: MediaProfile;
  declaration: MediaUploadDeclaration;
  targetKey?: string | null;
  replacesAssetId?: string | null;
  sensitivity?: "NORMAL" | "SENSITIVE";
};

async function createReservation(
  context: AuthorizedPropertyContext,
  input: ReserveMediaUploadInput,
  dependencies: MediaLifecycleDependencies,
): Promise<MediaUploadReservation> {
  requireMediaManage(context, input.propertyId);
  validateMediaUploadDeclaration(input.profile, input.declaration);

  const policy = getMediaProfilePolicy(input.profile);
  const sensitivity = input.sensitivity ?? policy.defaultSensitivity;
  if (!policy.allowedSensitivities.includes(sensitivity)) {
    throw new MediaLifecycleError("OBJECT_INVALID");
  }

  const now = dependencies.now();
  const id = dependencies.createId();
  const objectPath = buildMediaObjectPath({
    propertyId: input.propertyId,
    profile: input.profile,
    assetId: id,
    verifiedExtension: input.declaration.extension,
    targetKey: input.targetKey,
  });
  const asset = await dependencies.database.mediaAsset.create({
    data: {
      id,
      propertyId: input.propertyId,
      createdById: context.user.id,
      replacesAssetId: input.replacesAssetId ?? null,
      profile: input.profile,
      visibility: policy.visibility,
      sensitivity,
      durability: policy.durability,
      storageBucket: databaseBucketByProviderBucket[policy.storageBucket],
      pathFamily: policy.pathFamily,
      targetKey: input.targetKey ?? null,
      objectPath,
      displayFilename: input.declaration.displayFilename,
      declaredMimeType: input.declaration.mimeType,
      declaredByteSize: input.declaration.byteSize,
      expectedExtension: input.declaration.extension,
      uploadUrlExpiresAt: addSeconds(now, mediaTiming.signedUploadUrlSeconds),
      finalizationDeadlineAt: addHours(now, mediaTiming.pendingFinalizationHours),
    },
  });

  try {
    const upload = await dependencies.storage.createSignedUpload({
      bucket: policy.storageBucket,
      objectPath,
    });
    return toReservation(asset, upload);
  } catch (error) {
    await dependencies.database.mediaAsset.updateMany({
      where: { id: asset.id, propertyId: input.propertyId, status: "PENDING_UPLOAD" },
      data: {
        lastFailureCategory: "UPLOAD_AUTHORIZATION_FAILED",
        lastFailureAt: dependencies.now(),
        cleanupEligibleAt: dependencies.now(),
      },
    });
    throw error;
  }
}

/**
 * Server-owned generic-library reservation. Its caller selects one product intent; this service
 * maps it to the only two profiles the standalone Media Library is allowed to initiate.
 */
export async function reserveLibraryMediaUpload(
  context: AuthorizedPropertyContext,
  input: {
    propertyId: string;
    intent: "CONTENT_IMAGE" | "ATTACHMENT";
    declaration: unknown;
  },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<MediaUploadReservation> {
  return createReservation(
    context,
    {
      propertyId: input.propertyId,
      profile: input.intent,
      declaration: parseMediaUploadDeclaration(input.declaration),
    },
    dependencies,
  );
}

/** Only trusted future owning workflows call this server-only entry point for all six profiles. */
export async function reserveTrustedMediaUpload(
  context: AuthorizedPropertyContext,
  input: {
    propertyId: string;
    profile: unknown;
    declaration: unknown;
    targetKey?: string | null;
    sensitivity?: unknown;
  },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<MediaUploadReservation> {
  const profile = mediaProfileSchema.safeParse(input.profile);
  if (!profile.success) {
    throw new MediaLifecycleError("OBJECT_INVALID");
  }

  const sensitivity =
    input.sensitivity === undefined
      ? undefined
      : mediaSensitivitySchema.safeParse(input.sensitivity);
  if (sensitivity !== undefined && !sensitivity.success) {
    throw new MediaLifecycleError("OBJECT_INVALID");
  }

  return createReservation(
    context,
    {
      propertyId: input.propertyId,
      profile: profile.data,
      declaration: parseMediaUploadDeclaration(input.declaration),
      targetKey: input.targetKey,
      sensitivity: sensitivity?.data,
    },
    dependencies,
  );
}

async function findPropertyAsset(
  context: AuthorizedPropertyContext,
  propertyId: string,
  mediaAssetId: string,
  dependencies: MediaLifecycleDependencies,
): Promise<MediaAssetRecord> {
  requireMediaManage(context, propertyId);
  const asset = await dependencies.database.mediaAsset.findFirst({
    where: { id: parseMediaAssetId(mediaAssetId), propertyId },
  });

  if (!asset) {
    throw new MediaLifecycleError("ASSET_NOT_FOUND");
  }

  return asset;
}

async function markFinalizationFailure(
  asset: MediaAssetRecord,
  category: string,
  dependencies: MediaLifecycleDependencies,
): Promise<void> {
  const now = dependencies.now();
  await dependencies.database.mediaAsset.updateMany({
    where: { id: asset.id, propertyId: asset.propertyId, status: "PENDING_UPLOAD" },
    data: {
      finalizationAttemptCount: { increment: 1 },
      lastFinalizationAttemptAt: now,
      lastFailureCategory: category,
      lastFailureAt: now,
      cleanupEligibleAt: now,
    },
  });
}

function validateFinalizedObject(
  asset: MediaAssetRecord,
  object: MediaStorageObject,
): asserts object is MediaStorageObject & {
  byteSize: number;
  mimeType: string;
  etag: string;
} {
  if (
    object.name !== asset.objectPath ||
    object.byteSize === undefined ||
    object.byteSize !== asset.declaredByteSize ||
    object.mimeType === undefined ||
    object.etag === undefined ||
    !object.objectId ||
    !object.version
  ) {
    throw new MediaLifecycleError("OBJECT_INVALID");
  }

  validateMediaUploadDeclaration(asset.profile, {
    displayFilename: asset.displayFilename,
    mimeType: object.mimeType,
    byteSize: object.byteSize,
    extension: asset.expectedExtension,
  });
}

export async function finalizeMediaUpload(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; mediaAssetId: string },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<MediaAssetRecord> {
  const asset = await findPropertyAsset(
    context,
    input.propertyId,
    input.mediaAssetId,
    dependencies,
  );

  if (asset.status === "READY") {
    return asset;
  }
  if (asset.status === "DELETION_PENDING" || asset.status === "DELETED") {
    throw new MediaLifecycleError("DELETION_CLAIMED");
  }
  if (asset.status !== "PENDING_UPLOAD") {
    throw new MediaLifecycleError("INVALID_STATE");
  }
  if (asset.finalizationDeadlineAt <= dependencies.now()) {
    await markFinalizationFailure(asset, "FINALIZATION_EXPIRED", dependencies);
    throw new MediaLifecycleError("FINALIZATION_EXPIRED");
  }

  const object = await dependencies.storage.inspectObject({
    bucket: providerBucketForAsset(asset),
    objectPath: asset.objectPath,
  });
  if (!object) {
    await markFinalizationFailure(asset, "OBJECT_NOT_FOUND", dependencies);
    throw new MediaLifecycleError("OBJECT_NOT_FOUND");
  }

  try {
    validateFinalizedObject(asset, object);
  } catch {
    await markFinalizationFailure(asset, "OBJECT_INVALID", dependencies);
    throw new MediaLifecycleError("OBJECT_INVALID");
  }

  const finalizedAt = dependencies.now();
  const policy = getMediaProfilePolicy(asset.profile);
  const transition = await dependencies.database.mediaAsset.updateMany({
    where: {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "PENDING_UPLOAD",
    },
    data: {
      status: "READY",
      verifiedMimeType: object.mimeType,
      verifiedByteSize: object.byteSize,
      verifiedExtension: asset.expectedExtension,
      storageObjectId: object.objectId,
      storageObjectVersion: object.version,
      storageEtag: object.etag,
      finalizedAt,
      expiresAt:
        policy.durability === "TEMPORARY"
          ? addHours(finalizedAt, mediaTiming.temporaryAssetHours)
          : null,
      finalizationAttemptCount: { increment: 1 },
      lastFinalizationAttemptAt: finalizedAt,
      lastFailureCategory: null,
      lastFailureAt: null,
    },
  });

  if (transition.count === 1) {
    return {
      ...asset,
      status: "READY",
      finalizedAt,
      expiresAt:
        policy.durability === "TEMPORARY"
          ? addHours(finalizedAt, mediaTiming.temporaryAssetHours)
          : null,
      storageObjectId: object.objectId,
      storageObjectVersion: object.version,
      storageEtag: object.etag,
    };
  }

  const current = await dependencies.database.mediaAsset.findFirst({
    where: { id: asset.id, propertyId: asset.propertyId },
  });
  if (current?.status === "READY") {
    return current;
  }
  if (current?.status === "DELETION_PENDING" || current?.status === "DELETED") {
    throw new MediaLifecycleError("DELETION_CLAIMED");
  }
  throw new MediaLifecycleError("INVALID_STATE");
}

export async function reserveMediaReplacement(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; replacesMediaAssetId: string; declaration: unknown },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<MediaUploadReservation> {
  const priorAsset = await findPropertyAsset(
    context,
    input.propertyId,
    input.replacesMediaAssetId,
    dependencies,
  );
  if (priorAsset.status !== "READY") {
    throw new MediaLifecycleError("INVALID_STATE");
  }

  return createReservation(
    context,
    {
      propertyId: input.propertyId,
      profile: priorAsset.profile,
      declaration: parseMediaUploadDeclaration(input.declaration),
      targetKey: priorAsset.targetKey,
      replacesAssetId: priorAsset.id,
    },
    dependencies,
  );
}

export async function refreshPendingMediaUpload(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; mediaAssetId: string },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<MediaUploadReservation> {
  const asset = await findPropertyAsset(
    context,
    input.propertyId,
    input.mediaAssetId,
    dependencies,
  );
  if (asset.status !== "PENDING_UPLOAD") {
    throw new MediaLifecycleError("INVALID_STATE");
  }
  if (asset.finalizationDeadlineAt <= dependencies.now()) {
    await markFinalizationFailure(asset, "FINALIZATION_EXPIRED", dependencies);
    throw new MediaLifecycleError("FINALIZATION_EXPIRED");
  }

  const object = await dependencies.storage.inspectObject({
    bucket: providerBucketForAsset(asset),
    objectPath: asset.objectPath,
  });
  if (object) {
    throw new MediaLifecycleError("RECOVERY_REQUIRES_NEW_RESERVATION");
  }

  const upload = await dependencies.storage.createSignedUpload({
    bucket: providerBucketForAsset(asset),
    objectPath: asset.objectPath,
  });
  return toReservation(asset, upload);
}

export async function recoverMediaUploadWithNewReservation(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; mediaAssetId: string },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<MediaUploadReservation> {
  const asset = await findPropertyAsset(
    context,
    input.propertyId,
    input.mediaAssetId,
    dependencies,
  );
  if (asset.status !== "PENDING_UPLOAD") {
    throw new MediaLifecycleError("INVALID_STATE");
  }

  const now = dependencies.now();
  await dependencies.database.mediaAsset.updateMany({
    where: { id: asset.id, propertyId: asset.propertyId, status: "PENDING_UPLOAD" },
    data: {
      lastFailureCategory: "UPLOAD_RECOVERY_REPLACED",
      lastFailureAt: now,
      cleanupEligibleAt: now,
    },
  });

  return createReservation(
    context,
    {
      propertyId: asset.propertyId,
      profile: asset.profile,
      declaration: {
        displayFilename: asset.displayFilename,
        mimeType: asset.declaredMimeType,
        byteSize: asset.declaredByteSize,
        extension: asset.expectedExtension,
      },
      targetKey: asset.targetKey,
    },
    dependencies,
  );
}

export async function removeMediaFromLibrary(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; mediaAssetId: string },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<void> {
  const asset = await findPropertyAsset(
    context,
    input.propertyId,
    input.mediaAssetId,
    dependencies,
  );
  if (asset.status !== "READY") {
    throw new MediaLifecycleError("INVALID_STATE");
  }

  await dependencies.database.mediaAsset.updateMany({
    where: { id: asset.id, propertyId: asset.propertyId, status: "READY", removedAt: null },
    data: { removedAt: dependencies.now() },
  });
}

export async function restoreMediaToLibrary(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; mediaAssetId: string },
  dependencies: MediaLifecycleDependencies = createMediaLifecycleDependencies(),
): Promise<void> {
  const asset = await findPropertyAsset(
    context,
    input.propertyId,
    input.mediaAssetId,
    dependencies,
  );
  if (asset.status !== "READY") {
    throw new MediaLifecycleError("INVALID_STATE");
  }

  await dependencies.database.mediaAsset.updateMany({
    where: {
      id: asset.id,
      propertyId: asset.propertyId,
      status: "READY",
      removedAt: { not: null },
    },
    data: { removedAt: null },
  });
}
