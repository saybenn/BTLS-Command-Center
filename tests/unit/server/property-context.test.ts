import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/database/prisma", () => ({ prisma: {} }));

import type {
  AccountMembership,
  AppUser,
  ClientAccount,
  ClientProperty,
  PropertyAccess,
} from "@/generated/prisma/client";
import {
  listAuthorizedProperties,
  requireAuthorizedPropertyContext,
  resolveAuthorizedPropertyContext,
  type PropertyContextDependencies,
} from "@/server/properties/property-context";

const account = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Example Account",
  status: "ACTIVE",
} as ClientAccount;
const property = {
  id: "00000000-0000-4000-8000-000000000002",
  accountId: account.id,
  name: "Example Property",
  domain: "example.test",
  status: "ACTIVE",
} as ClientProperty;
const otherPropertyId = "00000000-0000-4000-8000-000000000003";
const clientUser = {
  id: "00000000-0000-4000-8000-000000000004",
  email: "client@example.test",
  displayName: "Client User",
  status: "ACTIVE",
  platformRole: null,
} as AppUser;
const ownerUser = { ...clientUser, id: "00000000-0000-4000-8000-000000000005" } as AppUser;
const operatorUser = {
  ...clientUser,
  id: "00000000-0000-4000-8000-000000000006",
  platformRole: "BTLS_OPERATOR",
} as AppUser;
const adminUser = {
  ...clientUser,
  id: "00000000-0000-4000-8000-000000000007",
  platformRole: "BTLS_ADMIN",
} as AppUser;

function activeUser(user: AppUser): PropertyContextDependencies["getAuthenticatedAppUser"] {
  return async () => ({ status: "active", user });
}

function createDependencies(
  input: {
    accesses?: Array<PropertyAccess & { membership: AccountMembership }>;
    property?: (ClientProperty & { account: ClientAccount }) | null;
    user?: AppUser;
  } = {},
): PropertyContextDependencies {
  const membership = {
    id: "00000000-0000-4000-8000-000000000008",
    accountId: account.id,
    userId: input.user?.id ?? clientUser.id,
    role: "CLIENT_MANAGER",
    status: "ACTIVE",
  } as AccountMembership;
  const defaultAccess = {
    id: "00000000-0000-4000-8000-000000000009",
    accountId: account.id,
    membershipId: membership.id,
    propertyId: property.id,
    roleOverride: null,
    membership,
  } as PropertyAccess & { membership: AccountMembership };
  const loadedProperty = input.property === undefined ? { ...property, account } : input.property;

  return {
    getAuthenticatedAppUser: activeUser(input.user ?? clientUser),
    findPropertyForUser: async (propertyId) =>
      propertyId === property.id && loadedProperty
        ? { ...loadedProperty, propertyAccesses: input.accesses ?? [defaultAccess] }
        : null,
    listActiveProperties: async () => (loadedProperty ? [loadedProperty] : []),
    listPropertyAccessesForUser: async () =>
      (input.accesses ?? [defaultAccess]).map((access) => ({
        ...access,
        property: { ...property, account },
      })),
  };
}

describe("Feature 05 Slice 2 server-scoped property context", () => {
  it("uses an active membership and explicit PropertyAccess grant to authorize a client property", async () => {
    const resolution = await resolveAuthorizedPropertyContext(property.id, createDependencies());

    expect(resolution).toMatchObject({
      status: "authorized",
      context: {
        effectiveRole: "CLIENT_MANAGER",
        membership: { id: "00000000-0000-4000-8000-000000000008" },
        propertyAccess: { id: "00000000-0000-4000-8000-000000000009" },
      },
    });
  });

  it("uses a property role override for client-owner scoped member management", async () => {
    const dependencies = createDependencies({ user: ownerUser });
    const resolution = await resolveAuthorizedPropertyContext(property.id, dependencies);

    expect(resolution).toMatchObject({
      status: "authorized",
      context: { capabilities: { property: [] } },
    });

    const ownerMembership = {
      id: "00000000-0000-4000-8000-000000000010",
      accountId: account.id,
      userId: ownerUser.id,
      role: "CLIENT_OWNER",
      status: "ACTIVE",
    } as AccountMembership;
    const ownerAccess = {
      id: "00000000-0000-4000-8000-000000000011",
      accountId: account.id,
      membershipId: ownerMembership.id,
      propertyId: property.id,
      roleOverride: null,
      membership: ownerMembership,
    } as PropertyAccess & { membership: AccountMembership };
    const ownerResolution = await resolveAuthorizedPropertyContext(
      property.id,
      createDependencies({ accesses: [ownerAccess], user: ownerUser }),
    );

    expect(ownerResolution).toMatchObject({
      status: "authorized",
      context: {
        effectiveRole: "CLIENT_OWNER",
        capabilities: { property: ["property.member.manage"] },
      },
    });
  });

  it("allows platform.property.read users across properties without a PropertyAccess row", async () => {
    const operator = await resolveAuthorizedPropertyContext(
      property.id,
      createDependencies({ accesses: [], user: operatorUser }),
    );
    const admin = await resolveAuthorizedPropertyContext(
      property.id,
      createDependencies({ accesses: [], user: adminUser }),
    );

    expect(operator).toMatchObject({
      status: "authorized",
      context: {
        membership: null,
        propertyAccess: null,
        capabilities: { platform: ["platform.property.read"] },
      },
    });
    expect(admin).toMatchObject({
      status: "authorized",
      context: {
        capabilities: {
          platform: ["platform.property.read", "platform.property.manage", "platform.user.manage"],
        },
      },
    });
  });

  it("denies URL manipulation and does not reveal another property", async () => {
    const dependencies = createDependencies();

    await expect(requireAuthorizedPropertyContext(otherPropertyId, dependencies)).rejects.toThrow(
      "This property is unavailable.",
    );
    await expect(resolveAuthorizedPropertyContext("not-a-uuid", dependencies)).resolves.toEqual({
      status: "denied",
    });
  });

  it("returns safe outcomes for anonymous, disabled, suspended, and no-property states", async () => {
    await expect(
      resolveAuthorizedPropertyContext(property.id, {
        ...createDependencies(),
        getAuthenticatedAppUser: async () => ({ status: "unauthenticated" }),
      }),
    ).resolves.toEqual({ status: "unauthenticated" });
    await expect(
      resolveAuthorizedPropertyContext(property.id, {
        ...createDependencies(),
        getAuthenticatedAppUser: async () => ({ status: "disabled" }),
      }),
    ).resolves.toEqual({ status: "disabled" });
    await expect(
      resolveAuthorizedPropertyContext(
        property.id,
        createDependencies({
          property: { ...property, account: { ...account, status: "SUSPENDED" } },
        }),
      ),
    ).resolves.toEqual({ status: "account-suspended" });
    await expect(
      resolveAuthorizedPropertyContext(
        property.id,
        createDependencies({ property: { ...property, status: "SUSPENDED", account } }),
      ),
    ).resolves.toEqual({ status: "property-suspended" });
    await expect(
      resolveAuthorizedPropertyContext(
        property.id,
        createDependencies({
          accesses: [
            {
              id: "00000000-0000-4000-8000-000000000012",
              accountId: account.id,
              membershipId: "00000000-0000-4000-8000-000000000013",
              propertyId: property.id,
              roleOverride: null,
              membership: {
                id: "00000000-0000-4000-8000-000000000013",
                accountId: account.id,
                userId: clientUser.id,
                role: "CLIENT_VIEWER",
                status: "SUSPENDED",
              } as AccountMembership,
            } as PropertyAccess & { membership: AccountMembership },
          ],
        }),
      ),
    ).resolves.toEqual({ status: "membership-suspended" });
    await expect(
      listAuthorizedProperties(createDependencies({ accesses: [], property: null })),
    ).resolves.toEqual({ status: "no-properties" });
  });

  it("lists only the client properties carrying explicit active grants", async () => {
    const summary = await listAuthorizedProperties(createDependencies());

    expect(summary).toMatchObject({
      status: "authorized",
      properties: [{ property: { id: property.id }, effectiveRole: "CLIENT_MANAGER" }],
    });
  });
});
