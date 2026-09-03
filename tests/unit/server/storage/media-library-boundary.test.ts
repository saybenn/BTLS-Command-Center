import { describe, expect, it, vi } from "vitest";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import {
  GenericMediaLibraryBoundaryError,
  requireGenericLibraryAsset,
  type GenericMediaLibraryBoundaryDependencies,
} from "@/server/storage/media-library-boundary";

const propertyId = "11111111-1111-4111-8111-111111111111";
const otherPropertyId = "33333333-3333-4333-8333-333333333333";
const assetId = "22222222-2222-4222-8222-222222222222";

function context(
  capabilities = ["media.view", "media.manage"],
  currentPropertyId = propertyId,
): AuthorizedPropertyContext {
  return {
    property: { id: currentPropertyId },
    capabilities: { platform: [], property: capabilities },
  } as unknown as AuthorizedPropertyContext;
}

function asset(overrides: Record<string, unknown> = {}) {
  return {
    id: assetId,
    propertyId,
    profile: "CONTENT_IMAGE",
    sensitivity: "NORMAL",
    ...overrides,
  };
}

function dependencies(record = asset()) {
  const findFirst = vi.fn().mockResolvedValue(record);
  return {
    findFirst,
    dependencies: {
      database: { mediaAsset: { findFirst } },
    } as GenericMediaLibraryBoundaryDependencies,
  };
}

describe("generic Media Library asset boundary", () => {
  it("allows normal CONTENT_IMAGE and ATTACHMENT assets in the authorized property", async () => {
    const content = dependencies(asset({ profile: "CONTENT_IMAGE" }));
    const attachment = dependencies(asset({ profile: "ATTACHMENT" }));

    await expect(
      requireGenericLibraryAsset(
        context(),
        { mediaAssetId: assetId, propertyId, requiredCapability: "view" },
        content.dependencies,
      ),
    ).resolves.toMatchObject({ profile: "CONTENT_IMAGE" });
    await expect(
      requireGenericLibraryAsset(
        context(),
        { mediaAssetId: assetId, propertyId, requiredCapability: "manage" },
        attachment.dependencies,
      ),
    ).resolves.toMatchObject({ profile: "ATTACHMENT" });
  });

  it.each([
    { profile: "EVIDENCE", sensitivity: "SENSITIVE" },
    { profile: "BRAND_IMAGE", sensitivity: "NORMAL" },
    { profile: "GENERATED_DOCUMENT", sensitivity: "NORMAL" },
    { profile: "TEMPORARY_INPUT", sensitivity: "NORMAL" },
    { profile: "CONTENT_IMAGE", sensitivity: "SENSITIVE" },
  ])("rejects non-library or sensitive same-property assets: $profile", async (candidate) => {
    const fixture = dependencies(asset(candidate));

    await expect(
      requireGenericLibraryAsset(
        context(),
        { mediaAssetId: assetId, propertyId, requiredCapability: "manage" },
        fixture.dependencies,
      ),
    ).rejects.toBeInstanceOf(GenericMediaLibraryBoundaryError);
  });

  it("rejects invalid IDs and cross-property requests before exposing an asset", async () => {
    const fixture = dependencies();

    await expect(
      requireGenericLibraryAsset(
        context(),
        { mediaAssetId: "not-a-uuid", propertyId, requiredCapability: "view" },
        fixture.dependencies,
      ),
    ).rejects.toBeInstanceOf(GenericMediaLibraryBoundaryError);
    await expect(
      requireGenericLibraryAsset(
        context(["media.view"], otherPropertyId),
        { mediaAssetId: assetId, propertyId, requiredCapability: "view" },
        fixture.dependencies,
      ),
    ).rejects.toBeInstanceOf(GenericMediaLibraryBoundaryError);
  });
});
