import "server-only";

import { createSupabaseAdminClient } from "@/server/auth/supabase-admin";
import type { MediaStorageBucket } from "@/server/storage/media-policy";

type StorageProviderError = {
  message?: string;
  statusCode?: number | string;
  status?: number | string;
  name?: string;
};

type StorageBucketClient = {
  createSignedUploadUrl: (
    objectPath: string,
    options: { upsert: boolean },
  ) => Promise<{
    data: { signedUrl: string; token: string; path: string } | null;
    error: StorageProviderError | null;
  }>;
  info: (objectPath: string) => Promise<{
    data: {
      id: string;
      version: string;
      name: string;
      size?: number;
      contentType?: string;
      etag?: string;
      lastModified?: string;
    } | null;
    error: StorageProviderError | null;
  }>;
  remove: (objectPaths: string[]) => Promise<{
    data: unknown;
    error: StorageProviderError | null;
  }>;
  getPublicUrl: (objectPath: string) => { data: { publicUrl: string } };
  createSignedUrl: (
    objectPath: string,
    expiresInSeconds: number,
  ) => Promise<{
    data: { signedUrl: string } | null;
    error: StorageProviderError | null;
  }>;
};

type StorageProviderClient = {
  storage: { from: (bucket: string) => StorageBucketClient };
};

export type MediaStorageObject = {
  objectId: string;
  version: string;
  name: string;
  byteSize?: number;
  mimeType?: string;
  etag?: string;
  lastModifiedAt?: string;
};

export type SignedMediaUpload = {
  uploadUrl: string;
  uploadToken: string;
  objectPath: string;
};

export class MediaStorageProviderError extends Error {
  readonly operation: "SIGNED_UPLOAD" | "INSPECT" | "DELETE" | "SIGNED_DOWNLOAD";
  readonly kind: "OBJECT_NOT_FOUND" | "PROVIDER_FAILURE";

  constructor(
    operation: MediaStorageProviderError["operation"],
    kind: MediaStorageProviderError["kind"],
  ) {
    super(
      kind === "OBJECT_NOT_FOUND" ? "The stored file was not found." : "Storage is unavailable.",
    );
    this.name = "MediaStorageProviderError";
    this.operation = operation;
    this.kind = kind;
  }
}

export type MediaStorageAdapter = {
  createSignedUpload(input: {
    bucket: MediaStorageBucket;
    objectPath: string;
  }): Promise<SignedMediaUpload>;
  inspectObject(input: {
    bucket: MediaStorageBucket;
    objectPath: string;
  }): Promise<MediaStorageObject | null>;
  deleteObject(input: { bucket: MediaStorageBucket; objectPath: string }): Promise<void>;
  getPublicDeliveryUrl(input: { bucket: MediaStorageBucket; objectPath: string }): string;
  createSignedPrivateDownload(input: {
    bucket: MediaStorageBucket;
    objectPath: string;
    expiresInSeconds: number;
  }): Promise<string>;
};

export type MediaStorageAdapterDependencies = {
  createClient?: () => StorageProviderClient;
};

const publicBuckets = new Set<MediaStorageBucket>(["public-media", "public-content"]);
const privateBuckets = new Set<MediaStorageBucket>(["private-media", "temporary-uploads"]);

function isObjectNotFound(error: StorageProviderError): boolean {
  return (
    error.statusCode === 404 ||
    error.statusCode === "404" ||
    error.status === 404 ||
    error.status === "404"
  );
}

function normalizeProviderError(
  operation: MediaStorageProviderError["operation"],
  error: StorageProviderError,
): MediaStorageProviderError {
  return new MediaStorageProviderError(
    operation,
    isObjectNotFound(error) ? "OBJECT_NOT_FOUND" : "PROVIDER_FAILURE",
  );
}

function requirePublicBucket(bucket: MediaStorageBucket): void {
  if (!publicBuckets.has(bucket)) {
    throw new Error("A public delivery URL requires a public Media bucket.");
  }
}

function requirePrivateBucket(bucket: MediaStorageBucket): void {
  if (!privateBuckets.has(bucket)) {
    throw new Error("A signed private download requires a private Media bucket.");
  }
}

function requirePositiveDuration(expiresInSeconds: number): void {
  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new Error("A signed URL duration must be a positive number of seconds.");
  }
}

export function createMediaStorageAdapter(
  dependencies: MediaStorageAdapterDependencies = {},
): MediaStorageAdapter {
  const createClient = dependencies.createClient ?? (() => createSupabaseAdminClient());

  return {
    async createSignedUpload({ bucket, objectPath }) {
      const response = await createClient().storage.from(bucket).createSignedUploadUrl(objectPath, {
        upsert: false,
      });

      if (response.error || response.data === null) {
        throw normalizeProviderError("SIGNED_UPLOAD", response.error ?? {});
      }

      if (response.data.path !== objectPath) {
        throw new MediaStorageProviderError("SIGNED_UPLOAD", "PROVIDER_FAILURE");
      }

      return {
        uploadUrl: response.data.signedUrl,
        uploadToken: response.data.token,
        objectPath: response.data.path,
      };
    },

    async inspectObject({ bucket, objectPath }) {
      const response = await createClient().storage.from(bucket).info(objectPath);

      if (response.error) {
        if (isObjectNotFound(response.error)) {
          return null;
        }

        throw normalizeProviderError("INSPECT", response.error);
      }

      if (response.data === null) {
        throw new MediaStorageProviderError("INSPECT", "PROVIDER_FAILURE");
      }

      return {
        objectId: response.data.id,
        version: response.data.version,
        name: response.data.name,
        byteSize: response.data.size,
        mimeType: response.data.contentType,
        etag: response.data.etag,
        lastModifiedAt: response.data.lastModified,
      };
    },

    async deleteObject({ bucket, objectPath }) {
      const response = await createClient().storage.from(bucket).remove([objectPath]);

      if (response.error) {
        throw normalizeProviderError("DELETE", response.error);
      }
    },

    getPublicDeliveryUrl({ bucket, objectPath }) {
      requirePublicBucket(bucket);
      return createClient().storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
    },

    async createSignedPrivateDownload({ bucket, objectPath, expiresInSeconds }) {
      requirePrivateBucket(bucket);
      requirePositiveDuration(expiresInSeconds);

      const response = await createClient()
        .storage.from(bucket)
        .createSignedUrl(objectPath, expiresInSeconds);

      if (response.error || response.data === null) {
        throw normalizeProviderError("SIGNED_DOWNLOAD", response.error ?? {});
      }

      return response.data.signedUrl;
    },
  };
}
