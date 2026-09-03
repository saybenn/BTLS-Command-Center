"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthenticatedAppUser } from "@/server/auth/session";
import {
  genericMediaLibraryAssetIdSchema,
  genericMediaLibraryIntentSchema,
  requireGenericLibraryAsset,
} from "@/server/storage/media-library-boundary";
import { getMediaAssetDelivery, getMediaAssetMetadata } from "@/server/storage/media-access";
import {
  finalizeMediaUpload,
  recoverMediaUploadWithNewReservation,
  removeMediaFromLibrary,
  reserveLibraryMediaUpload,
  reserveMediaReplacement,
} from "@/server/storage/media-lifecycle";
import {
  resolveAuthorizedPropertyContext,
  type AuthorizedPropertyContext,
} from "@/server/properties/property-context";

export type MediaLibraryAssetDisplay = {
  byteSize: number;
  displayFilename: string;
  mediaAssetId: string;
  mimeType: string;
  profile: "ATTACHMENT" | "CONTENT_IMAGE";
  publicDeliveryUrl?: string;
};

export type MediaUploadTarget = {
  mediaAssetId: string;
  uploadUrl: string;
};

const propertyIdSchema = z.string().uuid();
const browserFileSchema = z.object({
  name: z.string().trim().min(1).max(255),
  size: z.number().int().nonnegative(),
  type: z.string().trim().min(1).max(255),
});
const reserveLibraryUploadSchema = z.object({
  file: browserFileSchema,
  intent: genericMediaLibraryIntentSchema,
  propertyId: propertyIdSchema,
});
const libraryAssetMutationSchema = z.object({
  mediaAssetId: genericMediaLibraryAssetIdSchema,
  propertyId: propertyIdSchema,
});
const libraryReplacementSchema = libraryAssetMutationSchema.extend({ file: browserFileSchema });

type BrowserFile = z.infer<typeof browserFileSchema>;

function invalidMediaRequest(): never {
  throw new Error("This media request is unavailable.");
}

function parseMediaRequest<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) invalidMediaRequest();
  return parsed.data;
}

function declarationFor(file: BrowserFile) {
  const filenameParts = file.name.split(".");
  const extension = filenameParts.length > 1 ? filenameParts.at(-1)?.toLowerCase() : undefined;

  return {
    byteSize: file.size,
    displayFilename: file.name,
    extension,
    mimeType: file.type.toLowerCase(),
  };
}

function toDisplayAsset(
  metadata: Awaited<ReturnType<typeof getMediaAssetMetadata>>,
): MediaLibraryAssetDisplay {
  if (metadata.profile !== "CONTENT_IMAGE" && metadata.profile !== "ATTACHMENT") {
    throw new Error("This media asset is unavailable.");
  }

  return {
    byteSize: metadata.byteSize,
    displayFilename: metadata.displayFilename,
    mediaAssetId: metadata.mediaAssetId,
    mimeType: metadata.mimeType,
    profile: metadata.profile,
    ...(metadata.publicDeliveryUrl ? { publicDeliveryUrl: metadata.publicDeliveryUrl } : {}),
  };
}

/** Resolves browser input to the server-owned property context before every media operation. */
export async function contextForMediaProperty(
  propertyId: unknown,
): Promise<AuthorizedPropertyContext> {
  const parsedPropertyId = parseMediaRequest(propertyIdSchema, propertyId);
  const actor = await requireAuthenticatedAppUser();
  const resolution = await resolveAuthorizedPropertyContext(parsedPropertyId);
  if (resolution.status !== "authorized" || resolution.context.user.id !== actor.id) {
    throw new Error("This property is unavailable.");
  }
  return resolution.context;
}

export async function reserveMediaLibraryUploadAction(
  propertyId: unknown,
  intent: unknown,
  file: unknown,
): Promise<MediaUploadTarget> {
  const input = parseMediaRequest(reserveLibraryUploadSchema, { file, intent, propertyId });
  const context = await contextForMediaProperty(input.propertyId);
  const reservation = await reserveLibraryMediaUpload(context, {
    declaration: declarationFor(input.file),
    intent: input.intent,
    propertyId: input.propertyId,
  });

  return { mediaAssetId: reservation.mediaAssetId, uploadUrl: reservation.upload.uploadUrl };
}

export async function reserveMediaLibraryReplacementAction(
  propertyId: unknown,
  replacesMediaAssetId: unknown,
  file: unknown,
): Promise<MediaUploadTarget> {
  const input = parseMediaRequest(libraryReplacementSchema, {
    file,
    mediaAssetId: replacesMediaAssetId,
    propertyId,
  });
  const context = await contextForMediaProperty(input.propertyId);
  await requireGenericLibraryAsset(context, {
    mediaAssetId: input.mediaAssetId,
    propertyId: input.propertyId,
    requiredCapability: "manage",
  });
  const reservation = await reserveMediaReplacement(context, {
    declaration: declarationFor(input.file),
    propertyId: input.propertyId,
    replacesMediaAssetId: input.mediaAssetId,
  });

  return { mediaAssetId: reservation.mediaAssetId, uploadUrl: reservation.upload.uploadUrl };
}

export async function finalizeMediaLibraryUploadAction(
  propertyId: unknown,
  mediaAssetId: unknown,
): Promise<MediaLibraryAssetDisplay> {
  const input = parseMediaRequest(libraryAssetMutationSchema, { mediaAssetId, propertyId });
  const context = await contextForMediaProperty(input.propertyId);
  await requireGenericLibraryAsset(context, {
    mediaAssetId: input.mediaAssetId,
    propertyId: input.propertyId,
    requiredCapability: "manage",
  });
  await finalizeMediaUpload(context, input);
  const metadata = await getMediaAssetMetadata(context, input);
  revalidatePath(`/${input.propertyId}/media`);
  return toDisplayAsset(metadata);
}

export async function recoverMediaLibraryUploadAction(
  propertyId: unknown,
  mediaAssetId: unknown,
): Promise<MediaUploadTarget> {
  const input = parseMediaRequest(libraryAssetMutationSchema, { mediaAssetId, propertyId });
  const context = await contextForMediaProperty(input.propertyId);
  await requireGenericLibraryAsset(context, {
    mediaAssetId: input.mediaAssetId,
    propertyId: input.propertyId,
    requiredCapability: "manage",
  });
  const reservation = await recoverMediaUploadWithNewReservation(context, input);
  return { mediaAssetId: reservation.mediaAssetId, uploadUrl: reservation.upload.uploadUrl };
}

export async function removeMediaLibraryAssetAction(
  propertyId: unknown,
  mediaAssetId: unknown,
): Promise<void> {
  const input = parseMediaRequest(libraryAssetMutationSchema, { mediaAssetId, propertyId });
  const context = await contextForMediaProperty(input.propertyId);
  await requireGenericLibraryAsset(context, {
    mediaAssetId: input.mediaAssetId,
    propertyId: input.propertyId,
    requiredCapability: "manage",
  });
  await removeMediaFromLibrary(context, input);
  revalidatePath(`/${input.propertyId}/media`);
}

export async function getMediaLibraryAssetDeliveryAction(
  propertyId: unknown,
  mediaAssetId: unknown,
): Promise<{ kind: "PRIVATE" | "PUBLIC"; url: string }> {
  const input = parseMediaRequest(libraryAssetMutationSchema, { mediaAssetId, propertyId });
  const context = await contextForMediaProperty(input.propertyId);
  await requireGenericLibraryAsset(context, {
    mediaAssetId: input.mediaAssetId,
    propertyId: input.propertyId,
    requiredCapability: "view",
  });
  const delivery = await getMediaAssetDelivery(context, input);
  return { kind: delivery.kind, url: delivery.url };
}
