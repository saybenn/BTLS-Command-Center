import "server-only";

import { z } from "zod";

import { getMediaProfilePolicy, type MediaProfile } from "@/server/storage/media-policy";

const uuidSchema = z.string().uuid();
const extensionSchema = z.string().regex(/^[a-z0-9]{1,10}$/);
const opaqueTargetKeySchema = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/);

export type MediaObjectPathInput = {
  propertyId: string;
  profile: MediaProfile;
  assetId: string;
  verifiedExtension: string;
  targetKey?: string | null;
};

export class MediaObjectPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaObjectPathError";
  }
}

/**
 * Builds the only Storage key format used by MediaAsset. Neither the original filename nor a
 * future domain record identifier is permitted in this path.
 */
export function buildMediaObjectPath(input: MediaObjectPathInput): string {
  const propertyId = uuidSchema.safeParse(input.propertyId);
  const assetId = uuidSchema.safeParse(input.assetId);
  const verifiedExtension = extensionSchema.safeParse(input.verifiedExtension.toLowerCase());
  const targetKey =
    input.targetKey == null ? null : opaqueTargetKeySchema.safeParse(input.targetKey);

  if (
    !propertyId.success ||
    !assetId.success ||
    !verifiedExtension.success ||
    (targetKey !== null && !targetKey.success)
  ) {
    throw new MediaObjectPathError("The server-owned Storage path inputs are invalid.");
  }

  const policy = getMediaProfilePolicy(input.profile);
  const pathSegments = [propertyId.data, policy.pathFamily];

  if (targetKey !== null) {
    if (!targetKey.success) {
      throw new MediaObjectPathError("The server-owned Storage path inputs are invalid.");
    }

    pathSegments.push(targetKey.data);
  }

  pathSegments.push(`${assetId.data}.${verifiedExtension.data}`);
  return pathSegments.join("/");
}
