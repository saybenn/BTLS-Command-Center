import { describe, expect, it } from "vitest";

import { buildMediaObjectPath, MediaObjectPathError } from "@/server/storage/object-path";

const propertyId = "11111111-1111-4111-8111-111111111111";
const assetId = "22222222-2222-4222-8222-222222222222";

describe("Media object paths", () => {
  it("uses an opaque property-scoped path without the display filename", () => {
    expect(
      buildMediaObjectPath({
        propertyId,
        profile: "CONTENT_IMAGE",
        assetId,
        verifiedExtension: "webp",
      }),
    ).toBe(`${propertyId}/content/${assetId}.webp`);
  });

  it("includes only a server-owned opaque target key when grouping is required", () => {
    expect(
      buildMediaObjectPath({
        propertyId,
        profile: "ATTACHMENT",
        assetId,
        verifiedExtension: "pdf",
        targetKey: "estimate-artifact_01",
      }),
    ).toBe(`${propertyId}/attachment/estimate-artifact_01/${assetId}.pdf`);
  });

  it("rejects path traversal and non-UUID object ownership values", () => {
    expect(() =>
      buildMediaObjectPath({
        propertyId,
        profile: "ATTACHMENT",
        assetId,
        verifiedExtension: "pdf",
        targetKey: "../customer-file",
      }),
    ).toThrow(MediaObjectPathError);
    expect(() =>
      buildMediaObjectPath({
        propertyId: "not-a-property-id",
        profile: "CONTENT_IMAGE",
        assetId,
        verifiedExtension: "png",
      }),
    ).toThrow(MediaObjectPathError);
  });
});
