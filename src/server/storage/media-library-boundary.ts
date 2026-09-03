import "server-only";

import { z } from "zod";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";

export const genericMediaLibraryIntentSchema = z.enum(["CONTENT_IMAGE", "ATTACHMENT"]);
export const genericMediaLibraryAssetIdSchema = z.string().uuid();

export type GenericMediaLibraryIntent = z.infer<typeof genericMediaLibraryIntentSchema>;

type GenericLibraryAssetRecord = {
  id: string;
  propertyId: string;
  profile:
    | "ATTACHMENT"
    | "CONTENT_IMAGE"
    | "BRAND_IMAGE"
    | "EVIDENCE"
    | "GENERATED_DOCUMENT"
    | "TEMPORARY_INPUT";
  sensitivity: "NORMAL" | "SENSITIVE";
};

type GenericLibraryAssetRepository = {
  findFirst: (input: {
    where: Record<string, unknown>;
  }) => Promise<GenericLibraryAssetRecord | null>;
};

export type GenericMediaLibraryBoundaryDependencies = {
  database: { mediaAsset: GenericLibraryAssetRepository };
};

export class GenericMediaLibraryBoundaryError extends Error {
  constructor() {
    super("This media asset is unavailable.");
    this.name = "GenericMediaLibraryBoundaryError";
  }
}

export function createGenericMediaLibraryBoundaryDependencies(): GenericMediaLibraryBoundaryDependencies {
  return {
    database: {
      mediaAsset: new Proxy({} as GenericLibraryAssetRepository, {
        get(_target, method) {
          return async (...argumentsList: unknown[]) => {
            const { prisma } = await import("@/server/database/prisma");
            const delegate = prisma.mediaAsset as unknown as Record<
              string,
              (...args: unknown[]) => unknown
            >;
            return delegate[String(method)](...argumentsList);
          };
        },
      }),
    },
  };
}

function hasMediaCapability(
  context: AuthorizedPropertyContext,
  capability: "view" | "manage",
): boolean {
  return capability === "view"
    ? context.capabilities.platform.includes("platform.media.view") ||
        context.capabilities.property.includes("media.view")
    : context.capabilities.platform.includes("platform.media.manage") ||
        context.capabilities.property.includes("media.manage");
}

/**
 * Restricts browser-initiated Media Library operations to ordinary, normal-sensitivity assets.
 * Trusted owning workflows intentionally use the shared lifecycle services directly instead.
 */
export async function requireGenericLibraryAsset(
  context: AuthorizedPropertyContext,
  input: { propertyId: unknown; mediaAssetId: unknown; requiredCapability: "view" | "manage" },
  dependencies: GenericMediaLibraryBoundaryDependencies = createGenericMediaLibraryBoundaryDependencies(),
): Promise<GenericLibraryAssetRecord> {
  const propertyId = z.string().uuid().safeParse(input.propertyId);
  const mediaAssetId = genericMediaLibraryAssetIdSchema.safeParse(input.mediaAssetId);
  if (
    !propertyId.success ||
    !mediaAssetId.success ||
    context.property.id !== propertyId.data ||
    !hasMediaCapability(context, input.requiredCapability)
  ) {
    throw new GenericMediaLibraryBoundaryError();
  }

  const asset = await dependencies.database.mediaAsset.findFirst({
    where: { id: mediaAssetId.data, propertyId: propertyId.data },
  });
  if (
    !asset ||
    asset.sensitivity !== "NORMAL" ||
    (asset.profile !== "CONTENT_IMAGE" && asset.profile !== "ATTACHMENT")
  ) {
    throw new GenericMediaLibraryBoundaryError();
  }

  return asset;
}
