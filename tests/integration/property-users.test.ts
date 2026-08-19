import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/server/database/prisma";
import { updateMemberAccess } from "@/server/properties/property-users";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";

const fixture = {
  accountId: randomUUID(),
  actorId: randomUUID(),
  actorMembershipId: randomUUID(),
  propertyAId: randomUUID(),
  propertyBId: randomUUID(),
  targetId: randomUUID(),
  targetMembershipId: randomUUID(),
};

function ownerContext(): AuthorizedPropertyContext {
  return {
    account: { id: fixture.accountId, name: "Slice Five Account" },
    capabilities: { platform: [], property: ["property.member.manage"] },
    effectiveRole: "CLIENT_OWNER",
    membership: { id: fixture.actorMembershipId, role: "CLIENT_OWNER" },
    property: { id: fixture.propertyAId, name: "Slice Five A", domain: null },
    propertyAccess: { id: randomUUID(), roleOverride: null },
    user: {
      id: fixture.actorId,
      email: "slice-five-owner@example.test",
      displayName: "Slice Five Owner",
      platformRole: null,
    },
  };
}

describe("Feature 05 Slice 5 property-user tenant isolation", () => {
  beforeAll(async () => {
    await prisma.appUser.createMany({
      data: [
        {
          id: fixture.actorId,
          email: "slice-five-owner@example.test",
          displayName: "Slice Five Owner",
        },
        {
          id: fixture.targetId,
          email: "slice-five-member@example.test",
          displayName: "Slice Five Member",
        },
      ],
    });
    await prisma.clientAccount.create({
      data: { id: fixture.accountId, name: "Slice Five Account" },
    });
    await prisma.clientProperty.createMany({
      data: [
        { id: fixture.propertyAId, accountId: fixture.accountId, name: "Slice Five A" },
        { id: fixture.propertyBId, accountId: fixture.accountId, name: "Slice Five B" },
      ],
    });
    await prisma.accountMembership.createMany({
      data: [
        {
          id: fixture.actorMembershipId,
          accountId: fixture.accountId,
          userId: fixture.actorId,
          role: "CLIENT_OWNER",
        },
        {
          id: fixture.targetMembershipId,
          accountId: fixture.accountId,
          userId: fixture.targetId,
          role: "CLIENT_VIEWER",
        },
      ],
    });
    await prisma.propertyAccess.createMany({
      data: [
        {
          accountId: fixture.accountId,
          membershipId: fixture.actorMembershipId,
          propertyId: fixture.propertyAId,
        },
        {
          accountId: fixture.accountId,
          membershipId: fixture.targetMembershipId,
          propertyId: fixture.propertyBId,
        },
      ],
    });
  });

  afterAll(async () => {
    try {
      await prisma.auditEvent.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.propertyAccess.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.accountMembership.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.clientProperty.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.clientAccount.deleteMany({ where: { id: fixture.accountId } });
      await prisma.appUser.deleteMany({
        where: { id: { in: [fixture.actorId, fixture.targetId] } },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  it("denies a Client Owner's cross-property mutation and leaves the target membership unchanged", async () => {
    await expect(
      updateMemberAccess(ownerContext(), {
        userId: fixture.targetId,
        role: "CLIENT_MANAGER",
        propertyGrants: [{ propertyId: fixture.propertyAId, roleOverride: null }],
      }),
    ).rejects.toThrow("only for properties you are assigned to");

    const target = await prisma.accountMembership.findUniqueOrThrow({
      where: { userId_accountId: { userId: fixture.targetId, accountId: fixture.accountId } },
      include: { propertyAccesses: { select: { propertyId: true } } },
    });
    expect(target.role).toBe("CLIENT_VIEWER");
    expect(target.propertyAccesses).toEqual([{ propertyId: fixture.propertyBId }]);
  });
});
