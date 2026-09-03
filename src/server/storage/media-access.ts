import "server-only";

import { z } from "zod";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import { mediaTiming, type MediaProfile, type MediaStorageBucket } from "./media-policy";
import { createMediaStorageAdapter, type MediaStorageAdapter } from "./supabase-storage";

const mediaAssetIdSchema = z.string().uuid();
const libraryProfileSchema = z.enum(["CONTENT_IMAGE", "ATTACHMENT"]);

type MediaDatabaseBucket =
  "PUBLIC_MEDIA" | "PUBLIC_CONTENT" | "PRIVATE_MEDIA" | "TEMPORARY_UPLOADS";

type MediaAssetAccessRecord = {
  id: string;
  propertyId: string;
  profile: MediaProfile;
  visibility: "PUBLIC" | "PRIVATE";
  sensitivity: "NORMAL" | "SENSITIVE";
  storageBucket: MediaDatabaseBucket;
  displayFilename: string;
  verifiedMimeType: string | null;
  verifiedByteSize: number | null;
  status: "PENDING_UPLOAD" | "READY" | "DELETION_PENDING" | "DELETED";
  objectPath: string;
  finalizedAt: Date | null;
  removedAt: Date | null;
  createdAt: Date;
};

type MediaAssetAccessRepository = {
  findFirst: (input: { where: Record<string, unknown> }) => Promise<MediaAssetAccessRecord | null>;
  findMany: (input: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc" | "desc">;
  }) => Promise<MediaAssetAccessRecord[]>;
};

type AuditEventRepository = {
  create: (input: { data: Record<string, unknown> }) => Promise<unknown>;
};

export type MediaAccessDependencies = {
  database: {
    mediaAsset: MediaAssetAccessRepository;
    auditEvent: AuditEventRepository;
  };
  storage: Pick<MediaStorageAdapter, "createSignedPrivateDownload" | "getPublicDeliveryUrl">;
  now: () => Date;
};

export type MediaLibraryAsset = {
  mediaAssetId: string;
  profile: "CONTENT_IMAGE" | "ATTACHMENT";
  displayFilename: string;
  mimeType: string;
  byteSize: number;
  finalizedAt: Date;
  createdAt: Date;
  publicDeliveryUrl?: string;
};

export type MediaAssetMetadata = {
  mediaAssetId: string;
  profile: MediaProfile;
  visibility: "PUBLIC" | "PRIVATE";
  sensitivity: "NORMAL" | "SENSITIVE";
  displayFilename: string;
  mimeType: string;
  byteSize: number;
  finalizedAt: Date;
  createdAt: Date;
  publicDeliveryUrl?: string;
};

export type MediaAssetDelivery =
  { kind: "PUBLIC"; url: string } | { kind: "PRIVATE"; url: string; expiresAt: Date };

export class MediaAccessError extends Error {
  constructor(readonly code: "ACCESS_DENIED" | "ASSET_NOT_FOUND" | "ASSET_UNAVAILABLE") {
    super("This media asset is unavailable.");
    this.name = "MediaAccessError";
  }
}

const providerBucketByDatabaseBucket: Record<MediaDatabaseBucket, MediaStorageBucket> = {
  PUBLIC_MEDIA: "public-media",
  PUBLIC_CONTENT: "public-content",
  PRIVATE_MEDIA: "private-media",
  TEMPORARY_UPLOADS: "temporary-uploads",
};

export function createMediaAccessDependencies(): MediaAccessDependencies {
  const database = new Proxy({} as MediaAccessDependencies["database"], {
    get(_target, model) {
      return new Proxy({} as MediaAssetAccessRepository | AuditEventRepository, {
        get(_delegateTarget, method) {
          return async (...argumentsList: unknown[]) => {
            const { prisma } = await import("@/server/database/prisma");
            const delegate = prisma[model as "mediaAsset" | "auditEvent"] as unknown as Record<
              string,
              (...args: unknown[]) => unknown
            >;
            return delegate[String(method)](...argumentsList);
          };
        },
      });
    },
  });

  return { database, storage: createMediaStorageAdapter(), now: () => new Date() };
}

function parseMediaAssetId(mediaAssetId: string): string {
  const result = mediaAssetIdSchema.safeParse(mediaAssetId);
  if (!result.success) throw new MediaAccessError("ASSET_NOT_FOUND");
  return result.data;
}

function requirePropertyContext(context: AuthorizedPropertyContext, propertyId: string): void {
  if (context.property.id !== propertyId) throw new MediaAccessError("ACCESS_DENIED");
}

function hasMediaView(context: AuthorizedPropertyContext): boolean {
  return (
    context.capabilities.platform.includes("platform.media.view") ||
    context.capabilities.property.includes("media.view")
  );
}

function hasSensitiveMediaView(context: AuthorizedPropertyContext): boolean {
  return (
    context.capabilities.platform.includes("platform.media.sensitive.view") ||
    context.capabilities.property.includes("media.sensitive.view")
  );
}

function requireNormalMediaView(context: AuthorizedPropertyContext, propertyId: string): void {
  requirePropertyContext(context, propertyId);
  if (!hasMediaView(context)) throw new MediaAccessError("ACCESS_DENIED");
}

function requireSensitiveMediaView(context: AuthorizedPropertyContext, propertyId: string): void {
  requirePropertyContext(context, propertyId);
  if (!hasSensitiveMediaView(context)) throw new MediaAccessError("ACCESS_DENIED");
}

function bucketForAsset(asset: MediaAssetAccessRecord): MediaStorageBucket {
  return providerBucketByDatabaseBucket[asset.storageBucket];
}

function toSafeMetadata(
  asset: MediaAssetAccessRecord,
  publicDeliveryUrl?: string,
): MediaAssetMetadata {
  if (!asset.verifiedMimeType || asset.verifiedByteSize === null || !asset.finalizedAt) {
    throw new MediaAccessError("ASSET_UNAVAILABLE");
  }

  return {
    mediaAssetId: asset.id,
    profile: asset.profile,
    visibility: asset.visibility,
    sensitivity: asset.sensitivity,
    displayFilename: asset.displayFilename,
    mimeType: asset.verifiedMimeType,
    byteSize: asset.verifiedByteSize,
    finalizedAt: asset.finalizedAt,
    createdAt: asset.createdAt,
    ...(publicDeliveryUrl ? { publicDeliveryUrl } : {}),
  };
}

function publicDeliveryUrlFor(
  asset: MediaAssetAccessRecord,
  storage: MediaAccessDependencies["storage"],
): string | undefined {
  if (asset.visibility !== "PUBLIC") return undefined;
  return storage.getPublicDeliveryUrl({
    bucket: bucketForAsset(asset),
    objectPath: asset.objectPath,
  });
}

async function recordSensitiveAccess(
  context: AuthorizedPropertyContext,
  asset: MediaAssetAccessRecord,
  operation: "metadata" | "private_download",
  dependencies: MediaAccessDependencies,
): Promise<void> {
  await dependencies.database.auditEvent.create({
    data: {
      actorId: context.user.id,
      accountId: context.account.id,
      propertyId: asset.propertyId,
      action: `media_asset.sensitive.${operation}.accessed`,
      subjectType: "MediaAsset",
      subjectId: asset.id,
      metadata: { operation, profile: asset.profile },
    },
  });
}

async function findAvailableAsset(
  propertyId: string,
  mediaAssetId: string,
  dependencies: MediaAccessDependencies,
): Promise<MediaAssetAccessRecord> {
  const asset = await dependencies.database.mediaAsset.findFirst({
    where: {
      id: parseMediaAssetId(mediaAssetId),
      propertyId,
      status: "READY",
      removedAt: null,
    },
  });
  if (!asset) throw new MediaAccessError("ASSET_NOT_FOUND");
  return asset;
}

async function authorizeAssetRead(
  context: AuthorizedPropertyContext,
  propertyId: string,
  mediaAssetId: string,
  dependencies: MediaAccessDependencies,
): Promise<MediaAssetAccessRecord> {
  requirePropertyContext(context, propertyId);
  if (!hasMediaView(context) && !hasSensitiveMediaView(context)) {
    throw new MediaAccessError("ACCESS_DENIED");
  }
  const asset = await findAvailableAsset(propertyId, mediaAssetId, dependencies);
  if (asset.sensitivity === "SENSITIVE") {
    requireSensitiveMediaView(context, propertyId);
  } else {
    requireNormalMediaView(context, propertyId);
  }
  return asset;
}

export async function listMediaLibraryAssets(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; profile: "CONTENT_IMAGE" | "ATTACHMENT" },
  dependencies: MediaAccessDependencies = createMediaAccessDependencies(),
): Promise<MediaLibraryAsset[]> {
  requireNormalMediaView(context, input.propertyId);
  const profile = libraryProfileSchema.parse(input.profile);
  const assets = await dependencies.database.mediaAsset.findMany({
    where: {
      propertyId: input.propertyId,
      profile,
      sensitivity: "NORMAL",
      status: "READY",
      removedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return assets.map((asset) => {
    const metadata = toSafeMetadata(asset, publicDeliveryUrlFor(asset, dependencies.storage));
    return {
      mediaAssetId: metadata.mediaAssetId,
      profile: profile,
      displayFilename: metadata.displayFilename,
      mimeType: metadata.mimeType,
      byteSize: metadata.byteSize,
      finalizedAt: metadata.finalizedAt,
      createdAt: metadata.createdAt,
      ...(metadata.publicDeliveryUrl ? { publicDeliveryUrl: metadata.publicDeliveryUrl } : {}),
    };
  });
}

export async function getMediaAssetMetadata(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; mediaAssetId: string },
  dependencies: MediaAccessDependencies = createMediaAccessDependencies(),
): Promise<MediaAssetMetadata> {
  const asset = await authorizeAssetRead(
    context,
    input.propertyId,
    input.mediaAssetId,
    dependencies,
  );
  if (asset.sensitivity === "SENSITIVE") {
    await recordSensitiveAccess(context, asset, "metadata", dependencies);
  }
  return toSafeMetadata(asset, publicDeliveryUrlFor(asset, dependencies.storage));
}

export async function getMediaAssetDelivery(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; mediaAssetId: string },
  dependencies: MediaAccessDependencies = createMediaAccessDependencies(),
): Promise<MediaAssetDelivery> {
  const asset = await authorizeAssetRead(
    context,
    input.propertyId,
    input.mediaAssetId,
    dependencies,
  );
  const bucket = bucketForAsset(asset);
  if (asset.visibility === "PUBLIC") {
    return {
      kind: "PUBLIC",
      url: dependencies.storage.getPublicDeliveryUrl({ bucket, objectPath: asset.objectPath }),
    };
  }

  const expiresInSeconds =
    asset.sensitivity === "SENSITIVE"
      ? mediaTiming.sensitiveDownloadUrlSeconds
      : mediaTiming.privateDownloadUrlSeconds;
  const url = await dependencies.storage.createSignedPrivateDownload({
    bucket,
    objectPath: asset.objectPath,
    expiresInSeconds,
  });
  if (asset.sensitivity === "SENSITIVE") {
    await recordSensitiveAccess(context, asset, "private_download", dependencies);
  }
  return {
    kind: "PRIVATE",
    url,
    expiresAt: new Date(dependencies.now().getTime() + expiresInSeconds * 1000),
  };
}
