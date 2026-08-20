import "server-only";

import type { AccountRole, PlatformRole } from "@/generated/prisma/client";

export const platformCapabilities = [
  "platform.property.read",
  "platform.property.manage",
  "platform.user.manage",
] as const;
export type PlatformCapability = (typeof platformCapabilities)[number];

export const propertyCapabilities = ["property.member.manage"] as const;
export type PropertyCapability = (typeof propertyCapabilities)[number];

const platformRoleCapabilities: Record<PlatformRole, readonly PlatformCapability[]> = {
  BTLS_ADMIN: ["platform.property.read", "platform.property.manage", "platform.user.manage"],
  BTLS_OPERATOR: ["platform.property.read"],
};

const accountRoleCapabilities: Record<AccountRole, readonly PropertyCapability[]> = {
  CLIENT_OWNER: ["property.member.manage"],
  CLIENT_MANAGER: [],
  CLIENT_STAFF: [],
  CLIENT_VIEWER: [],
};

export function hasPlatformCapability(
  role: PlatformRole | null,
  capability: PlatformCapability,
): boolean {
  return role !== null && platformRoleCapabilities[role].includes(capability);
}

export function requirePlatformCapability(
  user: { platformRole: PlatformRole | null },
  capability: PlatformCapability,
): void {
  if (!hasPlatformCapability(user.platformRole, capability)) {
    throw new Error("You do not have permission to perform this action.");
  }
}

export function hasPropertyCapability(role: AccountRole, capability: PropertyCapability): boolean {
  return accountRoleCapabilities[role].includes(capability);
}
