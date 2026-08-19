import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/server/database/prisma";
import {
  cancelPendingInvitation,
  createPendingInvitation,
  synchronizeAndActivatePendingAuthorization,
} from "@/server/properties/property-invitations";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";

const fixture = {
  accountId: randomUUID(),
  actorId: randomUUID(),
  membershipId: randomUUID(),
  propertyId: randomUUID(),
  cancelledUserId: randomUUID(),
  expiredUserId: randomUUID(),
  invitedUserId: randomUUID(),
};

function context(): AuthorizedPropertyContext {
  return {
    account: { id: fixture.accountId, name: "Slice Six Account" },
    capabilities: { platform: [], property: ["property.member.manage"] },
    effectiveRole: "CLIENT_OWNER",
    membership: { id: fixture.membershipId, role: "CLIENT_OWNER" },
    property: { id: fixture.propertyId, name: "Slice Six Property", domain: null },
    propertyAccess: { id: randomUUID(), roleOverride: null },
    user: {
      id: fixture.actorId,
      email: "slice-six-owner@example.test",
      displayName: "Slice Six Owner",
      platformRole: null,
    },
  };
}

function invitationInput(email: string) {
  return {
    email,
    role: "CLIENT_VIEWER" as const,
    propertyGrants: [{ propertyId: fixture.propertyId, roleOverride: "CLIENT_STAFF" as const }],
  };
}

describe("Feature 05 Slice 6 pending invitation activation", () => {
  beforeAll(async () => {
    await prisma.appUser.create({
      data: {
        id: fixture.actorId,
        email: "slice-six-owner@example.test",
        displayName: "Slice Six Owner",
      },
    });
    await prisma.clientAccount.create({
      data: { id: fixture.accountId, name: "Slice Six Account" },
    });
    await prisma.clientProperty.create({
      data: { id: fixture.propertyId, accountId: fixture.accountId, name: "Slice Six Property" },
    });
    await prisma.accountMembership.create({
      data: {
        id: fixture.membershipId,
        accountId: fixture.accountId,
        userId: fixture.actorId,
        role: "CLIENT_OWNER",
      },
    });
    await prisma.propertyAccess.create({
      data: {
        accountId: fixture.accountId,
        membershipId: fixture.membershipId,
        propertyId: fixture.propertyId,
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.auditEvent.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.propertyAccess.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.accountMembership.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.pendingAccountInvitation.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.clientProperty.deleteMany({ where: { accountId: fixture.accountId } });
      await prisma.clientAccount.deleteMany({ where: { id: fixture.accountId } });
      await prisma.appUser.deleteMany({
        where: {
          id: {
            in: [
              fixture.actorId,
              fixture.invitedUserId,
              fixture.cancelledUserId,
              fixture.expiredUserId,
            ],
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  it("activates a verified invitation atomically and makes replay idempotent", async () => {
    await createPendingInvitation(context(), invitationInput("slice-six-invited@example.test"), {
      createAuthInvitation: async () => ({
        email: "slice-six-invited@example.test",
        userId: fixture.invitedUserId,
      }),
    });
    const identity = {
      id: fixture.invitedUserId,
      email: "slice-six-invited@example.test",
      emailConfirmedAt: new Date().toISOString(),
      userMetadata: { display_name: "Slice Six Invited" },
    };

    await expect(synchronizeAndActivatePendingAuthorization(identity)).resolves.toMatchObject({
      activated: 1,
    });
    await expect(synchronizeAndActivatePendingAuthorization(identity)).resolves.toMatchObject({
      activated: 0,
    });

    const [membership, invitation, audits] = await Promise.all([
      prisma.accountMembership.findUniqueOrThrow({
        where: {
          userId_accountId: { userId: fixture.invitedUserId, accountId: fixture.accountId },
        },
        include: { propertyAccesses: true },
      }),
      prisma.pendingAccountInvitation.findUniqueOrThrow({
        where: {
          invitedUserId_accountId: {
            invitedUserId: fixture.invitedUserId,
            accountId: fixture.accountId,
          },
        },
      }),
      prisma.auditEvent.findMany({
        where: { accountId: fixture.accountId, subjectId: fixture.invitedUserId },
      }),
    ]);

    expect(membership.role).toBe("CLIENT_VIEWER");
    expect(membership.propertyAccesses).toHaveLength(1);
    expect(membership.propertyAccesses[0]).toMatchObject({
      propertyId: fixture.propertyId,
      roleOverride: "CLIENT_STAFF",
    });
    expect(invitation.status).toBe("APPLIED");
    expect(audits).toHaveLength(0);
  });

  it("cancellation and expiry allow profile creation but never activate BTLS access", async () => {
    const cancelled = await createPendingInvitation(
      context(),
      invitationInput("slice-six-cancelled@example.test"),
      {
        createAuthInvitation: async () => ({
          email: "slice-six-cancelled@example.test",
          userId: fixture.cancelledUserId,
        }),
      },
    );
    if (!cancelled.id) throw new Error("Expected a pending invitation.");
    await cancelPendingInvitation(context(), cancelled.id);
    await expect(
      synchronizeAndActivatePendingAuthorization({
        id: fixture.cancelledUserId,
        email: "slice-six-cancelled@example.test",
        emailConfirmedAt: new Date().toISOString(),
      }),
    ).resolves.toMatchObject({ activated: 0 });

    await createPendingInvitation(context(), invitationInput("slice-six-expired@example.test"), {
      createAuthInvitation: async () => ({
        email: "slice-six-expired@example.test",
        userId: fixture.expiredUserId,
      }),
      now: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });
    await expect(
      synchronizeAndActivatePendingAuthorization({
        id: fixture.expiredUserId,
        email: "slice-six-expired@example.test",
        emailConfirmedAt: new Date().toISOString(),
      }),
    ).resolves.toMatchObject({ activated: 0 });

    const memberships = await prisma.accountMembership.findMany({
      where: {
        accountId: fixture.accountId,
        userId: { in: [fixture.cancelledUserId, fixture.expiredUserId] },
      },
    });
    const invitations = await prisma.pendingAccountInvitation.findMany({
      where: {
        accountId: fixture.accountId,
        invitedUserId: { in: [fixture.cancelledUserId, fixture.expiredUserId] },
      },
      select: { status: true },
      orderBy: { status: "asc" },
    });
    expect(memberships).toHaveLength(0);
    expect(invitations).toEqual([{ status: "CANCELLED" }, { status: "EXPIRED" }]);
  });
});
