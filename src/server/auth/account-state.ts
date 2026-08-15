import "server-only";

import type { AppUserStatus, PlatformRole } from "@/generated/prisma/client";

import { prisma } from "@/server/database/prisma";

import { requirePlatformCapability } from "./permissions";
import { createSupabaseAdminClient } from "./supabase-admin";

type Actor = { id: string; platformRole: PlatformRole | null };

export type AccountStateDependencies = {
  banAndRevokeAuthSessions: (userId: string) => Promise<void>;
  clearAuthBan: (userId: string) => Promise<void>;
  persistStateAndAudit: (input: {
    action: "user.disabled" | "user.enabled";
    actorId: string;
    status: AppUserStatus;
    targetUserId: string;
  }) => Promise<void>;
};

export async function persistAccountStateAndAudit(
  input: Parameters<AccountStateDependencies["persistStateAndAudit"]>[0],
  database: Pick<typeof prisma, "$transaction"> = prisma,
): Promise<void> {
  await database.$transaction(async (transaction) => {
    await transaction.appUser.update({
      where: { id: input.targetUserId },
      data: { status: input.status },
    });
    await transaction.auditEvent.create({
      data: {
        actorId: input.actorId,
        accountId: null,
        propertyId: null,
        action: input.action,
        subjectType: "AppUser",
        subjectId: input.targetUserId,
      },
    });
  });
}

export function createAccountStateDependencies(): AccountStateDependencies {
  return {
    async banAndRevokeAuthSessions(userId) {
      const { error } = await createSupabaseAdminClient().auth.admin.updateUserById(userId, {
        ban_duration: "876000h",
      });

      if (error) {
        throw error;
      }
    },
    async clearAuthBan(userId) {
      const { error } = await createSupabaseAdminClient().auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (error) {
        throw error;
      }
    },
    persistStateAndAudit: persistAccountStateAndAudit,
  };
}

export async function disableAppUser(
  actor: Actor,
  targetUserId: string,
  dependencies: AccountStateDependencies,
): Promise<void> {
  requirePlatformCapability(actor, "platform.user.manage");
  await dependencies.persistStateAndAudit({
    action: "user.disabled",
    actorId: actor.id,
    status: "DISABLED",
    targetUserId,
  });
  await dependencies.banAndRevokeAuthSessions(targetUserId);
}

export async function enableAppUser(
  actor: Actor,
  targetUserId: string,
  dependencies: AccountStateDependencies,
): Promise<void> {
  requirePlatformCapability(actor, "platform.user.manage");
  await dependencies.clearAuthBan(targetUserId);
  await dependencies.persistStateAndAudit({
    action: "user.enabled",
    actorId: actor.id,
    status: "ACTIVE",
    targetUserId,
  });
}
