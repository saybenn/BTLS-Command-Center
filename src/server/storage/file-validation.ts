import "server-only";

import { z } from "zod";

import {
  getMediaProfilePolicy,
  isAllowedMediaMimeExtensionPair,
  type MediaProfile,
} from "@/server/storage/media-policy";

const maximumFilenameLength = 255;

export const mediaUploadDeclarationSchema = z.object({
  displayFilename: z.string().trim().min(1).max(maximumFilenameLength),
  mimeType: z.string().trim().toLowerCase().min(1).max(127),
  byteSize: z.number().int().positive(),
  extension: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]{1,10}$/),
});

export type MediaUploadDeclaration = z.infer<typeof mediaUploadDeclarationSchema>;

export class MediaUploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaUploadValidationError";
  }
}

export function parseMediaUploadDeclaration(input: unknown): MediaUploadDeclaration {
  const parsed = mediaUploadDeclarationSchema.safeParse(input);

  if (!parsed.success) {
    throw new MediaUploadValidationError("The file details are invalid.");
  }

  return parsed.data;
}

export function validateMediaUploadDeclaration(
  profile: MediaProfile,
  declaration: MediaUploadDeclaration,
): void {
  const policy = getMediaProfilePolicy(profile);

  if (!policy.allowedMimeTypes.includes(declaration.mimeType)) {
    throw new MediaUploadValidationError("This file type is not allowed for this upload.");
  }

  if (!policy.allowedExtensions.includes(declaration.extension)) {
    throw new MediaUploadValidationError("This file extension is not allowed for this upload.");
  }

  if (!isAllowedMediaMimeExtensionPair(declaration.mimeType, declaration.extension)) {
    throw new MediaUploadValidationError("The file type does not match its extension.");
  }

  if (declaration.byteSize > policy.maximumByteSize) {
    throw new MediaUploadValidationError("This file is larger than the allowed upload size.");
  }
}
