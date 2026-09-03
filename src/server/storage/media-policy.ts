import "server-only";

export const mediaProfiles = [
  "BRAND_IMAGE",
  "CONTENT_IMAGE",
  "ATTACHMENT",
  "EVIDENCE",
  "GENERATED_DOCUMENT",
  "TEMPORARY_INPUT",
] as const;

export type MediaProfile = (typeof mediaProfiles)[number];
export type MediaVisibility = "PUBLIC" | "PRIVATE";
export type MediaSensitivity = "NORMAL" | "SENSITIVE";
export type MediaDurability = "DURABLE" | "TEMPORARY";
export type MediaStorageBucket =
  "public-media" | "public-content" | "private-media" | "temporary-uploads";

export type MediaProfilePolicy = {
  storageBucket: MediaStorageBucket;
  pathFamily: string;
  visibility: MediaVisibility;
  durability: MediaDurability;
  defaultSensitivity: MediaSensitivity;
  allowedSensitivities: readonly MediaSensitivity[];
  allowedMimeTypes: readonly string[];
  allowedExtensions: readonly string[];
  maximumByteSize: number;
};

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const imageExtensions = ["jpg", "jpeg", "png", "webp"] as const;
const privateFileMimeTypes = [
  ...imageMimeTypes,
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;
const privateFileExtensions = [...imageExtensions, "heic", "heif", "pdf"] as const;
const temporaryInputMimeTypes = [
  "audio/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "video/mp4",
] as const;
const temporaryInputExtensions = ["webm", "mp3", "mpeg", "mp4", "m4a", "wav"] as const;

const MEBIBYTE = 1024 * 1024;

const mediaMimeExtensions: Record<string, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/heic": ["heic"],
  "image/heif": ["heif"],
  "application/pdf": ["pdf"],
  "audio/webm": ["webm"],
  "audio/mpeg": ["mp3", "mpeg"],
  "audio/mp4": ["mp4", "m4a"],
  "audio/x-m4a": ["m4a"],
  "audio/wav": ["wav"],
  "audio/x-wav": ["wav"],
  "video/mp4": ["mp4"],
};

export function isAllowedMediaMimeExtensionPair(mimeType: string, extension: string): boolean {
  return mediaMimeExtensions[mimeType]?.includes(extension) ?? false;
}

export const mediaProfilePolicies: Record<MediaProfile, MediaProfilePolicy> = {
  BRAND_IMAGE: {
    storageBucket: "public-media",
    pathFamily: "brand",
    visibility: "PUBLIC",
    durability: "DURABLE",
    defaultSensitivity: "NORMAL",
    allowedSensitivities: ["NORMAL"],
    allowedMimeTypes: imageMimeTypes,
    allowedExtensions: imageExtensions,
    maximumByteSize: 10 * MEBIBYTE,
  },
  CONTENT_IMAGE: {
    storageBucket: "public-content",
    pathFamily: "content",
    visibility: "PUBLIC",
    durability: "DURABLE",
    defaultSensitivity: "NORMAL",
    allowedSensitivities: ["NORMAL"],
    allowedMimeTypes: imageMimeTypes,
    allowedExtensions: imageExtensions,
    maximumByteSize: 10 * MEBIBYTE,
  },
  ATTACHMENT: {
    storageBucket: "private-media",
    pathFamily: "attachment",
    visibility: "PRIVATE",
    durability: "DURABLE",
    defaultSensitivity: "NORMAL",
    allowedSensitivities: ["NORMAL"],
    allowedMimeTypes: privateFileMimeTypes,
    allowedExtensions: privateFileExtensions,
    maximumByteSize: 25 * MEBIBYTE,
  },
  EVIDENCE: {
    storageBucket: "private-media",
    pathFamily: "evidence",
    visibility: "PRIVATE",
    durability: "DURABLE",
    defaultSensitivity: "SENSITIVE",
    allowedSensitivities: ["SENSITIVE"],
    allowedMimeTypes: privateFileMimeTypes,
    allowedExtensions: privateFileExtensions,
    maximumByteSize: 25 * MEBIBYTE,
  },
  GENERATED_DOCUMENT: {
    storageBucket: "private-media",
    pathFamily: "generated-document",
    visibility: "PRIVATE",
    durability: "DURABLE",
    defaultSensitivity: "NORMAL",
    allowedSensitivities: ["NORMAL", "SENSITIVE"],
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maximumByteSize: 25 * MEBIBYTE,
  },
  TEMPORARY_INPUT: {
    storageBucket: "temporary-uploads",
    pathFamily: "temporary-input",
    visibility: "PRIVATE",
    durability: "TEMPORARY",
    defaultSensitivity: "NORMAL",
    allowedSensitivities: ["NORMAL", "SENSITIVE"],
    allowedMimeTypes: temporaryInputMimeTypes,
    allowedExtensions: temporaryInputExtensions,
    maximumByteSize: 50 * MEBIBYTE,
  },
};

export const mediaTiming = {
  signedUploadUrlSeconds: 2 * 60 * 60,
  pendingFinalizationHours: 24,
  temporaryAssetHours: 24,
  privateDownloadUrlSeconds: 5 * 60,
  sensitiveDownloadUrlSeconds: 60,
  publicCacheControl: "max-age=3600",
  cleanupLeaseMinutes: 10,
  defaultCleanupBatchSize: 25,
  maximumCleanupBatchSize: 100,
} as const;

export function getMediaProfilePolicy(profile: MediaProfile): MediaProfilePolicy {
  return mediaProfilePolicies[profile];
}
