import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/server/database/prisma";
import { listAdminProperties, onboardAccountProperty } from "@/server/properties/admin-properties";

const suffix = randomUUID().slice(0, 8);
const domain = `slice-three-${suffix}.example.test`;
let actorId: string;
let accountId: string | undefined;
let propertyId: string | undefined;

describe("Feature 05 Slice 3 admin property onboarding", () => {
  beforeAll(async () => {
    const admin = await prisma.appUser.findFirst({
      where: { platformRole: "BTLS_ADMIN", status: "ACTIVE" },
      select: { id: true },
    });

    if (!admin) {
      throw new Error("The local seed must provide an active BTLS admin.");
    }

    actorId = admin.id;
  });

  afterAll(async () => {
    if (accountId) {
      await prisma.auditEvent.deleteMany({ where: { accountId } });
      if (propertyId) {
        await prisma.clientProperty.delete({ where: { id: propertyId } });
      }
      await prisma.clientAccount.delete({ where: { id: accountId } });
    }
    await prisma.$disconnect();
  });

  it("creates an active property that appears immediately in the authorized directory with audit history", async () => {
    const created = await onboardAccountProperty(
      { id: actorId, platformRole: "BTLS_ADMIN" },
      {
        accountName: `Slice Three Account ${suffix}`,
        propertyName: "Slice Three Property",
        domain,
      },
    );
    accountId = created.account.id;
    propertyId = created.property.id;

    const directory = await listAdminProperties(
      { id: actorId, platformRole: "BTLS_ADMIN" },
      { search: domain, status: "ACTIVE" },
    );
    const auditEvents = await prisma.auditEvent.findMany({
      where: { accountId, actorId },
      select: { action: true, propertyId: true },
      orderBy: { action: "asc" },
    });

    expect(created.account.status).toBe("ACTIVE");
    expect(created.property.status).toBe("ACTIVE");
    expect(directory.items).toContainEqual(
      expect.objectContaining({ id: propertyId, domain, name: "Slice Three Property" }),
    );
    expect(auditEvents).toEqual(
      expect.arrayContaining([
        { action: "account.created", propertyId: null },
        { action: "property.created", propertyId },
      ]),
    );
  });

  it("does not let a client without platform read enumerate the management directory", async () => {
    await expect(listAdminProperties({ id: actorId, platformRole: null }, {})).rejects.toThrow(
      "You do not have permission",
    );
  });
});
