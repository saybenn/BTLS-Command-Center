import { describe, expect, it, vi } from "vitest";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import {
  listMediaLibraryPendingUploads,
  type MediaRecoveryDependencies,
} from "@/server/storage/media-recovery";

const propertyId = "11111111-1111-4111-8111-111111111111";
const assetId = "22222222-2222-4222-8222-222222222222";
const now = new Date("2026-09-02T12:00:00.000Z");

function context(capabilities = ["media.view"], property = propertyId) {
  return {
    property: { id: property },
    capabilities: { platform: [], property: capabilities },
  } as unknown as AuthorizedPropertyContext;
}

function asset(overrides: Record<string, unknown> = {}) {
  return {
    id: assetId,
    propertyId,
    profile: "CONTENT_IMAGE",
    sensitivity: "NORMAL",
    status: "PENDING_UPLOAD",
    storageBucket: "PUBLIC_CONTENT",
    objectPath: `${propertyId}/content/${assetId}.webp`,
    displayFilename: "interrupted.webp",
    declaredMimeType: "image/webp",
    declaredByteSize: 123,
    finalizationDeadlineAt: new Date("2026-09-03T12:00:00.000Z"),
    createdAt: now,
    ...overrides,
  };
}

function dependencies(records = [asset()], inspectObject = vi.fn().mockResolvedValue(null)) {
  const findMany = vi.fn().mockResolvedValue(records);
  return {
    findMany,
    dependencies: {
      database: { mediaAsset: { findMany } },
      storage: { inspectObject },
      now: () => now,
    } as unknown as MediaRecoveryDependencies,
  };
}

describe("Media pending-upload recovery", () => {
  it("rediscovers a pre-existing pending library upload and classifies verified bytes for finalization", async () => {
    const fixture = dependencies([asset()], vi.fn().mockResolvedValue({ name: "object" }));

    await expect(
      listMediaLibraryPendingUploads(context(), { propertyId }, fixture.dependencies),
    ).resolves.toMatchObject([{ mediaAssetId: assetId, recoveryState: "FINALIZE" }]);
    expect(fixture.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        propertyId,
        profile: { in: ["CONTENT_IMAGE", "ATTACHMENT"] },
        sensitivity: "NORMAL",
        status: "PENDING_UPLOAD",
      }),
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns RESTART only when Storage positively reports the reserved object absent", async () => {
    const fixture = dependencies();

    await expect(
      listMediaLibraryPendingUploads(context(), { propertyId }, fixture.dependencies),
    ).resolves.toMatchObject([{ recoveryState: "RESTART" }]);
  });

  it("returns temporary unavailable when object inspection fails", async () => {
    const fixture = dependencies(
      [asset()],
      vi.fn().mockRejectedValue(new Error("provider unavailable")),
    );

    await expect(
      listMediaLibraryPendingUploads(context(), { propertyId }, fixture.dependencies),
    ).resolves.toMatchObject([{ recoveryState: "UNAVAILABLE" }]);
  });

  it("marks expired reservations without inspecting or finalizing them", async () => {
    const inspectObject = vi.fn();
    const fixture = dependencies(
      [asset({ finalizationDeadlineAt: new Date("2026-09-01T12:00:00.000Z") })],
      inspectObject,
    );

    await expect(
      listMediaLibraryPendingUploads(context(), { propertyId }, fixture.dependencies),
    ).resolves.toMatchObject([{ recoveryState: "EXPIRED" }]);
    expect(inspectObject).not.toHaveBeenCalled();
  });

  it("denies another property and defensively excludes non-library, sensitive, and non-pending records", async () => {
    const fixture = dependencies([
      asset({ profile: "EVIDENCE" }),
      asset({ sensitivity: "SENSITIVE" }),
      asset({ status: "DELETION_PENDING" }),
      asset({ status: "DELETED" }),
      asset({ propertyId: "33333333-3333-4333-8333-333333333333" }),
    ]);

    await expect(
      listMediaLibraryPendingUploads(context(), { propertyId }, fixture.dependencies),
    ).resolves.toEqual([]);
    await expect(
      listMediaLibraryPendingUploads(
        context(["media.view"], "33333333-3333-4333-8333-333333333333"),
        { propertyId },
        fixture.dependencies,
      ),
    ).rejects.toThrow("unavailable");
  });
});
