import { describe, expect, it } from "vitest";

import {
  MediaUploadValidationError,
  parseMediaUploadDeclaration,
  validateMediaUploadDeclaration,
} from "@/server/storage/file-validation";

describe("Media MIME and extension validation", () => {
  it("accepts alternate extensions only when they belong to the declared MIME type", () => {
    const declaration = parseMediaUploadDeclaration({
      displayFilename: "field-photo.jpeg",
      mimeType: "image/jpeg",
      byteSize: 1,
      extension: "jpeg",
    });

    expect(() => validateMediaUploadDeclaration("CONTENT_IMAGE", declaration)).not.toThrow();
  });

  it("rejects an allowed-but-mismatched MIME and extension pair", () => {
    const declaration = parseMediaUploadDeclaration({
      displayFilename: "field-photo.png",
      mimeType: "image/jpeg",
      byteSize: 1,
      extension: "png",
    });

    expect(() => validateMediaUploadDeclaration("CONTENT_IMAGE", declaration)).toThrow(
      MediaUploadValidationError,
    );
  });
});
