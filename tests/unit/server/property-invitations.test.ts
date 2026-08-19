import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/database/prisma", () => ({ prisma: {} }));
vi.mock("@/server/auth/invitations", () => ({ createInvitation: vi.fn() }));
vi.mock("@/server/properties/property-users", () => ({ updateMemberAccess: vi.fn() }));

import {
  cancelPendingInvitation,
  createPendingInvitation,
  pendingInvitationExpiration,
  synchronizeAndActivatePendingAuthorization,
} from "@/server/properties/property-invitations";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";

const ids = {
  account: "00000000-0000-4000-8000-000000000001",
  actor: "00000000-0000-4000-8000-000000000002",
  invitation: "00000000-0000-4000-8000-000000000003",
  membership: "00000000-0000-4000-8000-000000000004",
  property: "00000000-0000-4000-8000-000000000005",
  user: "00000000-0000-4000-8000-000000000006",
};

function context(overrides: Partial<AuthorizedPropertyContext> = {}): AuthorizedPropertyContext {
  return {
    account: { id: ids.account, name: "Oak Services" },
    capabilities: { platform: [], property: ["property.member.manage"] },
    effectiveRole: "CLIENT_OWNER",
    membership: { id: ids.membership, role: "CLIENT_OWNER" },
    property: { id: ids.property, name: "Oak HVAC", domain: "oak.example" },
    propertyAccess: { id: ids.invitation, roleOverride: null },
    user: { id: ids.actor, email: "owner@oak.example", displayName: "Owner", platformRole: null },
    ...overrides,
  };
}

function pendingInvitation() {
  return {
    id: ids.invitation,
    accountId: ids.account,
    invitedUserId: ids.user,
    invitedById: ids.actor,
    role: "CLIENT_VIEWER" as const,
    propertyGrants: [{ propertyId: ids.property, roleOverride: null }],
  };
}

describe("Feature 05 Slice 6 pending invitation lifecycle", () => {
  afterEach(() => {
    delete process.env.BTLS_PENDING_INVITATION_EXPIRY_HOURS;
  });

  it("uses the configurable 24-hour default expiration with safe bounds", () => {
    const now = new Date("2026-08-18T00:00:00.000Z");
    expect(pendingInvitationExpiration(now).toISOString()).toBe("2026-08-19T00:00:00.000Z");
    process.env.BTLS_PENDING_INVITATION_EXPIRY_HOURS = "12";
    expect(pendingInvitationExpiration(now).toISOString()).toBe("2026-08-18T12:00:00.000Z");
    process.env.BTLS_PENDING_INVITATION_EXPIRY_HOURS = "0";
    expect(pendingInvitationExpiration(now).toISOString()).toBe("2026-08-19T00:00:00.000Z");
  });

  it("contacts Supabase before persisting a token-free same-account pending invitation", async () => {
    const callOrder: string[] = [];
    const createAuthInvitation = vi.fn(async () => {
      callOrder.push("provider");
      return { email: "invitee@oak.example", userId: ids.user };
    });
    const pendingUpsert = vi.fn().mockResolvedValue({ id: ids.invitation });
    const database = {
      accountMembership: {
        findUnique: vi.fn().mockResolvedValue({
          status: "ACTIVE",
          propertyAccesses: [{ propertyId: ids.property }],
        }),
      },
      appUser: { findUnique: vi.fn().mockResolvedValue(null) },
      clientProperty: { count: vi.fn().mockResolvedValue(1) },
      pendingAccountInvitation: { findMany: vi.fn().mockResolvedValue([]) },
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) => {
        callOrder.push("transaction");
        return callback({
          pendingAccountInvitation: {
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: pendingUpsert,
          },
          pendingPropertyAccess: { deleteMany: vi.fn(), createMany: vi.fn() },
          auditEvent: { create: vi.fn(), createMany: vi.fn() },
        });
      },
    };

    await expect(
      createPendingInvitation(
        context(),
        {
          email: "invitee@oak.example",
          role: "CLIENT_VIEWER",
          propertyGrants: [{ propertyId: ids.property, roleOverride: null }],
        },
        {
          createAuthInvitation,
          database: database as never,
          now: new Date("2026-08-18T00:00:00.000Z"),
        },
      ),
    ).resolves.toEqual({ kind: "pending", id: ids.invitation });
    expect(callOrder).toEqual(["provider", "transaction"]);
    expect(pendingUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ accountId: ids.account, invitedUserId: ids.user }),
      }),
    );
  });

  it("does not let a Client Owner cancel an invitation that includes an unassigned property", async () => {
    const otherPropertyId = "00000000-0000-4000-8000-000000000007";
    const database = {
      pendingAccountInvitation: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({
          ...pendingInvitation(),
          propertyGrants: [{ propertyId: otherPropertyId }],
        }),
      },
      accountMembership: {
        findUnique: vi.fn().mockResolvedValue({
          status: "ACTIVE",
          propertyAccesses: [{ propertyId: ids.property }],
        }),
      },
      $transaction: vi.fn(),
    };

    await expect(
      cancelPendingInvitation(context(), ids.invitation, database as never),
    ).rejects.toThrow("only for properties you are assigned to");
    expect(database.$transaction).not.toHaveBeenCalled();
  });

  it("gives an existing verified client user the intended grants immediately without a pending record", async () => {
    const pendingFindMany = vi.fn();
    const database = {
      accountMembership: {
        findUnique: vi.fn().mockResolvedValue({
          status: "ACTIVE",
          propertyAccesses: [{ propertyId: ids.property }],
        }),
      },
      appUser: {
        findUnique: vi.fn().mockResolvedValue({
          id: ids.user,
          email: "invitee@oak.example",
          status: "ACTIVE",
          platformRole: null,
        }),
      },
      clientProperty: { count: vi.fn().mockResolvedValue(1) },
      pendingAccountInvitation: { findMany: pendingFindMany },
    };

    await expect(
      createPendingInvitation(
        context(),
        {
          email: "invitee@oak.example",
          role: "CLIENT_STAFF",
          propertyGrants: [{ propertyId: ids.property, roleOverride: null }],
        },
        { database: database as never, createAuthInvitation: vi.fn() },
      ),
    ).resolves.toEqual({ kind: "granted" });
    expect(pendingFindMany).not.toHaveBeenCalled();
  });
  it("activates an accepted invitation once and makes replay a no-op for memberships and grants", async () => {
    let pendingAvailable = true;
    const membershipUpsert = vi.fn().mockResolvedValue({ id: ids.membership });
    const accessUpsert = vi.fn().mockResolvedValue({ id: "access-id" });
    const database = {
      pendingAccountInvitation: {
        findMany: vi
          .fn()
          .mockImplementation(({ where }: { where: { expiresAt: { lte?: Date } } }) =>
            where.expiresAt.lte ? [] : [],
          ),
      },
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({
          appUser: {
            upsert: vi.fn().mockResolvedValue({
              id: ids.user,
              email: "invitee@oak.example",
              displayName: "Invitee",
              status: "ACTIVE",
              platformRole: null,
            }),
          },
          pendingAccountInvitation: {
            findMany: vi
              .fn()
              .mockImplementation(() => (pendingAvailable ? [pendingInvitation()] : [])),
            updateMany: vi.fn().mockImplementation(() => {
              if (!pendingAvailable) return { count: 0 };
              pendingAvailable = false;
              return { count: 1 };
            }),
          },
          clientProperty: { count: vi.fn().mockResolvedValue(1) },
          accountMembership: { upsert: membershipUpsert },
          propertyAccess: { upsert: accessUpsert },
          auditEvent: { create: vi.fn(), createMany: vi.fn() },
        }),
    };
    const identity = {
      id: ids.user,
      email: "invitee@oak.example",
      emailConfirmedAt: "2026-08-18T00:00:00.000Z",
      userMetadata: { display_name: "Invitee" },
    };

    await expect(
      synchronizeAndActivatePendingAuthorization(identity, database as never),
    ).resolves.toMatchObject({
      activated: 1,
      user: { id: ids.user },
    });
    await expect(
      synchronizeAndActivatePendingAuthorization(identity, database as never),
    ).resolves.toMatchObject({
      activated: 0,
      user: { id: ids.user },
    });
    expect(membershipUpsert).toHaveBeenCalledTimes(1);
    expect(accessUpsert).toHaveBeenCalledTimes(1);
  });

  it("marks expired invitations without activating account membership or property access", async () => {
    const membershipUpsert = vi.fn();
    const database = {
      pendingAccountInvitation: {
        findMany: vi
          .fn()
          .mockImplementation(({ where }: { where: { expiresAt: { lte?: Date } } }) =>
            where.expiresAt.lte ? [{ id: ids.invitation, accountId: ids.account }] : [],
          ),
      },
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({
          pendingAccountInvitation: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            findMany: vi.fn().mockResolvedValue([]),
          },
          auditEvent: { createMany: vi.fn() },
          appUser: {
            upsert: vi.fn().mockResolvedValue({
              id: ids.user,
              email: "invitee@oak.example",
              displayName: null,
              status: "ACTIVE",
              platformRole: null,
            }),
          },
          accountMembership: { upsert: membershipUpsert },
        }),
    };

    await expect(
      synchronizeAndActivatePendingAuthorization(
        {
          id: ids.user,
          email: "invitee@oak.example",
          emailConfirmedAt: "2026-08-18T00:00:00.000Z",
        },
        database as never,
      ),
    ).resolves.toMatchObject({ activated: 0 });
    expect(membershipUpsert).not.toHaveBeenCalled();
  });
});
