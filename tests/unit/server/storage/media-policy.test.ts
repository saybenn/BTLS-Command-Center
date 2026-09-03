import { describe, expect, it } from "vitest";

import {
  MediaUploadValidationError,
  parseMediaUploadDeclaration,
  validateMediaUploadDeclaration,
} from "@/server/storage/file-validation";
import { mediaProfilePolicies, mediaProfiles, mediaTiming } from "@/server/storage/media-policy";

describe("Media policy registry", () => {
  it("defines all six server-owned profiles", () => {
    expect(mediaProfiles).toEqual([
      "BRAND_IMAGE",
      "CONTENT_IMAGE",
      "ATTACHMENT",
      "EVIDENCE",
      "GENERATED_DOCUMENT",
      "TEMPORARY_INPUT",
    ]);
  });

  it("keeps public content and ordinary attachments as distinct library-safe profiles", () => {
    expect(mediaProfilePolicies.CONTENT_IMAGE).toMatchObject({
      storageBucket: "public-content",
      visibility: "PUBLIC",
      durability: "DURABLE",
      defaultSensitivity: "NORMAL",
    });
    expect(mediaProfilePolicies.ATTACHMENT).toMatchObject({
      storageBucket: "private-media",
      visibility: "PRIVATE",
      durability: "DURABLE",
      defaultSensitivity: "NORMAL",
    });
  });

  it("preserves the stricter infrastructure-only profiles", () => {
    expect(mediaProfilePolicies.EVIDENCE).toMatchObject({
      storageBucket: "private-media",
      visibility: "PRIVATE",
      defaultSensitivity: "SENSITIVE",
      allowedSensitivities: ["SENSITIVE"],
    });
    expect(mediaProfilePolicies.GENERATED_DOCUMENT.allowedMimeTypes).toEqual(["application/pdf"]);
    expect(mediaProfilePolicies.TEMPORARY_INPUT).toMatchObject({
      storageBucket: "temporary-uploads",
      durability: "TEMPORARY",
      maximumByteSize: 50 * 1024 * 1024,
    });
  });

  it("uses the approved access, finalization, and cleanup timing", () => {
    expect(mediaTiming).toMatchObject({
      signedUploadUrlSeconds: 2 * 60 * 60,
      pendingFinalizationHours: 24,
      temporaryAssetHours: 24,
      privateDownloadUrlSeconds: 5 * 60,
      sensitiveDownloadUrlSeconds: 60,
      cleanupLeaseMinutes: 10,
      defaultCleanupBatchSize: 25,
      maximumCleanupBatchSize: 100,
    });
  });
});

describe("Media upload declaration validation", () => {
  it("accepts an allowed attachment declaration", () => {
    const declaration = parseMediaUploadDeclaration({
      displayFilename: "estimate.pdf",
      mimeType: "application/pdf",
      byteSize: 1_024,
      extension: "pdf",
    });

    expect(() => validateMediaUploadDeclaration("ATTACHMENT", declaration)).not.toThrow();
  });

  it("rejects profile-incompatible, oversized, and malformed declarations", () => {
    const imageDeclaration = parseMediaUploadDeclaration({
      displayFilename: "estimate.pdf",
      mimeType: "application/pdf",
      byteSize: 1_024,
      extension: "pdf",
    });
    const largeImageDeclaration = parseMediaUploadDeclaration({
      displayFilename: "photo.jpg",
      mimeType: "image/jpeg",
      byteSize: 10 * 1024 * 1024 + 1,
      extension: "jpg",
    });

    expect(() => validateMediaUploadDeclaration("CONTENT_IMAGE", imageDeclaration)).toThrow(
      MediaUploadValidationError,
    );
    expect(() => validateMediaUploadDeclaration("CONTENT_IMAGE", largeImageDeclaration)).toThrow(
      MediaUploadValidationError,
    );
    expect(() =>
      parseMediaUploadDeclaration({
        displayFilename: "photo.jpg",
        mimeType: "image/jpeg",
        byteSize: 1,
        extension: ".jpg",
      }),
    ).toThrow(MediaUploadValidationError);
  });
});
