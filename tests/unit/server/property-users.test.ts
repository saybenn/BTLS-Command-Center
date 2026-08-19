import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/database/prisma", () => ({ prisma: {} }));

import {
  getPropertyUserAdministration,
  revokeMemberAccess,
  updateMemberAccess,
} from "@/server/properties/property-users";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";

const ids = {
  account: "00000000-0000-4000-8000-000000000001",
  actor: "00000000-0000-4000-8000-000000000002",
  target: "00000000-0000-4000-8000-000000000003",
  propertyA: "00000000-0000-4000-8000-000000000004",
  propertyB: "00000000-0000-4000-8000-000000000005",
  membership: "00000000-0000-4000-8000-000000000006",
  propertyAccess: "00000000-0000-4000-8000-000000000007",
};

function context(overrides: Partial<AuthorizedPropertyContext> = {}): AuthorizedPropertyContext {
  return {
    account: { id: ids.account, name: "Oak Services" },
    capabilities: { platform: [], property: ["property.member.manage"] },
    effectiveRole: "CLIENT_OWNER",
    membership: { id: ids.membership, role: "CLIENT_OWNER" },
    property: { id: ids.propertyA, name: "Oak HVAC", domain: "oak.example" },
    propertyAccess: { id: ids.propertyAccess, roleOverride: null },
    user: { id: ids.actor, email: "owner@oak.example", displayName: "Owner", platformRole: null },
    ...overrides,
  };
}

describe("Feature 05 Slice 5 property user services", () => {
  it("denies managers, staff, and viewers before reading or mutating users", async () => {
    const database = { accountMembership: { findMany: vi.fn() } };
    const managerContext = context({
      capabilities: { platform: [], property: [] },
      effectiveRole: "CLIENT_MANAGER",
    });

    await expect(getPropertyUserAdministration(managerContext, database as never)).rejects.toThrow(
      "do not have permission",
    );
    expect(database.accountMembership.findMany).not.toHaveBeenCalled();
  });

  it("prevents a Client Owner from mutating a member with access outside the owner's grants", async () => {
    const findUnique = vi.fn(({ where }: { where: { userId_accountId: { userId: string } } }) => {
      if (where.userId_accountId.userId === ids.actor) {
        return {
          id: ids.membership,
          status: "ACTIVE",
          propertyAccesses: [{ propertyId: ids.propertyA }],
        };
      }
      return {
        id: "target-membership",
        role: "CLIENT_VIEWER",
        status: "ACTIVE",
        user: {
          id: ids.target,
          email: "member@oak.example",
          displayName: "Member",
          platformRole: null,
        },
        propertyAccesses: [{ propertyId: ids.propertyB, roleOverride: null }],
      };
    });
    const count = vi.fn();
    const database = {
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({
          appUser: {
            findUnique: vi.fn().mockResolvedValue({
              id: ids.target,
              email: "member@oak.example",
              displayName: "Member",
              platformRole: null,
              status: "ACTIVE",
            }),
          },
          accountMembership: { findUnique, upsert: vi.fn() },
          clientProperty: { count, findMany: vi.fn() },
          propertyAccess: { upsert: vi.fn(), delete: vi.fn() },
          auditEvent: { createMany: vi.fn() },
        }),
    };

    await expect(
      updateMemberAccess(
        context(),
        {
          userId: ids.target,
          role: "CLIENT_MANAGER",
          propertyGrants: [{ propertyId: ids.propertyA, roleOverride: null }],
        },
        database as never,
      ),
    ).rejects.toThrow("only for properties you are assigned to");
    expect(count).not.toHaveBeenCalled();
  });

  it("updates baseline role, explicit property grants, and audits each durable mutation", async () => {
    const upsertMembership = vi.fn().mockResolvedValue({ id: ids.membership });
    const upsertAccess = vi.fn().mockResolvedValue({ id: ids.propertyAccess });
    const auditCreateMany = vi.fn().mockResolvedValue({ count: 2 });
    const database = {
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({
          appUser: {
            findUnique: vi.fn().mockResolvedValue({
              id: ids.target,
              email: "member@oak.example",
              displayName: "Member",
              platformRole: null,
              status: "ACTIVE",
            }),
          },
          accountMembership: {
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: upsertMembership,
          },
          clientProperty: {
            count: vi.fn().mockResolvedValue(1),
            findMany: vi.fn().mockResolvedValue([{ id: ids.propertyA }]),
          },
          propertyAccess: { upsert: upsertAccess, delete: vi.fn() },
          auditEvent: { createMany: auditCreateMany },
        }),
    };
    const platformContext = context({
      capabilities: { platform: ["platform.user.manage"], property: [] },
      effectiveRole: null,
      membership: null,
      propertyAccess: null,
      user: {
        id: ids.actor,
        email: "admin@btls.example",
        displayName: "Admin",
        platformRole: "BTLS_ADMIN",
      },
    });

    await updateMemberAccess(
      platformContext,
      {
        userId: ids.target,
        role: "CLIENT_MANAGER",
        propertyGrants: [{ propertyId: ids.propertyA, roleOverride: "CLIENT_VIEWER" }],
      },
      database as never,
    );

    expect(upsertMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ role: "CLIENT_MANAGER", status: "ACTIVE" }),
        update: { role: "CLIENT_MANAGER", status: "ACTIVE" },
      }),
    );
    expect(upsertAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          roleOverride: "CLIENT_VIEWER",
          propertyId: ids.propertyA,
        }),
      }),
    );
    expect(auditCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ action: "account_membership.created" }),
        expect.objectContaining({ action: "property_access.granted", propertyId: ids.propertyA }),
      ]),
    });
  });

  it("suspends account membership only after the client-owner scope check", async () => {
    const update = vi.fn().mockResolvedValue({ id: ids.membership, status: "SUSPENDED" });
    const create = vi.fn().mockResolvedValue({});
    const database = {
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({
          accountMembership: {
            findUnique: vi.fn(({ where }: { where: { userId_accountId: { userId: string } } }) =>
              where.userId_accountId.userId === ids.actor
                ? {
                    id: ids.membership,
                    status: "ACTIVE",
                    propertyAccesses: [{ propertyId: ids.propertyA }],
                  }
                : {
                    id: "target-membership",
                    role: "CLIENT_VIEWER",
                    status: "ACTIVE",
                    user: {
                      id: ids.target,
                      email: "member@oak.example",
                      displayName: "Member",
                      platformRole: null,
                    },
                    propertyAccesses: [{ propertyId: ids.propertyA, roleOverride: null }],
                  },
            ),
            update,
          },
          clientProperty: { findMany: vi.fn() },
          auditEvent: { create },
        }),
    };

    await revokeMemberAccess(context(), { userId: ids.target }, database as never);
    expect(update).toHaveBeenCalledWith({
      where: { id: "target-membership" },
      data: { status: "SUSPENDED" },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "account_membership.suspended" }),
      }),
    );
  });
});
