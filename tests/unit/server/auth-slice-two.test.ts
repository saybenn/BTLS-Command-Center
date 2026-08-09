import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/database/prisma", () => ({
  prisma: { $transaction: vi.fn() },
}));

import {
  disableAppUser,
  enableAppUser,
  persistAccountStateAndAudit,
  type AccountStateDependencies,
} from "@/server/auth/account-state";
import { hasPlatformCapability, requirePlatformCapability } from "@/server/auth/permissions";
import { synchronizeAppUserProfile } from "@/server/auth/profile-sync";
import { requireAuthenticatedAppUserWith } from "@/server/auth/session";

const actor = { id: "actor-id", platformRole: "BTLS_ADMIN" as const };
const targetUserId = "target-user-id";

function createDependencies(log: string[]): AccountStateDependencies {
  return {
    banAndRevokeAuthSessions: async () => {
      log.push("ban");
    },
    clearAuthBan: async () => {
      log.push("unban");
    },
    persistStateAndAudit: async () => {
      log.push("persist");
    },
  };
}

describe("Feature 04 Slice 2 application access", () => {
  it("maps platform.user.manage through platform roles without authorizing role checks", () => {
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.user.manage")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.user.manage")).toBe(false);
    expect(() => requirePlatformCapability({ platformRole: null }, "platform.user.manage")).toThrow(
      "You do not have permission",
    );
  });

  it("synchronizes only trusted profile fields and preserves BTLS access state", async () => {
    const upsert = vi.fn().mockResolvedValue({ id: targetUserId });

    await synchronizeAppUserProfile(
      {
        id: targetUserId,
        email: "member@example.com",
        emailConfirmedAt: "2026-08-08T00:00:00.000Z",
        userMetadata: { display_name: "Member Name", platformRole: "BTLS_ADMIN" },
      },
      { appUser: { upsert } } as never,
    );

    expect(upsert).toHaveBeenCalledWith({
      where: { id: targetUserId },
      create: {
        id: targetUserId,
        email: "member@example.com",
        displayName: "Member Name",
      },
      update: {
        email: "member@example.com",
        displayName: "Member Name",
      },
    });
  });

  it("denies a disabled AppUser on an otherwise verified protected request", async () => {
    await expect(
      requireAuthenticatedAppUserWith({
        getClaims: async () => ({ data: { claims: { sub: targetUserId } }, error: null }),
        findAppUser: async () => ({ status: "DISABLED" }) as never,
      }),
    ).rejects.toThrow("Your BTLS account is disabled.");
  });

  it("persists disable state and audit before the provider call, then reverses that order on enable", async () => {
    const disableLog: string[] = [];
    await disableAppUser(actor, targetUserId, createDependencies(disableLog));
    expect(disableLog).toEqual(["persist", "ban"]);

    const enableLog: string[] = [];
    await enableAppUser(actor, targetUserId, createDependencies(enableLog));
    expect(enableLog).toEqual(["unban", "persist"]);
  });

  it("writes platform-scoped account-state audit events with actor and target", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const create = vi.fn().mockResolvedValue(undefined);
    const database = {
      $transaction: async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({ appUser: { update }, auditEvent: { create } }),
    };

    await persistAccountStateAndAudit(
      {
        action: "user.disabled",
        actorId: actor.id,
        status: "DISABLED",
        targetUserId,
      },
      database as never,
    );

    expect(update).toHaveBeenCalledWith({
      where: { id: targetUserId },
      data: { status: "DISABLED" },
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        actorId: actor.id,
        accountId: null,
        propertyId: null,
        action: "user.disabled",
        subjectType: "AppUser",
        subjectId: targetUserId,
      },
    });
  });

  it("keeps BTLS denial durable when provider disable fails and never activates before unban succeeds", async () => {
    const disableLog: string[] = [];
    const providerFailure = new Error("Supabase unavailable");
    const failingDisableDependencies: AccountStateDependencies = {
      ...createDependencies(disableLog),
      banAndRevokeAuthSessions: async () => {
        disableLog.push("ban");
        throw providerFailure;
      },
    };

    await expect(disableAppUser(actor, targetUserId, failingDisableDependencies)).rejects.toThrow(
      providerFailure,
    );
    expect(disableLog).toEqual(["persist", "ban"]);

    const enableLog: string[] = [];
    const failingEnableDependencies: AccountStateDependencies = {
      ...createDependencies(enableLog),
      clearAuthBan: async () => {
        enableLog.push("unban");
        throw providerFailure;
      },
    };

    await expect(enableAppUser(actor, targetUserId, failingEnableDependencies)).rejects.toThrow(
      providerFailure,
    );
    expect(enableLog).toEqual(["unban"]);
  });
});
