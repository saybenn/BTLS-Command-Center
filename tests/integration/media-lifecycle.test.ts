import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { prisma } from "@/server/database/prisma";
import {
  finalizeMediaUpload,
  type MediaLifecycleDependencies,
} from "@/server/storage/media-lifecycle";

const suffix = randomUUID().slice(0, 8);
const now = new Date();
let actorId: string;
let accountId: string;
let propertyId: string;
let otherPropertyId: string;

function managerContext(id: string) {
  return {
    user: { id },
    property: { id: propertyId },
    capabilities: { platform: ["platform.media.manage"], property: [] },
  } as never;
}

function createDependencies(overrides: Partial<MediaLifecycleDependencies> = {}) {
  const inspectObject = vi.fn().mockResolvedValue({
    objectId: "storage-object-id",
    version: "storage-version",
    name: "",
    byteSize: 123,
    mimeType: "image/webp",
    etag: "storage-etag",
  });
  const dependencies = {
    database: { mediaAsset: prisma.mediaAsset },
    storage: {
      createSignedUpload: vi.fn(),
      inspectObject,
      deleteObject: vi.fn(),
      getPublicDeliveryUrl: vi.fn(),
      createSignedPrivateDownload: vi.fn(),
    },
    createId: randomUUID,
    now: () => now,
    ...overrides,
  } as unknown as MediaLifecycleDependencies;
  return { dependencies, inspectObject };
}

async function createPendingAsset(ownerPropertyId: string) {
  const id = randomUUID();
  const objectPath = `${ownerPropertyId}/content/${id}.webp`;
  return prisma.mediaAsset.create({
    data: {
      id,
      propertyId: ownerPropertyId,
      createdById: actorId,
      profile: "CONTENT_IMAGE",
      visibility: "PUBLIC",
      sensitivity: "NORMAL",
      durability: "DURABLE",
      storageBucket: "PUBLIC_CONTENT",
      pathFamily: "content",
      objectPath,
      displayFilename: "integration.webp",
      declaredMimeType: "image/webp",
      declaredByteSize: 123,
      expectedExtension: "webp",
      uploadUrlExpiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      finalizationDeadlineAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  });
}

describe("Feature 06 Media lifecycle property isolation", () => {
  beforeAll(async () => {
    const admin = await prisma.appUser.findFirst({
      where: { platformRole: "BTLS_ADMIN", status: "ACTIVE" },
      select: { id: true },
    });
    if (!admin) throw new Error("The local seed must provide an active BTLS admin.");
    actorId = admin.id;

    const account = await prisma.clientAccount.create({
      data: { name: `Media lifecycle ${suffix}` },
    });
    accountId = account.id;
    const [property, otherProperty] = await Promise.all([
      prisma.clientProperty.create({
        data: {
          accountId,
          name: "Media lifecycle property",
          domain: `media-${suffix}.example.test`,
        },
      }),
      prisma.clientProperty.create({
        data: {
          accountId,
          name: "Other media property",
          domain: `other-media-${suffix}.example.test`,
        },
      }),
    ]);
    propertyId = property.id;
    otherPropertyId = otherProperty.id;
  });

  afterAll(async () => {
    if (accountId) {
      await prisma.mediaAsset.deleteMany({
        where: { propertyId: { in: [propertyId, otherPropertyId] } },
      });
      await prisma.clientProperty.deleteMany({ where: { accountId } });
      await prisma.clientAccount.delete({ where: { id: accountId } });
    }
    await prisma.$disconnect();
  });

  it("denies finalization of another property’s asset before inspecting Storage", async () => {
    const asset = await createPendingAsset(otherPropertyId);
    const { dependencies, inspectObject } = createDependencies();

    await expect(
      finalizeMediaUpload(
        managerContext(actorId),
        { propertyId: otherPropertyId, mediaAssetId: asset.id },
        dependencies,
      ),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(inspectObject).not.toHaveBeenCalled();
  });

  it("does not let a cleanup claim race become a READY transition", async () => {
    const asset = await createPendingAsset(propertyId);
    const { dependencies, inspectObject } = createDependencies();
    inspectObject.mockResolvedValueOnce({
      objectId: "storage-object-id",
      version: "storage-version",
      name: asset.objectPath,
      byteSize: 123,
      mimeType: "image/webp",
      etag: "storage-etag",
    });
    const actualRepository = prisma.mediaAsset;
    dependencies.database.mediaAsset = {
      ...actualRepository,
      updateMany: async (input: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        if (input.data.status === "READY") {
          await actualRepository.updateMany({
            where: { id: asset.id, propertyId, status: "PENDING_UPLOAD" },
            data: {
              status: "DELETION_PENDING",
              deletionClaimId: randomUUID(),
              deletionClaimedAt: now,
            },
          });
          return { count: 0 };
        }
        return actualRepository.updateMany(input as never);
      },
    } as never;

    await expect(
      finalizeMediaUpload(
        managerContext(actorId),
        { propertyId, mediaAssetId: asset.id },
        dependencies,
      ),
    ).rejects.toMatchObject({ code: "DELETION_CLAIMED" });

    await expect(
      prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } }),
    ).resolves.toMatchObject({
      status: "DELETION_PENDING",
    });
  });
});
