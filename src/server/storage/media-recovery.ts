import "server-only";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import type { MediaStorageAdapter } from "@/server/storage/supabase-storage";
import { createMediaStorageAdapter } from "@/server/storage/supabase-storage";

type MediaStorageBucket = "public-media" | "public-content" | "private-media" | "temporary-uploads";
type MediaDatabaseBucket =
  "PUBLIC_MEDIA" | "PUBLIC_CONTENT" | "PRIVATE_MEDIA" | "TEMPORARY_UPLOADS";

type PendingMediaAsset = {
  id: string;
  propertyId: string;
  profile:
    | "ATTACHMENT"
    | "CONTENT_IMAGE"
    | "BRAND_IMAGE"
    | "EVIDENCE"
    | "GENERATED_DOCUMENT"
    | "TEMPORARY_INPUT";
  sensitivity: "NORMAL" | "SENSITIVE";
  status: "PENDING_UPLOAD" | "DELETION_PENDING" | "DELETED" | "READY";
  storageBucket: MediaDatabaseBucket;
  objectPath: string;
  displayFilename: string;
  declaredMimeType: string;
  declaredByteSize: number;
  finalizationDeadlineAt: Date;
  createdAt: Date;
};

type PendingMediaRepository = {
  findMany: (input: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc" | "desc">;
  }) => Promise<PendingMediaAsset[]>;
};

export type MediaRecoveryDependencies = {
  database: { mediaAsset: PendingMediaRepository };
  storage: Pick<MediaStorageAdapter, "inspectObject">;
  now: () => Date;
};

export type MediaLibraryPendingUpload = {
  byteSize: number;
  displayFilename: string;
  finalizationDeadlineAt: Date;
  mediaAssetId: string;
  mimeType: string;
  profile: "ATTACHMENT" | "CONTENT_IMAGE";
  recoveryState: "FINALIZE" | "RESTART" | "EXPIRED" | "UNAVAILABLE";
};

const providerBucketByDatabaseBucket: Record<MediaDatabaseBucket, MediaStorageBucket> = {
  PUBLIC_MEDIA: "public-media",
  PUBLIC_CONTENT: "public-content",
  PRIVATE_MEDIA: "private-media",
  TEMPORARY_UPLOADS: "temporary-uploads",
};

export function createMediaRecoveryDependencies(): MediaRecoveryDependencies {
  const database = new Proxy({} as MediaRecoveryDependencies["database"], {
    get(_target, model) {
      return new Proxy({} as PendingMediaRepository, {
        get(_delegateTarget, method) {
          return async (...argumentsList: unknown[]) => {
            const { prisma } = await import("@/server/database/prisma");
            const delegate = prisma[model as "mediaAsset"] as unknown as Record<
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

function requireMediaView(context: AuthorizedPropertyContext, propertyId: string) {
  if (
    context.property.id !== propertyId ||
    (!context.capabilities.platform.includes("platform.media.view") &&
      !context.capabilities.property.includes("media.view"))
  ) {
    throw new Error("This media asset is unavailable.");
  }
}

export async function listMediaLibraryPendingUploads(
  context: AuthorizedPropertyContext,
  input: { propertyId: string },
  dependencies: MediaRecoveryDependencies = createMediaRecoveryDependencies(),
): Promise<MediaLibraryPendingUpload[]> {
  requireMediaView(context, input.propertyId);
  const now = dependencies.now();
  const assets = await dependencies.database.mediaAsset.findMany({
    where: {
      propertyId: input.propertyId,
      profile: { in: ["CONTENT_IMAGE", "ATTACHMENT"] },
      sensitivity: "NORMAL",
      status: "PENDING_UPLOAD",
    },
    orderBy: { createdAt: "desc" },
  });

  const recovery = await Promise.all(
    assets.map(async (asset) => {
      if (
        asset.propertyId !== input.propertyId ||
        asset.sensitivity !== "NORMAL" ||
        asset.status !== "PENDING_UPLOAD" ||
        (asset.profile !== "CONTENT_IMAGE" && asset.profile !== "ATTACHMENT")
      ) {
        return null;
      }
      if (asset.finalizationDeadlineAt <= now) {
        return {
          byteSize: asset.declaredByteSize,
          displayFilename: asset.displayFilename,
          finalizationDeadlineAt: asset.finalizationDeadlineAt,
          mediaAssetId: asset.id,
          mimeType: asset.declaredMimeType,
          profile: asset.profile,
          recoveryState: "EXPIRED" as const,
        };
      }

      let object;
      try {
        object = await dependencies.storage.inspectObject({
          bucket: providerBucketByDatabaseBucket[asset.storageBucket],
          objectPath: asset.objectPath,
        });
      } catch {
        return {
          byteSize: asset.declaredByteSize,
          displayFilename: asset.displayFilename,
          finalizationDeadlineAt: asset.finalizationDeadlineAt,
          mediaAssetId: asset.id,
          mimeType: asset.declaredMimeType,
          profile: asset.profile,
          recoveryState: "UNAVAILABLE" as const,
        };
      }
      return {
        byteSize: asset.declaredByteSize,
        displayFilename: asset.displayFilename,
        finalizationDeadlineAt: asset.finalizationDeadlineAt,
        mediaAssetId: asset.id,
        mimeType: asset.declaredMimeType,
        profile: asset.profile,
        recoveryState: object ? ("FINALIZE" as const) : ("RESTART" as const),
      };
    }),
  );
  return recovery.filter((upload): upload is MediaLibraryPendingUpload => upload !== null);
}
