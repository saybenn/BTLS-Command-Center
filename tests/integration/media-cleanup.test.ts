import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { prisma } from "@/server/database/prisma";
import {
  executeMediaCleanupCandidate,
  type MediaCleanupDependencies,
} from "@/server/storage/media-cleanup";
import { MediaStorageProviderError } from "@/server/storage/supabase-storage";

const suffix = randomUUID().slice(0, 8);
const now = new Date();
let actorId: string;
let accountId: string;
let propertyId: string;

function createDependencies(deleteObject = vi.fn().mockResolvedValue(undefined)) {
  return {
    database: { mediaAsset: prisma.mediaAsset },
    storage: { deleteObject },
    createId: randomUUID,
    now: () => now,
  } as unknown as MediaCleanupDependencies;
}

async function createExpiredAsset() {
  const id = randomUUID();
  return prisma.mediaAsset.create({
    data: {
      id,
      propertyId,
      createdById: actorId,
      profile: "ATTACHMENT",
      visibility: "PRIVATE",
      sensitivity: "NORMAL",
      durability: "DURABLE",
      storageBucket: "PRIVATE_MEDIA",
      pathFamily: "attachment",
      objectPath: `${propertyId}/attachment/${id}.pdf`,
      displayFilename: "expired-upload.pdf",
      declaredMimeType: "application/pdf",
      declaredByteSize: 123,
      expectedExtension: "pdf",
      uploadUrlExpiresAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      finalizationDeadlineAt: new Date(now.getTime() - 60 * 60 * 1000),
    },
  });
}

describe("Feature 06 Media cleanup persistence", () => {
  beforeAll(async () => {
    const admin = await prisma.appUser.findFirst({
      where: { platformRole: "BTLS_ADMIN", status: "ACTIVE" },
      select: { id: true },
    });
    if (!admin) throw new Error("The local seed must provide an active BTLS admin.");
    actorId = admin.id;

    const account = await prisma.clientAccount.create({
      data: { name: `Media cleanup ${suffix}` },
    });
    accountId = account.id;
    const property = await prisma.clientProperty.create({
      data: {
        accountId,
        name: "Media cleanup property",
        domain: `media-cleanup-${suffix}.example.test`,
      },
    });
    propertyId = property.id;
  });

  afterAll(async () => {
    if (accountId) {
      await prisma.mediaAsset.deleteMany({ where: { propertyId } });
      await prisma.clientProperty.deleteMany({ where: { accountId } });
      await prisma.clientAccount.delete({ where: { id: accountId } });
    }
    await prisma.$disconnect();
  });

  it("claims an expired reservation atomically and persists its deleted tombstone", async () => {
    const asset = await createExpiredAsset();
    const deleteObject = vi.fn().mockResolvedValue(undefined);

    await expect(
      executeMediaCleanupCandidate(asset, createDependencies(deleteObject)),
    ).resolves.toMatchObject({ mediaAssetId: asset.id, outcome: "DELETED" });
    await expect(
      prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } }),
    ).resolves.toMatchObject({
      status: "DELETED",
      deletedAt: now,
      deletionAttemptCount: 1,
      deletionLeaseExpiresAt: null,
    });
    expect(deleteObject).toHaveBeenCalledWith({
      bucket: "private-media",
      objectPath: asset.objectPath,
    });
  });

  it("persists a tombstone when a retry finds that the physical object is already missing", async () => {
    const asset = await createExpiredAsset();
    const deleteObject = vi
      .fn()
      .mockRejectedValue(new MediaStorageProviderError("DELETE", "OBJECT_NOT_FOUND"));

    await expect(
      executeMediaCleanupCandidate(asset, createDependencies(deleteObject)),
    ).resolves.toMatchObject({
      mediaAssetId: asset.id,
      outcome: "DELETED_OBJECT_ALREADY_MISSING",
    });
    await expect(
      prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } }),
    ).resolves.toMatchObject({
      status: "DELETED",
      deletedAt: now,
    });
  });
});
