import { describe, expect, it, vi } from "vitest";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import {
  getMediaAssetDelivery,
  getMediaAssetMetadata,
  listMediaLibraryAssets,
  type MediaAccessDependencies,
} from "@/server/storage/media-access";

const propertyId = "11111111-1111-4111-8111-111111111111";
const otherPropertyId = "33333333-3333-4333-8333-333333333333";
const assetId = "22222222-2222-4222-8222-222222222222";
const now = new Date("2026-08-30T12:00:00.000Z");

function context(
  capabilities: { platform?: string[]; property?: string[] } = { property: ["media.view"] },
  property = propertyId,
) {
  return {
    user: { id: "55555555-5555-4555-8555-555555555555" },
    account: { id: "66666666-6666-4666-8666-666666666666" },
    property: { id: property },
    capabilities: { platform: capabilities.platform ?? [], property: capabilities.property ?? [] },
  } as unknown as AuthorizedPropertyContext;
}

function createAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: assetId,
    propertyId,
    profile: "ATTACHMENT",
    visibility: "PRIVATE",
    sensitivity: "NORMAL",
    storageBucket: "PRIVATE_MEDIA",
    displayFilename: "approved-scope.pdf",
    verifiedMimeType: "application/pdf",
    verifiedByteSize: 123,
    status: "READY",
    objectPath: `${propertyId}/attachment/${assetId}.pdf`,
    finalizedAt: now,
    removedAt: null,
    createdAt: now,
    ...overrides,
  };
}

function createDependencies(asset = createAsset()) {
  const findFirst = vi.fn().mockResolvedValue(asset);
  const findMany = vi.fn().mockResolvedValue([asset]);
  const auditCreate = vi.fn().mockResolvedValue({});
  const getPublicDeliveryUrl = vi.fn().mockReturnValue("https://public.example/content.webp");
  const createSignedPrivateDownload = vi
    .fn()
    .mockResolvedValue("https://private.example/signed-download-token");
  const dependencies = {
    database: {
      mediaAsset: { findFirst, findMany },
      auditEvent: { create: auditCreate },
    },
    storage: { getPublicDeliveryUrl, createSignedPrivateDownload },
    now: () => now,
  } as unknown as MediaAccessDependencies;

  return {
    dependencies,
    findFirst,
    findMany,
    auditCreate,
    getPublicDeliveryUrl,
    createSignedPrivateDownload,
  };
}

describe("MediaAsset authorized delivery", () => {
  it("lists only ready, normal library assets and supplies durable public content delivery", async () => {
    const asset = createAsset({
      profile: "CONTENT_IMAGE",
      visibility: "PUBLIC",
      storageBucket: "PUBLIC_CONTENT",
      displayFilename: "summer-team.webp",
      verifiedMimeType: "image/webp",
      objectPath: `${propertyId}/content/${assetId}.webp`,
    });
    const fixture = createDependencies(asset);

    await expect(
      listMediaLibraryAssets(
        context(),
        { propertyId, profile: "CONTENT_IMAGE" },
        fixture.dependencies,
      ),
    ).resolves.toEqual([
      {
        mediaAssetId: assetId,
        profile: "CONTENT_IMAGE",
        displayFilename: "summer-team.webp",
        mimeType: "image/webp",
        byteSize: 123,
        finalizedAt: now,
        createdAt: now,
        publicDeliveryUrl: "https://public.example/content.webp",
      },
    ]);
    expect(fixture.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        propertyId,
        profile: "CONTENT_IMAGE",
        sensitivity: "NORMAL",
        status: "READY",
        removedAt: null,
      }),
      orderBy: { createdAt: "desc" },
    });
    expect(fixture.getPublicDeliveryUrl).toHaveBeenCalledWith({
      bucket: "public-content",
      objectPath: `${propertyId}/content/${assetId}.webp`,
    });
  });

  it("does not create a private URL while listing or reading attachment metadata", async () => {
    const fixture = createDependencies();

    await expect(
      listMediaLibraryAssets(
        context(),
        { propertyId, profile: "ATTACHMENT" },
        fixture.dependencies,
      ),
    ).resolves.toMatchObject([{ mediaAssetId: assetId, displayFilename: "approved-scope.pdf" }]);
    await expect(
      getMediaAssetMetadata(context(), { propertyId, mediaAssetId: assetId }, fixture.dependencies),
    ).resolves.toMatchObject({
      mediaAssetId: assetId,
      visibility: "PRIVATE",
      displayFilename: "approved-scope.pdf",
    });
    expect(fixture.createSignedPrivateDownload).not.toHaveBeenCalled();
    expect(fixture.getPublicDeliveryUrl).not.toHaveBeenCalled();
  });

  it("creates ordinary attachment access with a five-minute signed URL only after media.view", async () => {
    const fixture = createDependencies();

    await expect(
      getMediaAssetDelivery(context(), { propertyId, mediaAssetId: assetId }, fixture.dependencies),
    ).resolves.toEqual({
      kind: "PRIVATE",
      url: "https://private.example/signed-download-token",
      expiresAt: new Date("2026-08-30T12:05:00.000Z"),
    });
    expect(fixture.createSignedPrivateDownload).toHaveBeenCalledWith({
      bucket: "private-media",
      objectPath: `${propertyId}/attachment/${assetId}.pdf`,
      expiresInSeconds: 300,
    });
  });

  it("denies cross-property and media-capability-free reads before it requests private delivery", async () => {
    const fixture = createDependencies();

    await expect(
      getMediaAssetDelivery(
        context({ property: ["media.view"] }, otherPropertyId),
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    await expect(
      getMediaAssetDelivery(
        context({ platform: ["platform.property.read"] }),
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(fixture.findFirst).not.toHaveBeenCalled();
    expect(fixture.createSignedPrivateDownload).not.toHaveBeenCalled();
  });

  it("does not expose sensitive metadata or a signed private URL to a normal media viewer", async () => {
    const sensitiveAsset = createAsset({
      profile: "EVIDENCE",
      sensitivity: "SENSITIVE",
      objectPath: `${propertyId}/evidence/${assetId}.pdf`,
    });
    const fixture = createDependencies(sensitiveAsset);

    await expect(
      getMediaAssetMetadata(context(), { propertyId, mediaAssetId: assetId }, fixture.dependencies),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    await expect(
      getMediaAssetDelivery(context(), { propertyId, mediaAssetId: assetId }, fixture.dependencies),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(fixture.createSignedPrivateDownload).not.toHaveBeenCalled();
    expect(fixture.auditCreate).not.toHaveBeenCalled();
  });

  it("permits a sensitive-capable user, limits its URL to one minute, and writes a sanitized audit event", async () => {
    const sensitiveAsset = createAsset({
      profile: "EVIDENCE",
      sensitivity: "SENSITIVE",
      objectPath: `${propertyId}/evidence/${assetId}.pdf`,
      displayFilename: "do-not-audit-me.pdf",
    });
    const fixture = createDependencies(sensitiveAsset);
    const sensitiveContext = context({ property: ["media.view", "media.sensitive.view"] });

    await expect(
      getMediaAssetMetadata(
        sensitiveContext,
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({ mediaAssetId: assetId, sensitivity: "SENSITIVE" });
    await expect(
      getMediaAssetDelivery(
        sensitiveContext,
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({ kind: "PRIVATE", expiresAt: new Date("2026-08-30T12:01:00.000Z") });
    expect(fixture.createSignedPrivateDownload).toHaveBeenCalledWith({
      bucket: "private-media",
      objectPath: `${propertyId}/evidence/${assetId}.pdf`,
      expiresInSeconds: 60,
    });
    expect(fixture.auditCreate).toHaveBeenCalledTimes(2);
    for (const call of fixture.auditCreate.mock.calls) {
      const data = call[0].data as Record<string, unknown>;
      expect(data).toMatchObject({
        actorId: sensitiveContext.user.id,
        propertyId,
        subjectType: "MediaAsset",
        subjectId: assetId,
      });
      expect(JSON.stringify(data)).not.toContain("do-not-audit-me.pdf");
      expect(JSON.stringify(data)).not.toContain(`${propertyId}/evidence`);
      expect(JSON.stringify(data)).not.toContain("signed-download-token");
    }
  });

  it("keeps the platform property-context capability separate from sensitive Media access", async () => {
    const sensitiveAsset = createAsset({ profile: "EVIDENCE", sensitivity: "SENSITIVE" });
    const fixture = createDependencies(sensitiveAsset);

    await expect(
      getMediaAssetDelivery(
        context({ platform: ["platform.property.read", "platform.media.view"] }),
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    await expect(
      getMediaAssetDelivery(
        context({
          platform: [
            "platform.property.read",
            "platform.media.view",
            "platform.media.sensitive.view",
          ],
        }),
        { propertyId, mediaAssetId: assetId },
        fixture.dependencies,
      ),
    ).resolves.toMatchObject({ kind: "PRIVATE" });
  });
});
