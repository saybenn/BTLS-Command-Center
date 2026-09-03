import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PropertySwitcher } from "@/components/properties/property-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AuthorizedPropertyContext,
  AuthorizedPropertySummary,
} from "@/server/properties/property-context";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function PropertyOverviewShell({
  activeNavigation = "overview",
  context,
  properties,
  children,
}: Readonly<{
  activeNavigation?: "media" | "overview";
  children?: ReactNode;
  context: AuthorizedPropertyContext;
  properties: AuthorizedPropertySummary[];
}>) {
  const canReadProperties = context.capabilities.platform.includes("platform.property.read");
  const canManageUsers =
    context.capabilities.platform.includes("platform.user.manage") ||
    context.capabilities.property.includes("property.member.manage");
  const canViewMedia =
    context.capabilities.platform.includes("platform.media.view") ||
    context.capabilities.property.includes("media.view");
  const display = {
    property: {
      initials: initials(context.property.name),
      name: context.property.name,
      domain: context.property.domain ?? undefined,
    },
    primaryNavigation: [
      {
        href: `/${context.property.id}/overview`,
        icon: "overview" as const,
        isActive: activeNavigation === "overview",
        label: "Overview",
      },
    ],
    administrativeNavigation:
      canReadProperties || canManageUsers || canViewMedia
        ? {
            label: "Administration",
            items: [
              ...(canReadProperties
                ? [{ href: "/admin/properties", icon: "properties" as const, label: "Properties" }]
                : []),
              ...(canViewMedia
                ? [
                    {
                      href: `/${context.property.id}/media`,
                      icon: "media" as const,
                      isActive: activeNavigation === "media",
                      label: "Media",
                    },
                  ]
                : []),
              ...(canManageUsers
                ? [
                    {
                      href: `/${context.property.id}/settings/users`,
                      icon: "users-and-permissions" as const,
                      label: "Users and permissions",
                    },
                  ]
                : []),
            ],
          }
        : undefined,
    user: {
      initials: initials(context.user.displayName ?? context.user.email),
      name: context.user.displayName ?? context.user.email,
    },
  };

  return (
    <AppShell
      display={display}
      propertySwitcher={
        <PropertySwitcher currentPropertyId={context.property.id} properties={properties} />
      }
    >
      {children ?? (
        <Card aria-labelledby="property-overview-title">
          <CardHeader>
            <CardTitle id="property-overview-title">{context.property.name}</CardTitle>
            <CardDescription>
              Your property workspace is ready. Features and property data will appear here as they
              are enabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-text-secondary">
              You are viewing the authorized overview for {context.account.name}.
            </p>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
