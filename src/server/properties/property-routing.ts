import "server-only";

import type { AppUser } from "@/generated/prisma/client";

import { hasPlatformCapability } from "../auth/permissions";
import type { AuthorizedPropertyListResolution } from "./property-context";

export function resolvePropertyLandingDestination(
  user: Pick<AppUser, "platformRole">,
  properties: AuthorizedPropertyListResolution,
): string {
  if (hasPlatformCapability(user.platformRole, "platform.property.read")) {
    return "/admin/properties";
  }

  if (properties.status !== "authorized" || properties.properties.length === 0) {
    return "/no-access";
  }

  if (properties.properties.length === 1) {
    return `/${properties.properties[0].property.id}/overview`;
  }

  return "/select-property";
}
