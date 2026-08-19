import "server-only";

import { z } from "zod";

import type { AccountRole, AppUser, PendingInvitationStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";

import { hasPlatformCapability } from "../auth/permissions";
import type { TrustedAuthIdentity } from "../auth/profile-sync";
import { createInvitation } from "../auth/invitations";
import type { AuthorizedPropertyContext } from "./property-context";
import { updateMemberAccess } from "./property-users";

const accountRoleSchema = z.enum([
  "CLIENT_OWNER",
  "CLIENT_MANAGER",
  "CLIENT_STAFF",
  "CLIENT_VIEWER",
]);
const pendingInvitationIdSchema = z.string().uuid();
const grantSchema = z.object({
  propertyId: z.string().uuid(),
  roleOverride: accountRoleSchema.nullable(),
});

export const pendingInvitationInputSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  propertyGrants: z.array(grantSchema).min(1, "Select at least one active property."),
  role: accountRoleSchema,
});

export type PendingInvitationDirectory = {
  invitations: Array<{
    email: string;
    expiresAt: Date;
    id: string;
    propertyGrants: Array<{
      propertyId: string;
      propertyName: string;
      roleOverride: AccountRole | null;
    }>;
    role: AccountRole;
    status: PendingInvitationStatus;
  }>;
  properties: Array<{ id: string; name: string }>;
};

type InvitationDatabase = Pick<
  typeof prisma,
  | "$transaction"
  | "accountMembership"
  | "appUser"
  | "auditEvent"
  | "clientProperty"
  | "pendingAccountInvitation"
>;

function expirationHours(): number {
  const supplied = Number(process.env.BTLS_PENDING_INVITATION_EXPIRY_HOURS ?? "24");
  return Number.isInteger(supplied) && supplied >= 1 && supplied <= 168 ? supplied : 24;
}

export function pendingInvitationExpiration(now = new Date()): Date {
  return new Date(now.getTime() + expirationHours() * 60 * 60 * 1000);
}

function canManageAllAccountUsers(context: AuthorizedPropertyContext): boolean {
  return hasPlatformCapability(context.user.platformRole, "platform.user.manage");
}

function requireInvitationManagement(context: AuthorizedPropertyContext): void {
  if (
    !canManageAllAccountUsers(context) &&
    !context.capabilities.property.includes("property.member.manage")
  ) {
    throw new Error("You do not have permission to manage property invitations.");
  }
}

async function ownerScopePropertyIds(
  context: AuthorizedPropertyContext,
  database: InvitationDatabase,
): Promise<string[]> {
  if (canManageAllAccountUsers(context)) {
    const properties = await database.clientProperty.findMany({
      where: { accountId: context.account.id },
      select: { id: true },
    });
    return properties.map((property) => property.id);
  }

  const membership = await database.accountMembership.findUnique({
    where: { userId_accountId: { userId: context.user.id, accountId: context.account.id } },
    include: { propertyAccesses: { select: { propertyId: true } } },
  });
  if (!membership || membership.status !== "ACTIVE") {
    throw new Error("You do not have permission to manage property invitations.");
  }
  return membership.propertyAccesses.map((access) => access.propertyId);
}

function requireScope(
  context: AuthorizedPropertyContext,
  propertyIds: string[],
  allowedPropertyIds: string[],
): void {
  if (canManageAllAccountUsers(context)) return;
  const allowed = new Set(allowedPropertyIds);
  if (propertyIds.some((propertyId) => !allowed.has(propertyId))) {
    throw new Error("You can manage invitations only for properties you are assigned to.");
  }
}

async function expirePendingInvitations(
  accountId: string,
  database: InvitationDatabase,
  now = new Date(),
): Promise<void> {
  const expired = await database.pendingAccountInvitation.findMany({
    where: { accountId, expiresAt: { lte: now }, status: "PENDING" },
    select: { id: true },
  });
  if (expired.length === 0) return;

  await database.$transaction(async (transaction) => {
    const result = await transaction.pendingAccountInvitation.updateMany({
      where: { id: { in: expired.map((invitation) => invitation.id) }, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
    if (result.count > 0) {
      await transaction.auditEvent.createMany({
        data: expired.map((invitation) => ({
          actorId: null,
          accountId,
          propertyId: null,
          action: "pending_invitation.expired",
          subjectType: "PendingAccountInvitation",
          subjectId: invitation.id,
        })),
      });
    }
  });
}

export async function getPendingInvitationDirectory(
  context: AuthorizedPropertyContext,
  database: InvitationDatabase = prisma,
): Promise<PendingInvitationDirectory> {
  requireInvitationManagement(context);
  await expirePendingInvitations(context.account.id, database);
  const scope = await ownerScopePropertyIds(context, database);
  const [properties, invitations] = await Promise.all([
    database.clientProperty.findMany({
      where: canManageAllAccountUsers(context)
        ? { accountId: context.account.id, status: "ACTIVE" }
        : { accountId: context.account.id, id: { in: scope }, status: "ACTIVE" },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { id: true, name: true },
    }),
    database.pendingAccountInvitation.findMany({
      where: { accountId: context.account.id },
      include: { propertyGrants: { include: { property: { select: { id: true, name: true } } } } },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }),
  ]);
  const scopeSet = new Set(scope);

  return {
    properties,
    invitations: invitations
      .filter(
        (invitation) =>
          canManageAllAccountUsers(context) ||
          invitation.propertyGrants.every((grant) => scopeSet.has(grant.propertyId)),
      )
      .map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        propertyGrants: invitation.propertyGrants.map((grant) => ({
          propertyId: grant.propertyId,
          propertyName: grant.property.name,
          roleOverride: grant.roleOverride,
        })),
      })),
  };
}

export async function createPendingInvitation(
  context: AuthorizedPropertyContext,
  input: unknown,
  dependencies: {
    createAuthInvitation?: typeof createInvitation;
    database?: InvitationDatabase;
    now?: Date;
  } = {},
): Promise<{ kind: "granted" | "pending"; id?: string }> {
  requireInvitationManagement(context);
  const data = pendingInvitationInputSchema.parse(input);
  const database = dependencies.database ?? prisma;
  const propertyIds = data.propertyGrants.map((grant) => grant.propertyId);
  if (new Set(propertyIds).size !== propertyIds.length) {
    throw new Error("Each property can receive only one intended grant.");
  }
  const scope = await ownerScopePropertyIds(context, database);
  requireScope(context, propertyIds, scope);
  const activePropertyCount = await database.clientProperty.count({
    where: { accountId: context.account.id, id: { in: propertyIds }, status: "ACTIVE" },
  });
  if (activePropertyCount !== propertyIds.length) {
    throw new Error("Each selected property must be active and belong to this account.");
  }

  const existingUser = await database.appUser.findUnique({ where: { email: data.email } });
  if (existingUser?.status === "ACTIVE") {
    if (!canManageAllAccountUsers(context) && existingUser.platformRole !== null) {
      throw new Error("Client Owners can manage client users only.");
    }
    await updateMemberAccess(context, {
      userId: existingUser.id,
      role: data.role,
      propertyGrants: data.propertyGrants,
    });
    return { kind: "granted" };
  }

  // Supabase is contacted before the transaction. The durable BTLS records contain no token or credential.
  const authInvitation = await (dependencies.createAuthInvitation ?? createInvitation)({
    email: data.email,
  });
  const now = dependencies.now ?? new Date();
  const expiresAt = pendingInvitationExpiration(now);
  await expirePendingInvitations(context.account.id, database, now);
  const result = await database.$transaction(async (transaction) => {
    const existing = await transaction.pendingAccountInvitation.findUnique({
      where: {
        invitedUserId_accountId: {
          invitedUserId: authInvitation.userId,
          accountId: context.account.id,
        },
      },
      include: { propertyGrants: { select: { propertyId: true } } },
    });
    if (existing?.status === "PENDING") {
      throw new Error("An active pending invitation already exists for this account and user.");
    }
    const invitation = await transaction.pendingAccountInvitation.upsert({
      where: {
        invitedUserId_accountId: {
          invitedUserId: authInvitation.userId,
          accountId: context.account.id,
        },
      },
      create: {
        accountId: context.account.id,
        invitedUserId: authInvitation.userId,
        email: authInvitation.email,
        role: data.role,
        expiresAt,
        invitedById: context.user.id,
      },
      update: {
        email: authInvitation.email,
        role: data.role,
        status: "PENDING",
        expiresAt,
        invitedById: context.user.id,
        appliedAt: null,
        cancelledAt: null,
      },
    });
    await transaction.pendingPropertyAccess.deleteMany({
      where: { pendingInvitationId: invitation.id },
    });
    await transaction.pendingPropertyAccess.createMany({
      data: data.propertyGrants.map((grant) => ({
        accountId: context.account.id,
        pendingInvitationId: invitation.id,
        propertyId: grant.propertyId,
        roleOverride: grant.roleOverride,
      })),
    });
    await transaction.auditEvent.create({
      data: {
        actorId: context.user.id,
        accountId: context.account.id,
        propertyId: context.property.id,
        action: "pending_invitation.created",
        subjectType: "PendingAccountInvitation",
        subjectId: invitation.id,
      },
    });
    return invitation;
  });
  return { kind: "pending", id: result.id };
}

export async function cancelPendingInvitation(
  context: AuthorizedPropertyContext,
  invitationId: string,
  database: InvitationDatabase = prisma,
): Promise<void> {
  requireInvitationManagement(context);
  const parsedInvitationId = pendingInvitationIdSchema.parse(invitationId);
  await expirePendingInvitations(context.account.id, database);
  const invitation = await database.pendingAccountInvitation.findFirst({
    where: { id: parsedInvitationId, accountId: context.account.id, status: "PENDING" },
    include: { propertyGrants: { select: { propertyId: true } } },
  });
  if (!invitation) throw new Error("This pending invitation is unavailable.");
  requireScope(
    context,
    invitation.propertyGrants.map((grant) => grant.propertyId),
    await ownerScopePropertyIds(context, database),
  );
  await database.$transaction(async (transaction) => {
    const result = await transaction.pendingAccountInvitation.updateMany({
      where: { id: invitation.id, status: "PENDING" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    if (result.count !== 1) throw new Error("This pending invitation is unavailable.");
    await transaction.auditEvent.create({
      data: {
        actorId: context.user.id,
        accountId: context.account.id,
        propertyId: context.property.id,
        action: "pending_invitation.cancelled",
        subjectType: "PendingAccountInvitation",
        subjectId: invitation.id,
      },
    });
  });
}

function trustedProfile(identity: TrustedAuthIdentity) {
  if (!identity.email || !identity.emailConfirmedAt) {
    throw new Error("A verified email address is required to activate pending authorization.");
  }
  return {
    email: identity.email,
    displayName:
      typeof identity.userMetadata?.display_name === "string"
        ? identity.userMetadata.display_name
        : undefined,
  };
}

/**
 * Receives only an identity already verified by Supabase. No provider call occurs in this transaction.
 * A conditional PENDING → APPLIED claim makes retries and concurrent replays idempotent.
 */
export async function synchronizeAndActivatePendingAuthorization(
  identity: TrustedAuthIdentity,
  database: InvitationDatabase = prisma,
): Promise<{ activated: number; user: AppUser }> {
  const profile = trustedProfile(identity);
  await expirePendingInvitationsForIdentity(identity.id, database);
  return database.$transaction(async (transaction) => {
    const user = await transaction.appUser.upsert({
      where: { id: identity.id },
      create: { id: identity.id, email: profile.email, displayName: profile.displayName },
      update: { email: profile.email, displayName: profile.displayName },
    });
    const pending = await transaction.pendingAccountInvitation.findMany({
      where: {
        invitedUserId: identity.id,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: { propertyGrants: true },
    });
    let activated = 0;
    for (const invitation of pending) {
      const claimed = await transaction.pendingAccountInvitation.updateMany({
        where: { id: invitation.id, status: "PENDING", expiresAt: { gt: new Date() } },
        data: { status: "APPLIED", appliedAt: new Date() },
      });
      if (claimed.count !== 1) continue;

      const validProperties = await transaction.clientProperty.count({
        where: {
          accountId: invitation.accountId,
          id: { in: invitation.propertyGrants.map((grant) => grant.propertyId) },
          status: "ACTIVE",
        },
      });
      if (validProperties !== invitation.propertyGrants.length) {
        throw new Error("The pending invitation has invalid property grants.");
      }
      const membership = await transaction.accountMembership.upsert({
        where: { userId_accountId: { userId: user.id, accountId: invitation.accountId } },
        create: {
          accountId: invitation.accountId,
          userId: user.id,
          role: invitation.role,
          status: "ACTIVE",
        },
        update: { role: invitation.role, status: "ACTIVE" },
      });
      for (const grant of invitation.propertyGrants) {
        const access = await transaction.propertyAccess.upsert({
          where: {
            membershipId_propertyId: { membershipId: membership.id, propertyId: grant.propertyId },
          },
          create: {
            accountId: invitation.accountId,
            membershipId: membership.id,
            propertyId: grant.propertyId,
            roleOverride: grant.roleOverride,
          },
          update: { roleOverride: grant.roleOverride },
        });
        await transaction.auditEvent.create({
          data: {
            actorId: invitation.invitedById,
            accountId: invitation.accountId,
            propertyId: grant.propertyId,
            action: "pending_property_access.applied",
            subjectType: "PropertyAccess",
            subjectId: access.id,
          },
        });
      }
      await transaction.auditEvent.createMany({
        data: [
          {
            actorId: invitation.invitedById,
            accountId: invitation.accountId,
            propertyId: null,
            action: "pending_invitation.applied",
            subjectType: "PendingAccountInvitation",
            subjectId: invitation.id,
          },
          {
            actorId: invitation.invitedById,
            accountId: invitation.accountId,
            propertyId: null,
            action: "account_membership.activated",
            subjectType: "AccountMembership",
            subjectId: membership.id,
          },
        ],
      });
      activated += 1;
    }
    return { activated, user };
  });
}

async function expirePendingInvitationsForIdentity(
  invitedUserId: string,
  database: InvitationDatabase,
): Promise<void> {
  const expired = await database.pendingAccountInvitation.findMany({
    where: { invitedUserId, expiresAt: { lte: new Date() }, status: "PENDING" },
    select: { accountId: true, id: true },
  });
  if (expired.length === 0) return;
  await database.$transaction(async (transaction) => {
    const result = await transaction.pendingAccountInvitation.updateMany({
      where: { id: { in: expired.map((invitation) => invitation.id) }, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
    if (result.count > 0) {
      await transaction.auditEvent.createMany({
        data: expired.map((invitation) => ({
          actorId: null,
          accountId: invitation.accountId,
          propertyId: null,
          action: "pending_invitation.expired",
          subjectType: "PendingAccountInvitation",
          subjectId: invitation.id,
        })),
      });
    }
  });
}
