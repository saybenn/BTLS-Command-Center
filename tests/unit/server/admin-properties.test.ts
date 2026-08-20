import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/database/prisma", () => ({ prisma: {} }));

import {
  changeAccountStatus,
  changePropertyStatus,
  listAdminProperties,
  onboardAccountProperty,
} from "@/server/properties/admin-properties";

const admin = { id: "00000000-0000-4000-8000-000000000001", platformRole: "BTLS_ADMIN" as const };
const operator = {
  id: "00000000-0000-4000-8000-000000000002",
  platformRole: "BTLS_OPERATOR" as const,
};
const accountId = "00000000-0000-4000-8000-000000000003";
const propertyId = "00000000-0000-4000-8000-000000000004";

describe("Feature 05 Slice 3 property administration services", () => {
  it("uses platform.property.read instead of a role-name check before directory reads", async () => {
    const count = vi.fn();
    const database = { clientProperty: { count, findMany: vi.fn() } };

    await expect(
      listAdminProperties({ id: operator.id, platformRole: null }, {}, database as never),
    ).rejects.toThrow("You do not have permission");
    expect(count).not.toHaveBeenCalled();
  });

  it("allows a platform property reader to enumerate the shared directory without onboarding authority", async () => {
    const count = vi.fn().mockResolvedValue(0);
    const findMany = vi.fn().mockResolvedValue([]);

    await expect(
      listAdminProperties(operator, {}, { clientProperty: { count, findMany } } as never),
    ).resolves.toMatchObject({ items: [], total: 0 });
    expect(count).toHaveBeenCalledOnce();
  });
  it("searches, filters, and paginates the management directory", async () => {
    const count = vi.fn().mockResolvedValue(21);
    const findMany = vi.fn().mockResolvedValue([
      {
        id: propertyId,
        name: "Oak HVAC",
        domain: "oak.example",
        status: "ACTIVE",
        account: { id: accountId, name: "Oak Services", status: "ACTIVE" },
      },
    ]);
    const result = await listAdminProperties(
      admin,
      { page: "2", search: "oak", status: "ACTIVE" },
      { clientProperty: { count, findMany } } as never,
    );

    expect(count).toHaveBeenCalledWith({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: "oak", mode: "insensitive" } },
          { domain: { contains: "oak", mode: "insensitive" } },
          { account: { name: { contains: "oak", mode: "insensitive" } } },
        ],
      },
    });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 20 }));
    expect(result).toMatchObject({
      page: 2,
      total: 21,
      totalPages: 2,
      items: [{ id: propertyId }],
    });
  });

  it("creates active account and property defaults together with scoped audit events", async () => {
    const accountCreate = vi.fn().mockResolvedValue({ id: accountId, name: "Oak Services" });
    const propertyCreate = vi
      .fn()
      .mockResolvedValue({ id: propertyId, accountId, name: "Oak HVAC" });
    const auditCreateMany = vi.fn().mockResolvedValue({ count: 2 });
    const database = {
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({
          clientAccount: { create: accountCreate },
          clientProperty: { create: propertyCreate },
          auditEvent: { createMany: auditCreateMany },
        }),
    };

    await expect(
      onboardAccountProperty(
        admin,
        { accountName: " Oak Services ", propertyName: " Oak HVAC ", domain: "OAK.EXAMPLE" },
        database as never,
      ),
    ).resolves.toMatchObject({ account: { id: accountId }, property: { id: propertyId } });
    expect(accountCreate).toHaveBeenCalledWith({
      data: { name: "Oak Services", status: "ACTIVE" },
    });
    expect(propertyCreate).toHaveBeenCalledWith({
      data: { accountId, name: "Oak HVAC", domain: "oak.example", status: "ACTIVE" },
    });
    expect(auditCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ action: "account.created", accountId, propertyId: null }),
        expect.objectContaining({ action: "property.created", accountId, propertyId }),
      ]),
    });
  });

  it("audits account and property status changes through the same capability boundary", async () => {
    const accountUpdate = vi.fn().mockResolvedValue({ id: accountId });
    const propertyUpdate = vi.fn().mockResolvedValue({ id: propertyId, accountId });
    const auditCreate = vi.fn().mockResolvedValue({});
    const database = {
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({
          clientAccount: { update: accountUpdate },
          clientProperty: { update: propertyUpdate },
          auditEvent: { create: auditCreate },
        }),
    };

    await changeAccountStatus(admin, { accountId, status: "SUSPENDED" }, database as never);
    await changePropertyStatus(admin, { propertyId, status: "SUSPENDED" }, database as never);

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "account.status_suspended" }),
      }),
    );
    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "property.status_suspended" }),
      }),
    );
  });
});
