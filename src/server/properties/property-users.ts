import "server-only";

import { z } from "zod";

import type { AccountRole, AppUser } from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";

import { hasPlatformCapability } from "../auth/permissions";
import type { AuthorizedPropertyContext } from "./property-context";

const accountRoleSchema = z.enum([
  "CLIENT_OWNER",
  "CLIENT_MANAGER",
  "CLIENT_STAFF",
  "CLIENT_VIEWER",
]);
const propertyGrantSchema = z.object({
  propertyId: z.string().uuid(),
  roleOverride: accountRoleSchema.nullable(),
});

export const memberAccessUpdateSchema = z.object({
  propertyGrants: z.array(propertyGrantSchema).min(1, "Select at least one active property."),
  role: accountRoleSchema,
  userId: z.string().uuid(),
});

export const memberAccessRevocationSchema = z.object({ userId: z.string().uuid() });

export type PropertyUserAdministration = {
  members: Array<{
    id: string;
    email: string;
    displayName: string | null;
    role: AccountRole;
    status: "ACTIVE" | "SUSPENDED";
    propertyGrants: Array<{ propertyId: string; roleOverride: AccountRole | null }>;
  }>;
  properties: Array<{ id: string; name: string }>;
};

type MembershipRecord = {
  id: string;
  role: AccountRole;
  status: "ACTIVE" | "SUSPENDED";
  user: Pick<AppUser, "id" | "email" | "displayName" | "platformRole">;
  propertyAccesses: Array<{ propertyId: string; roleOverride: AccountRole | null }>;
};

type PropertyUserDatabase = Pick<
  typeof prisma,
  "$transaction" | "accountMembership" | "appUser" | "clientProperty"
>;

function canManageAllAccountUsers(context: AuthorizedPropertyContext): boolean {
  return hasPlatformCapability(context.user.platformRole, "platform.user.manage");
}

function canManagePropertyUsers(context: AuthorizedPropertyContext): boolean {
  return (
    canManageAllAccountUsers(context) ||
    context.capabilities.property.includes("property.member.manage")
  );
}

function requireUserManagement(context: AuthorizedPropertyContext): void {
  if (!canManagePropertyUsers(context)) {
    throw new Error("You do not have permission to manage property users.");
  }
}

async function getOwnerScopePropertyIds(
  context: AuthorizedPropertyContext,
  database: PropertyUserDatabase,
): Promise<string[]> {
  if (canManageAllAccountUsers(context)) {
    const properties = await database.clientProperty.findMany({
      where: { accountId: context.account.id },
      select: { id: true },
    });
    return properties.map((property) => property.id);
  }

  const ownerMembership = await database.accountMembership.findUnique({
    where: { userId_accountId: { userId: context.user.id, accountId: context.account.id } },
    include: { propertyAccesses: { select: { propertyId: true } } },
  });
  if (!ownerMembership || ownerMembership.status !== "ACTIVE") {
    throw new Error("You do not have permission to manage property users.");
  }

  return ownerMembership.propertyAccesses.map((access) => access.propertyId);
}

function requireWithinOwnerScope(
  context: AuthorizedPropertyContext,
  target: MembershipRecord,
  selectedPropertyIds: string[],
  ownerScopePropertyIds: string[],
): void {
  if (canManageAllAccountUsers(context)) {
    return;
  }

  if (target.user.platformRole !== null) {
    throw new Error("Client Owners can manage client users only.");
  }
  const scope = new Set(ownerScopePropertyIds);
  if (
    target.propertyAccesses.some((access) => !scope.has(access.propertyId)) ||
    selectedPropertyIds.some((propertyId) => !scope.has(propertyId))
  ) {
    throw new Error("You can manage access only for properties you are assigned to.");
  }
}

async function findMembership(
  accountId: string,
  userId: string,
  database: PropertyUserDatabase,
): Promise<MembershipRecord | null> {
  return database.accountMembership.findUnique({
    where: { userId_accountId: { userId, accountId } },
    include: {
      user: { select: { id: true, email: true, displayName: true, platformRole: true } },
      propertyAccesses: { select: { propertyId: true, roleOverride: true } },
    },
  });
}

export async function getPropertyUserAdministration(
  context: AuthorizedPropertyContext,
  database: PropertyUserDatabase = prisma,
): Promise<PropertyUserAdministration> {
  requireUserManagement(context);
  const ownerScopePropertyIds = await getOwnerScopePropertyIds(context, database);
  const propertyScope = canManageAllAccountUsers(context)
    ? { accountId: context.account.id }
    : { accountId: context.account.id, id: { in: ownerScopePropertyIds } };
  const [properties, memberships] = await Promise.all([
    database.clientProperty.findMany({
      where: propertyScope,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { id: true, name: true },
    }),
    database.accountMembership.findMany({
      where: { accountId: context.account.id },
      orderBy: [{ user: { email: "asc" } }, { id: "asc" }],
      include: {
        user: { select: { id: true, email: true, displayName: true, platformRole: true } },
        propertyAccesses: { select: { propertyId: true, roleOverride: true } },
      },
    }),
  ]);
  const scope = new Set(ownerScopePropertyIds);

  return {
    properties,
    members: memberships
      .filter(
        (membership) =>
          canManageAllAccountUsers(context) ||
          (membership.user.platformRole === null &&
            membership.propertyAccesses.every((access) => scope.has(access.propertyId))),
      )
      .map((membership) => ({
        id: membership.user.id,
        email: membership.user.email,
        displayName: membership.user.displayName,
        role: membership.role,
        status: membership.status,
        propertyGrants: membership.propertyAccesses,
      })),
  };
}

export async function updateMemberAccess(
  context: AuthorizedPropertyContext,
  input: unknown,
  database: PropertyUserDatabase = prisma,
) {
  requireUserManagement(context);
  const data = memberAccessUpdateSchema.parse(input);
  const uniquePropertyIds = new Set(data.propertyGrants.map((grant) => grant.propertyId));
  if (uniquePropertyIds.size !== data.propertyGrants.length) {
    throw new Error("Each property can receive only one access grant.");
  }

  return database.$transaction(async (transaction) => {
    const [user, existingMembership, ownerScopePropertyIds] = await Promise.all([
      transaction.appUser.findUnique({ where: { id: data.userId } }),
      findMembership(context.account.id, data.userId, transaction as PropertyUserDatabase),
      getOwnerScopePropertyIds(context, transaction as PropertyUserDatabase),
    ]);
    if (!user || user.status !== "ACTIVE") {
      throw new Error("The selected user is unavailable.");
    }
    const target: MembershipRecord = existingMembership ?? {
      id: "",
      role: data.role,
      status: "ACTIVE",
      user,
      propertyAccesses: [],
    };
    requireWithinOwnerScope(context, target, [...uniquePropertyIds], ownerScopePropertyIds);

    const availablePropertyCount = await transaction.clientProperty.count({
      where: {
        accountId: context.account.id,
        id: { in: [...uniquePropertyIds] },
        status: "ACTIVE",
      },
    });
    if (availablePropertyCount !== uniquePropertyIds.size) {
      throw new Error("Each selected property must be active and belong to this account.");
    }

    const membership = await transaction.accountMembership.upsert({
      where: { userId_accountId: { userId: data.userId, accountId: context.account.id } },
      create: {
        accountId: context.account.id,
        userId: data.userId,
        role: data.role,
        status: "ACTIVE",
      },
      update: { role: data.role, status: "ACTIVE" },
    });
    const existingByPropertyId = new Map(
      target.propertyAccesses.map((access) => [access.propertyId, access]),
    );
    const submittedByPropertyId = new Map(
      data.propertyGrants.map((grant) => [grant.propertyId, grant]),
    );
    const audits: Array<{
      actorId: string;
      accountId: string;
      propertyId: string | null;
      action: string;
      subjectType: string;
      subjectId: string;
    }> = [
      {
        actorId: context.user.id,
        accountId: context.account.id,
        propertyId: context.property.id,
        action: existingMembership ? "account_membership.updated" : "account_membership.created",
        subjectType: "AccountMembership",
        subjectId: membership.id,
      },
    ];

    for (const grant of data.propertyGrants) {
      const existing = existingByPropertyId.get(grant.propertyId);
      const propertyAccess = await transaction.propertyAccess.upsert({
        where: {
          membershipId_propertyId: { membershipId: membership.id, propertyId: grant.propertyId },
        },
        create: {
          accountId: context.account.id,
          membershipId: membership.id,
          propertyId: grant.propertyId,
          roleOverride: grant.roleOverride,
        },
        update: { roleOverride: grant.roleOverride },
      });
      audits.push({
        actorId: context.user.id,
        accountId: context.account.id,
        propertyId: grant.propertyId,
        action: existing ? "property_access.updated" : "property_access.granted",
        subjectType: "PropertyAccess",
        subjectId: propertyAccess.id,
      });
    }

    for (const access of target.propertyAccesses) {
      if (!submittedByPropertyId.has(access.propertyId)) {
        await transaction.propertyAccess.delete({
          where: {
            membershipId_propertyId: { membershipId: membership.id, propertyId: access.propertyId },
          },
        });
        audits.push({
          actorId: context.user.id,
          accountId: context.account.id,
          propertyId: access.propertyId,
          action: "property_access.revoked",
          subjectType: "PropertyAccess",
          subjectId: access.propertyId,
        });
      }
    }
    await transaction.auditEvent.createMany({ data: audits });
    return membership;
  });
}

export async function revokeMemberAccess(
  context: AuthorizedPropertyContext,
  input: unknown,
  database: PropertyUserDatabase = prisma,
) {
  requireUserManagement(context);
  const data = memberAccessRevocationSchema.parse(input);

  return database.$transaction(async (transaction) => {
    const [membership, ownerScopePropertyIds] = await Promise.all([
      findMembership(context.account.id, data.userId, transaction as PropertyUserDatabase),
      getOwnerScopePropertyIds(context, transaction as PropertyUserDatabase),
    ]);
    if (!membership) {
      throw new Error("The selected user is not a member of this account.");
    }
    requireWithinOwnerScope(context, membership, [], ownerScopePropertyIds);

    const updated = await transaction.accountMembership.update({
      where: { id: membership.id },
      data: { status: "SUSPENDED" },
    });
    await transaction.auditEvent.create({
      data: {
        actorId: context.user.id,
        accountId: context.account.id,
        propertyId: context.property.id,
        action: "account_membership.suspended",
        subjectType: "AccountMembership",
        subjectId: membership.id,
      },
    });
    return updated;
  });
}
