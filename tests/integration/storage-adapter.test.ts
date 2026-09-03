import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { buildMediaObjectPath } from "@/server/storage/object-path";
import { createMediaStorageAdapter } from "@/server/storage/supabase-storage";

const propertyId = randomUUID();
const assetId = randomUUID();
const objectPath = buildMediaObjectPath({
  propertyId,
  profile: "CONTENT_IMAGE",
  assetId,
  verifiedExtension: "webp",
});
const adapter = createMediaStorageAdapter();

afterEach(async () => {
  await adapter.deleteObject({ bucket: "public-content", objectPath }).catch(() => undefined);
});

describe("local Supabase Media Storage adapter", () => {
  it("creates an exact signed upload, inspects the stored object, delivers it publicly, and deletes it", async () => {
    const signedUpload = await adapter.createSignedUpload({
      bucket: "public-content",
      objectPath,
    });

    expect(signedUpload.objectPath).toBe(objectPath);

    const uploadResponse = await fetch(signedUpload.uploadUrl, {
      method: "PUT",
      headers: {
        "content-type": "image/webp",
        "cache-control": "max-age=3600",
        "x-upsert": "false",
      },
      body: new Blob(["BTLS Media Storage adapter test"], { type: "image/webp" }),
    });
    expect(uploadResponse.ok).toBe(true);

    const inspectedObject = await adapter.inspectObject({
      bucket: "public-content",
      objectPath,
    });
    expect(inspectedObject).toMatchObject({
      name: objectPath,
      mimeType: "image/webp",
    });
    expect(inspectedObject?.objectId).toEqual(expect.any(String));
    expect(inspectedObject?.version).toEqual(expect.any(String));

    const publicUrl = adapter.getPublicDeliveryUrl({ bucket: "public-content", objectPath });
    const publicResponse = await fetch(publicUrl);
    expect(publicResponse.ok).toBe(true);

    await adapter.deleteObject({ bucket: "public-content", objectPath });
    await expect(
      adapter.inspectObject({ bucket: "public-content", objectPath }),
    ).resolves.toBeNull();
  });
});
