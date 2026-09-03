import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());
const requireAuthenticatedAppUser = vi.hoisted(() => vi.fn());
const resolveAuthorizedPropertyContext = vi.hoisted(() => vi.fn());
const requireGenericLibraryAsset = vi.hoisted(() => vi.fn());
const reserveLibraryMediaUpload = vi.hoisted(() => vi.fn());
const reserveMediaReplacement = vi.hoisted(() => vi.fn());
const finalizeMediaUpload = vi.hoisted(() => vi.fn());
const recoverMediaUploadWithNewReservation = vi.hoisted(() => vi.fn());
const removeMediaFromLibrary = vi.hoisted(() => vi.fn());
const getMediaAssetDelivery = vi.hoisted(() => vi.fn());
const getMediaAssetMetadata = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/auth/session", () => ({ requireAuthenticatedAppUser }));
vi.mock("@/server/properties/property-context", () => ({ resolveAuthorizedPropertyContext }));
vi.mock("@/server/storage/media-library-boundary", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/server/storage/media-library-boundary")>();
  return { ...original, requireGenericLibraryAsset };
});
vi.mock("@/server/storage/media-lifecycle", () => ({
  finalizeMediaUpload,
  recoverMediaUploadWithNewReservation,
  removeMediaFromLibrary,
  reserveLibraryMediaUpload,
  reserveMediaReplacement,
}));
vi.mock("@/server/storage/media-access", () => ({ getMediaAssetDelivery, getMediaAssetMetadata }));

import {
  finalizeMediaLibraryUploadAction,
  getMediaLibraryAssetDeliveryAction,
  recoverMediaLibraryUploadAction,
  removeMediaLibraryAssetAction,
  reserveMediaLibraryReplacementAction,
  reserveMediaLibraryUploadAction,
} from "@/app/(dashboard)/[propertyId]/media/actions";

const propertyId = "11111111-1111-4111-8111-111111111111";
const assetId = "22222222-2222-4222-8222-222222222222";
const evidenceId = "33333333-3333-4333-8333-333333333333";
const context = {
  user: { id: "44444444-4444-4444-8444-444444444444" },
  property: { id: propertyId },
  capabilities: { platform: [], property: ["media.view", "media.manage"] },
};
const file = { name: "photo.webp", size: 123, type: "image/webp" };
const uploadTarget = { mediaAssetId: assetId, upload: { uploadUrl: "https://upload.example" } };

beforeEach(() => {
  vi.clearAllMocks();
  requireAuthenticatedAppUser.mockResolvedValue(context.user);
  resolveAuthorizedPropertyContext.mockResolvedValue({ status: "authorized", context });
  requireGenericLibraryAsset.mockResolvedValue({ id: assetId, profile: "CONTENT_IMAGE" });
  reserveLibraryMediaUpload.mockResolvedValue(uploadTarget);
  reserveMediaReplacement.mockResolvedValue(uploadTarget);
  finalizeMediaUpload.mockResolvedValue({});
  recoverMediaUploadWithNewReservation.mockResolvedValue(uploadTarget);
  removeMediaFromLibrary.mockResolvedValue(undefined);
  getMediaAssetMetadata.mockResolvedValue({
    byteSize: 123,
    displayFilename: "photo.webp",
    mediaAssetId: assetId,
    mimeType: "image/webp",
    profile: "CONTENT_IMAGE",
  });
  getMediaAssetDelivery.mockResolvedValue({
    kind: "PUBLIC",
    url: "https://public.example/photo.webp",
  });
});

describe("generic Media Library server actions", () => {
  it("accepts only CONTENT_IMAGE and ATTACHMENT upload intents at runtime", async () => {
    await reserveMediaLibraryUploadAction(propertyId, "CONTENT_IMAGE", file);
    await reserveMediaLibraryUploadAction(propertyId, "ATTACHMENT", {
      ...file,
      name: "scope.pdf",
      type: "application/pdf",
    });

    expect(reserveLibraryMediaUpload).toHaveBeenNthCalledWith(
      1,
      context,
      expect.objectContaining({ intent: "CONTENT_IMAGE", propertyId }),
    );
    expect(reserveLibraryMediaUpload).toHaveBeenNthCalledWith(
      2,
      context,
      expect.objectContaining({ intent: "ATTACHMENT", propertyId }),
    );
  });

  it.each(["EVIDENCE", "not-a-profile", undefined])(
    "rejects forged library intent %p before the lifecycle service",
    async (intent) => {
      await expect(reserveMediaLibraryUploadAction(propertyId, intent, file)).rejects.toThrow(
        "media request",
      );
      expect(reserveLibraryMediaUpload).not.toHaveBeenCalled();
      expect(requireAuthenticatedAppUser).not.toHaveBeenCalled();
    },
  );

  it("rejects malformed property, asset, and file inputs before calling services", async () => {
    await expect(reserveMediaLibraryUploadAction("wrong", "CONTENT_IMAGE", file)).rejects.toThrow();
    await expect(
      reserveMediaLibraryUploadAction(propertyId, "CONTENT_IMAGE", { name: "x" }),
    ).rejects.toThrow();
    await expect(finalizeMediaLibraryUploadAction(propertyId, "wrong")).rejects.toThrow();
    expect(reserveLibraryMediaUpload).not.toHaveBeenCalled();
    expect(finalizeMediaUpload).not.toHaveBeenCalled();
  });

  it.each([
    [
      "finalize",
      () => finalizeMediaLibraryUploadAction(propertyId, evidenceId),
      finalizeMediaUpload,
    ],
    [
      "replace",
      () => reserveMediaLibraryReplacementAction(propertyId, evidenceId, file),
      reserveMediaReplacement,
    ],
    ["remove", () => removeMediaLibraryAssetAction(propertyId, evidenceId), removeMediaFromLibrary],
    [
      "recover",
      () => recoverMediaLibraryUploadAction(propertyId, evidenceId),
      recoverMediaUploadWithNewReservation,
    ],
    [
      "delivery",
      () => getMediaLibraryAssetDeliveryAction(propertyId, evidenceId),
      getMediaAssetDelivery,
    ],
  ] as const)(
    "does not let %s operate on a rejected infrastructure asset",
    async (_name, action, service) => {
      requireGenericLibraryAsset.mockRejectedValueOnce(
        new Error("This media asset is unavailable."),
      );

      await expect(action()).rejects.toThrow("unavailable");
      expect(service).not.toHaveBeenCalled();
    },
  );

  it("passes a legitimate normal library asset through the guarded mutation path", async () => {
    await finalizeMediaLibraryUploadAction(propertyId, assetId);

    expect(requireGenericLibraryAsset).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ mediaAssetId: assetId, propertyId, requiredCapability: "manage" }),
    );
    expect(finalizeMediaUpload).toHaveBeenCalledWith(context, {
      mediaAssetId: assetId,
      propertyId,
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/${propertyId}/media`);
  });
});
