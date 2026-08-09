import "server-only";

import type { PlatformRole } from "@/generated/prisma/client";

export const platformCapabilities = ["platform.user.manage"] as const;
export type PlatformCapability = (typeof platformCapabilities)[number];

const platformRoleCapabilities: Record<PlatformRole, readonly PlatformCapability[]> = {
  BTLS_ADMIN: ["platform.user.manage"],
  BTLS_OPERATOR: [],
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
