import "server-only";

import { z } from "zod";

import type {
  AccountMembership,
  AccountRole,
  AppUser,
  ClientAccount,
  ClientProperty,
  PropertyAccess,
} from "@/generated/prisma/client";
import {
  hasPlatformCapability,
  hasPropertyCapability,
  platformCapabilities,
  propertyCapabilities,
  type PlatformCapability,
  type PropertyCapability,
} from "../auth/permissions";
import { getAuthenticatedAppUserResult } from "../auth/session";

const propertyIdSchema = z.string().uuid();

type ActiveAppUserResult =
  { status: "active"; user: AppUser } | { status: "disabled" } | { status: "unauthenticated" };

type LoadedProperty = ClientProperty & {
  account: ClientAccount;
  propertyAccesses: Array<
    PropertyAccess & {
      membership: AccountMembership;
    }
  >;
};

type ListedPropertyAccess = PropertyAccess & {
  property: ClientProperty & {
    account: ClientAccount;
  };
  membership: AccountMembership;
};

export type AuthorizedPropertyContext = {
  account: Pick<ClientAccount, "id" | "name">;
  capabilities: {
    platform: PlatformCapability[];
    property: PropertyCapability[];
  };
  effectiveRole: AccountRole | null;
  membership: Pick<AccountMembership, "id" | "role"> | null;
  property: Pick<ClientProperty, "id" | "name" | "domain">;
  propertyAccess: Pick<PropertyAccess, "id" | "roleOverride"> | null;
  user: Pick<AppUser, "id" | "email" | "displayName" | "platformRole">;
};

export type AuthorizedPropertySummary = {
  account: Pick<ClientAccount, "id" | "name">;
  effectiveRole: AccountRole | null;
  property: Pick<ClientProperty, "id" | "name" | "domain">;
};

export type PropertyContextResolution =
  | { context: AuthorizedPropertyContext; status: "authorized" }
  | { status: "unauthenticated" }
  | { status: "disabled" }
  | { status: "denied" }
  | { status: "account-suspended" }
  | { status: "property-suspended" }
  | { status: "membership-suspended" };

export type AuthorizedPropertyListResolution =
  | { properties: AuthorizedPropertySummary[]; status: "authorized" }
  | { status: "no-properties" }
  | { status: "unauthenticated" }
  | { status: "disabled" };

export type PropertyContextDependencies = {
  getAuthenticatedAppUser: () => Promise<ActiveAppUserResult>;
  findPropertyForUser: (propertyId: string, userId: string) => Promise<LoadedProperty | null>;
  listActiveProperties: () => Promise<Array<ClientProperty & { account: ClientAccount }>>;
  listPropertyAccessesForUser: (userId: string) => Promise<ListedPropertyAccess[]>;
};

export function createPropertyContextDependencies(): PropertyContextDependencies {
  return {
    getAuthenticatedAppUser: async () => {
      const result = await getAuthenticatedAppUserResult();

      return result.status === "unauthorized" ? { status: "unauthenticated" } : result;
    },
    findPropertyForUser: async (propertyId, userId) => {
      const { prisma } = await import("@/server/database/prisma");

      return prisma.clientProperty.findUnique({
        where: { id: propertyId },
        include: {
          account: true,
          propertyAccesses: {
            where: {
              membership: {
                userId,
              },
            },
            include: {
              membership: true,
            },
          },
        },
      });
    },
    listActiveProperties: async () => {
      const { prisma } = await import("@/server/database/prisma");

      return prisma.clientProperty.findMany({
        where: {
          status: "ACTIVE",
          account: { status: "ACTIVE" },
        },
        include: { account: true },
        orderBy: [{ account: { name: "asc" } }, { name: "asc" }, { id: "asc" }],
      });
    },
    listPropertyAccessesForUser: async (userId) => {
      const { prisma } = await import("@/server/database/prisma");

      return prisma.propertyAccess.findMany({
        where: {
          membership: {
            userId,
            status: "ACTIVE",
          },
          property: {
            status: "ACTIVE",
            account: { status: "ACTIVE" },
          },
        },
        include: {
          membership: true,
          property: { include: { account: true } },
        },
        orderBy: [
          { property: { account: { name: "asc" } } },
          { property: { name: "asc" } },
          { propertyId: "asc" },
        ],
      });
    },
  };
}

function getPlatformCapabilities(user: Pick<AppUser, "platformRole">): PlatformCapability[] {
  return platformCapabilities.filter((capability) =>
    hasPlatformCapability(user.platformRole, capability),
  );
}

function getPropertyCapabilities(effectiveRole: AccountRole | null): PropertyCapability[] {
  if (!effectiveRole) {
    return [];
  }

  return propertyCapabilities.filter((capability) =>
    hasPropertyCapability(effectiveRole, capability),
  );
}

function createAuthorizedContext(
  user: AppUser,
  property: ClientProperty,
  account: ClientAccount,
  propertyAccess: (PropertyAccess & { membership: AccountMembership }) | null,
): AuthorizedPropertyContext {
  const effectiveRole = propertyAccess
    ? (propertyAccess.roleOverride ?? propertyAccess.membership.role)
    : null;

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      platformRole: user.platformRole,
    },
    account: { id: account.id, name: account.name },
    property: { id: property.id, name: property.name, domain: property.domain },
    membership: propertyAccess
      ? { id: propertyAccess.membership.id, role: propertyAccess.membership.role }
      : null,
    propertyAccess: propertyAccess
      ? { id: propertyAccess.id, roleOverride: propertyAccess.roleOverride }
      : null,
    effectiveRole,
    capabilities: {
      platform: getPlatformCapabilities(user),
      property: getPropertyCapabilities(effectiveRole),
    },
  };
}

/**
 * Resolves a browser route identifier into server-authorized property context.
 * Downstream application services must accept the returned context, never the raw route ID.
 */
export async function resolveAuthorizedPropertyContext(
  routePropertyId: string,
  dependencies: PropertyContextDependencies = createPropertyContextDependencies(),
): Promise<PropertyContextResolution> {
  const parsedPropertyId = propertyIdSchema.safeParse(routePropertyId);
  if (!parsedPropertyId.success) {
    return { status: "denied" };
  }

  const authentication = await dependencies.getAuthenticatedAppUser();
  if (authentication.status !== "active") {
    return authentication;
  }

  const loadedProperty = await dependencies.findPropertyForUser(
    parsedPropertyId.data,
    authentication.user.id,
  );

  // Deliberately do not reveal whether a property exists when it is not authorized.
  if (!loadedProperty) {
    return { status: "denied" };
  }

  if (loadedProperty.account.status !== "ACTIVE") {
    return { status: "account-suspended" };
  }

  if (loadedProperty.status !== "ACTIVE") {
    return { status: "property-suspended" };
  }

  const platformMayRead = hasPlatformCapability(
    authentication.user.platformRole,
    "platform.property.read",
  );
  const propertyAccess = loadedProperty.propertyAccesses[0] ?? null;

  if (!platformMayRead) {
    if (!propertyAccess) {
      return { status: "denied" };
    }

    if (propertyAccess.membership.status !== "ACTIVE") {
      return { status: "membership-suspended" };
    }
  }

  return {
    status: "authorized",
    context: createAuthorizedContext(
      authentication.user,
      loadedProperty,
      loadedProperty.account,
      propertyAccess,
    ),
  };
}

/** Throws only generic browser-safe denials while retaining precise outcomes for server routing. */
export async function requireAuthorizedPropertyContext(
  routePropertyId: string,
  dependencies: PropertyContextDependencies = createPropertyContextDependencies(),
): Promise<AuthorizedPropertyContext> {
  const resolution = await resolveAuthorizedPropertyContext(routePropertyId, dependencies);

  if (resolution.status === "authorized") {
    return resolution.context;
  }

  if (resolution.status === "unauthenticated") {
    throw new Error("You must sign in to continue.");
  }

  if (resolution.status === "disabled") {
    throw new Error("Your BTLS account is disabled.");
  }

  throw new Error("This property is unavailable.");
}

export async function listAuthorizedProperties(
  dependencies: PropertyContextDependencies = createPropertyContextDependencies(),
): Promise<AuthorizedPropertyListResolution> {
  const authentication = await dependencies.getAuthenticatedAppUser();
  if (authentication.status !== "active") {
    return authentication;
  }

  const platformMayRead = hasPlatformCapability(
    authentication.user.platformRole,
    "platform.property.read",
  );
  const properties = platformMayRead
    ? (await dependencies.listActiveProperties()).map((property) => ({
        account: { id: property.account.id, name: property.account.name },
        effectiveRole: null,
        property: { id: property.id, name: property.name, domain: property.domain },
      }))
    : (await dependencies.listPropertyAccessesForUser(authentication.user.id)).map(
        (propertyAccess) => ({
          account: {
            id: propertyAccess.property.account.id,
            name: propertyAccess.property.account.name,
          },
          effectiveRole: propertyAccess.roleOverride ?? propertyAccess.membership.role,
          property: {
            id: propertyAccess.property.id,
            name: propertyAccess.property.name,
            domain: propertyAccess.property.domain,
          },
        }),
      );

  return properties.length > 0 ? { status: "authorized", properties } : { status: "no-properties" };
}
