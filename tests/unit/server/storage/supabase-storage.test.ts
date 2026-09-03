import { describe, expect, it, vi } from "vitest";

import {
  createMediaStorageAdapter,
  MediaStorageProviderError,
} from "@/server/storage/supabase-storage";

const objectPath = "11111111-1111-4111-8111-111111111111/content/asset.webp";

function createStorageAdapterFixture() {
  const createSignedUploadUrl = vi.fn().mockResolvedValue({
    data: {
      signedUrl: "https://storage.test/upload-signed",
      token: "signed-upload-token",
      path: objectPath,
    },
    error: null,
  });
  const info = vi.fn().mockResolvedValue({
    data: {
      id: "storage-object-id",
      version: "storage-version",
      name: objectPath,
      size: 123,
      contentType: "image/webp",
      etag: "storage-etag",
      lastModified: "2026-08-30T00:00:00.000Z",
    },
    error: null,
  });
  const remove = vi.fn().mockResolvedValue({ data: [], error: null });
  const getPublicUrl = vi.fn().mockReturnValue({
    data: { publicUrl: "https://storage.test/public-content/object.webp" },
  });
  const createSignedUrl = vi.fn().mockResolvedValue({
    data: { signedUrl: "https://storage.test/private-signed" },
    error: null,
  });
  const bucketClient = { createSignedUploadUrl, info, remove, getPublicUrl, createSignedUrl };
  const from = vi.fn().mockReturnValue(bucketClient);
  const client = { storage: { from } };
  const adapter = createMediaStorageAdapter({ createClient: () => client });

  return {
    adapter,
    createSignedUploadUrl,
    info,
    remove,
    getPublicUrl,
    createSignedUrl,
    from,
  };
}

describe("BTLS Supabase Storage adapter", () => {
  it("creates an exact signed upload target without permitting overwrite", async () => {
    const fixture = createStorageAdapterFixture();

    await expect(
      fixture.adapter.createSignedUpload({ bucket: "public-content", objectPath }),
    ).resolves.toEqual({
      uploadUrl: "https://storage.test/upload-signed",
      uploadToken: "signed-upload-token",
      objectPath,
    });
    expect(fixture.from).toHaveBeenCalledWith("public-content");
    expect(fixture.createSignedUploadUrl).toHaveBeenCalledWith(objectPath, { upsert: false });
  });

  it("rejects a provider response that does not preserve the authorized object path", async () => {
    const fixture = createStorageAdapterFixture();
    fixture.createSignedUploadUrl.mockResolvedValueOnce({
      data: {
        signedUrl: "https://storage.test/upload-signed",
        token: "signed-upload-token",
        path: "other-property/object.webp",
      },
      error: null,
    });

    await expect(
      fixture.adapter.createSignedUpload({ bucket: "public-content", objectPath }),
    ).rejects.toMatchObject({
      name: "MediaStorageProviderError",
      operation: "SIGNED_UPLOAD",
      kind: "PROVIDER_FAILURE",
    });
  });

  it("normalizes inspected object metadata and treats a missing object as absent", async () => {
    const fixture = createStorageAdapterFixture();

    await expect(
      fixture.adapter.inspectObject({ bucket: "private-media", objectPath }),
    ).resolves.toEqual({
      objectId: "storage-object-id",
      version: "storage-version",
      name: objectPath,
      byteSize: 123,
      mimeType: "image/webp",
      etag: "storage-etag",
      lastModifiedAt: "2026-08-30T00:00:00.000Z",
    });

    fixture.info.mockResolvedValueOnce({ data: null, error: { statusCode: 404 } });
    await expect(
      fixture.adapter.inspectObject({ bucket: "private-media", objectPath }),
    ).resolves.toBeNull();
  });

  it("uses public URLs only for public buckets and short-lived signed URLs only for private buckets", async () => {
    const fixture = createStorageAdapterFixture();

    expect(fixture.adapter.getPublicDeliveryUrl({ bucket: "public-content", objectPath })).toBe(
      "https://storage.test/public-content/object.webp",
    );
    expect(() =>
      fixture.adapter.getPublicDeliveryUrl({ bucket: "private-media", objectPath }),
    ).toThrow("public Media bucket");

    await expect(
      fixture.adapter.createSignedPrivateDownload({
        bucket: "private-media",
        objectPath,
        expiresInSeconds: 300,
      }),
    ).resolves.toBe("https://storage.test/private-signed");
    expect(fixture.createSignedUrl).toHaveBeenCalledWith(objectPath, 300);
    await expect(
      fixture.adapter.createSignedPrivateDownload({
        bucket: "public-content",
        objectPath,
        expiresInSeconds: 300,
      }),
    ).rejects.toThrow("private Media bucket");
  });

  it("normalizes provider failures without exposing provider error text", async () => {
    const fixture = createStorageAdapterFixture();
    fixture.createSignedUrl.mockResolvedValueOnce({
      data: null,
      error: { message: "provider secret detail", statusCode: 503 },
    });

    await expect(
      fixture.adapter.createSignedPrivateDownload({
        bucket: "private-media",
        objectPath,
        expiresInSeconds: 60,
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "MediaStorageProviderError",
        message: "Storage is unavailable.",
        operation: "SIGNED_DOWNLOAD",
        kind: "PROVIDER_FAILURE",
      }),
    );
  });

  it("deletes exactly one object path and reports provider failures consistently", async () => {
    const fixture = createStorageAdapterFixture();

    await fixture.adapter.deleteObject({ bucket: "temporary-uploads", objectPath });
    expect(fixture.remove).toHaveBeenCalledWith([objectPath]);

    fixture.remove.mockResolvedValueOnce({ data: null, error: { status: 404 } });
    await expect(
      fixture.adapter.deleteObject({ bucket: "temporary-uploads", objectPath }),
    ).rejects.toBeInstanceOf(MediaStorageProviderError);
  });
});
