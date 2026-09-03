import { describe, expect, it, vi } from "vitest";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import {
  finalizeMediaUpload,
  MediaLifecycleError,
  recoverMediaUploadWithNewReservation,
  removeMediaFromLibrary,
  reserveTrustedMediaUpload,
  reserveLibraryMediaUpload,
  reserveMediaReplacement,
  restoreMediaToLibrary,
  type MediaLifecycleDependencies,
} from "@/server/storage/media-lifecycle";

const propertyId = "11111111-1111-4111-8111-111111111111";
const otherPropertyId = "33333333-3333-4333-8333-333333333333";
const assetId = "22222222-2222-4222-8222-222222222222";
const replacementAssetId = "44444444-4444-4444-8444-444444444444";
const now = new Date("2026-08-30T12:00:00.000Z");

const managerContext = {
  user: { id: "55555555-5555-4555-8555-555555555555" },
  property: { id: propertyId },
  capabilities: { platform: [], property: ["media.manage"] },
} as unknown as AuthorizedPropertyContext;

const viewerContext = {
  ...managerContext,
  capabilities: { platform: [], property: ["media.view"] },
} as unknown as AuthorizedPropertyContext;

function createAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: assetId,
    propertyId,
    createdById: managerContext.user.id,
    replacesAssetId: null,
    profile: "CONTENT_IMAGE",
    visibility: "PUBLIC",
    sensitivity: "NORMAL",
    durability: "DURABLE",
    storageBucket: "PUBLIC_CONTENT",
    pathFamily: "content",
    targetKey: null,
    objectPath: `${propertyId}/content/${assetId}.webp`,
    displayFilename: "team-photo.webp",
    declaredMimeType: "image/webp",
    declaredByteSize: 123,
    expectedExtension: "webp",
    status: "PENDING_UPLOAD",
    uploadUrlExpiresAt: new Date("2026-08-30T14:00:00.000Z"),
    finalizationDeadlineAt: new Date("2026-08-31T12:00:00.000Z"),
    finalizedAt: null,
    expiresAt: null,
    removedAt: null,
    cleanupEligibleAt: null,
    deletionClaimId: null,
    storageObjectId: null,
    storageObjectVersion: null,
    storageEtag: null,
    ...overrides,
  };
}

function createDependencies(asset = createAsset()) {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) =>
    createAsset({ ...data }),
  );
  const findFirst = vi.fn().mockResolvedValue(asset);
  const updateMany = vi.fn().mockResolvedValue({ count: 1 });
  const createSignedUpload = vi.fn(async ({ objectPath }: { objectPath: string }) => ({
    uploadUrl: "https://storage.test/upload",
    uploadToken: "upload-token",
    objectPath,
  }));
  const inspectObject = vi.fn().mockResolvedValue({
    objectId: "storage-object-id",
    version: "storage-version",
    name: asset.objectPath,
    byteSize: 123,
    mimeType: "image/webp",
    etag: "storage-etag",
  });
  const dependencies = {
    database: { mediaAsset: { create, findFirst, updateMany } },
    storage: {
      createSignedUpload,
      inspectObject,
      deleteObject: vi.fn(),
      getPublicDeliveryUrl: vi.fn(),
      createSignedPrivateDownload: vi.fn(),
    },
    createId: vi.fn().mockReturnValue(replacementAssetId),
    now: vi.fn().mockReturnValue(now),
  } as unknown as MediaLifecycleDependencies;

  return { dependencies, create, findFirst, updateMany, createSignedUpload, inspectObject };
}

describe("MediaAsset reservation and lifecycle", () => {
  it("reserves only a generic-library intent, with server-owned profile, path, and upload target", async () => {
    const fixture = createDependencies();

    await expect(
      reserveLibraryMediaUpload(
        managerContext,
        {
          propertyId,
          intent: "CONTENT_IMAGE",
          declaration: {
            displayFilename: "team-photo.webp",
            mimeType: "image/webp",
            byteSize: 123,
            extension: "webp",
          },
        },
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({
      mediaAssetId: replacementAssetId,
      objectPath: `${propertyId}/content/${replacementAssetId}.webp`,
      upload: { objectPath: `${propertyId}/content/${replacementAssetId}.webp` },
    });

    expect(fixture.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: replacementAssetId,
        propertyId,
        profile: "CONTENT_IMAGE",
        storageBucket: "PUBLIC_CONTENT",
        objectPath: `${propertyId}/content/${replacementAssetId}.webp`,
        replacesAssetId: null,
      }),
    });
    expect(fixture.createSignedUpload).toHaveBeenCalledWith({
      bucket: "public-content",
      objectPath: `${propertyId}/content/${replacementAssetId}.webp`,
    });
  });

  it("denies a viewer and a mismatched authorized property before creating a reservation", async () => {
    const fixture = createDependencies();
    const input = {
      propertyId,
      intent: "ATTACHMENT" as const,
      declaration: {
        displayFilename: "proposal.pdf",
        mimeType: "application/pdf",
        byteSize: 123,
        extension: "pdf",
      },
    };

    await expect(
      reserveLibraryMediaUpload(viewerContext, input, fixture.dependencies),
    ).rejects.toMatchObject({
      code: "ACCESS_DENIED",
    });
    await expect(
      reserveLibraryMediaUpload(
        managerContext,
        { ...input, propertyId: otherPropertyId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(fixture.create).not.toHaveBeenCalled();
  });

  it("allows only trusted workflows to request a policy-permitted sensitivity", async () => {
    const fixture = createDependencies();

    await reserveTrustedMediaUpload(
      managerContext,
      {
        propertyId,
        profile: "TEMPORARY_INPUT",
        sensitivity: "SENSITIVE",
        declaration: {
          displayFilename: "field-note.webm",
          mimeType: "audio/webm",
          byteSize: 123,
          extension: "webm",
        },
      },
      fixture.dependencies,
    );
    expect(fixture.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profile: "TEMPORARY_INPUT",
        sensitivity: "SENSITIVE",
        storageBucket: "TEMPORARY_UPLOADS",
      }),
    });

    await expect(
      reserveTrustedMediaUpload(
        managerContext,
        {
          propertyId,
          profile: "CONTENT_IMAGE",
          sensitivity: "SENSITIVE",
          declaration: {
            displayFilename: "not-sensitive.webp",
            mimeType: "image/webp",
            byteSize: 123,
            extension: "webp",
          },
        },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "OBJECT_INVALID" });
  });
  it("finalizes only verified Storage metadata through an atomic pending-to-ready transition", async () => {
    const asset = createAsset();
    const fixture = createDependencies(asset);

    await expect(
      finalizeMediaUpload(
        managerContext,
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({
      id: assetId,
      status: "READY",
      storageObjectId: "storage-object-id",
      storageObjectVersion: "storage-version",
      storageEtag: "storage-etag",
    });
    expect(fixture.updateMany).toHaveBeenCalledWith({
      where: { id: assetId, propertyId, status: "PENDING_UPLOAD" },
      data: expect.objectContaining({
        status: "READY",
        verifiedMimeType: "image/webp",
        verifiedByteSize: 123,
        verifiedExtension: "webp",
      }),
    });
  });

  it("records missing uploaded bytes as a cleanup-eligible finalization failure", async () => {
    const fixture = createDependencies();
    fixture.inspectObject.mockResolvedValueOnce(null);

    await expect(
      finalizeMediaUpload(
        managerContext,
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "OBJECT_NOT_FOUND" });
    expect(fixture.updateMany).toHaveBeenCalledWith({
      where: { id: assetId, propertyId, status: "PENDING_UPLOAD" },
      data: expect.objectContaining({
        lastFailureCategory: "OBJECT_NOT_FOUND",
        cleanupEligibleAt: now,
      }),
    });
  });

  it("records invalid verified bytes as a normalized cleanup-eligible failure", async () => {
    const fixture = createDependencies();
    fixture.inspectObject.mockResolvedValueOnce({
      objectId: "storage-object-id",
      version: "storage-version",
      name: `${propertyId}/content/${assetId}.webp`,
      byteSize: 124,
      mimeType: "image/webp",
      etag: "storage-etag",
    });

    await expect(
      finalizeMediaUpload(
        managerContext,
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "OBJECT_INVALID" });
    expect(fixture.updateMany).toHaveBeenCalledWith({
      where: { id: assetId, propertyId, status: "PENDING_UPLOAD" },
      data: expect.objectContaining({
        lastFailureCategory: "OBJECT_INVALID",
        cleanupEligibleAt: now,
      }),
    });
  });

  it("never changes a cleanup-claimed asset back to READY when finalization loses the race", async () => {
    const pendingAsset = createAsset();
    const cleanupClaimedAsset = createAsset({ status: "DELETION_PENDING" });
    const fixture = createDependencies(pendingAsset);
    fixture.updateMany.mockResolvedValueOnce({ count: 0 });
    fixture.findFirst
      .mockResolvedValueOnce(pendingAsset)
      .mockResolvedValueOnce(cleanupClaimedAsset);

    await expect(
      finalizeMediaUpload(
        managerContext,
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "DELETION_CLAIMED" });
    expect(fixture.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: assetId, propertyId, status: "PENDING_UPLOAD" } }),
    );
  });

  it("denies a cross-property asset lookup without invoking Storage", async () => {
    const fixture = createDependencies();
    fixture.findFirst.mockResolvedValueOnce(null);

    await expect(
      finalizeMediaUpload(
        managerContext,
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "ASSET_NOT_FOUND" });
    expect(fixture.inspectObject).not.toHaveBeenCalled();
  });

  it("creates a replacement reservation with a new asset and object path, never overwriting finalized bytes", async () => {
    const priorAsset = createAsset({ status: "READY", finalizedAt: now });
    const fixture = createDependencies(priorAsset);

    await reserveMediaReplacement(
      managerContext,
      {
        propertyId,
        replacesMediaAssetId: assetId,
        declaration: {
          displayFilename: "new-team-photo.webp",
          mimeType: "image/webp",
          byteSize: 321,
          extension: "webp",
        },
      },
      fixture.dependencies,
    );

    expect(fixture.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: replacementAssetId,
        replacesAssetId: assetId,
        objectPath: `${propertyId}/content/${replacementAssetId}.webp`,
      }),
    });
    expect(`${propertyId}/content/${replacementAssetId}.webp`).not.toBe(priorAsset.objectPath);
  });

  it("recovers a pending reservation by making the abandoned reservation cleanup-eligible and creating a new path", async () => {
    const fixture = createDependencies();

    await recoverMediaUploadWithNewReservation(
      managerContext,
      { propertyId, mediaAssetId: assetId },
      fixture.dependencies,
    );

    expect(fixture.updateMany).toHaveBeenCalledWith({
      where: { id: assetId, propertyId, status: "PENDING_UPLOAD" },
      data: expect.objectContaining({
        lastFailureCategory: "UPLOAD_RECOVERY_REPLACED",
        cleanupEligibleAt: now,
      }),
    });
    expect(fixture.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: replacementAssetId,
        replacesAssetId: null,
        objectPath: `${propertyId}/content/${replacementAssetId}.webp`,
      }),
    });
  });

  it("soft-removes and restores a READY asset without making durable bytes cleanup-eligible", async () => {
    const readyAsset = createAsset({ status: "READY", finalizedAt: now });
    const fixture = createDependencies(readyAsset);

    await removeMediaFromLibrary(
      managerContext,
      { propertyId, mediaAssetId: assetId },
      fixture.dependencies,
    );
    await restoreMediaToLibrary(
      managerContext,
      { propertyId, mediaAssetId: assetId },
      fixture.dependencies,
    );

    expect(fixture.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: assetId, propertyId, status: "READY", removedAt: null },
      data: { removedAt: now },
    });
    expect(fixture.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: assetId, propertyId, status: "READY", removedAt: { not: null } },
      data: { removedAt: null },
    });
  });

  it("keeps READY finalization idempotent and rejects unknown lifecycle states", async () => {
    const readyFixture = createDependencies(createAsset({ status: "READY", finalizedAt: now }));
    await expect(
      finalizeMediaUpload(
        managerContext,
        { propertyId, mediaAssetId: assetId },
        readyFixture.dependencies,
      ),
    ).resolves.toMatchObject({ status: "READY" });
    expect(readyFixture.inspectObject).not.toHaveBeenCalled();

    const deletedFixture = createDependencies(createAsset({ status: "DELETED" }));
    await expect(
      finalizeMediaUpload(
        managerContext,
        { propertyId, mediaAssetId: assetId },
        deletedFixture.dependencies,
      ),
    ).rejects.toBeInstanceOf(MediaLifecycleError);
  });
});
