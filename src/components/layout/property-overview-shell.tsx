import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { PropertySwitcher } from "@/components/properties/property-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotificationBellSummary } from "@/server/notifications/notifications";
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

export async function PropertyOverviewShell({
  activeNavigation = "overview",
  foundationDocumentNavigation = false,
  context,
  properties,
  children,
}: Readonly<{
  activeNavigation?: "media" | "overview" | "revenue";
  foundationDocumentNavigation?: boolean;
  children?: ReactNode;
  context: AuthorizedPropertyContext;
  properties: AuthorizedPropertySummary[];
}>) {
  let unreadCount: number | null = null;
  try {
    unreadCount = (await getNotificationBellSummary(context)).unreadCount;
  } catch {
    /* The bell exposes unavailable state; notification failure must not block the workspace. */
  }
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
      ...(context.capabilities.property.includes("customer.view") ||
      context.capabilities.platform.includes("platform.customer.view")
        ? [
            {
              href: `/${context.property.id}/revenue-operations/customers`,
              icon: "overview" as const,
              isActive: activeNavigation === "revenue",
              label: "Revenue Operations",
              navigationMode: "document" as const,
            },
          ]
        : []),
    ],
    administrativeNavigation:
      canReadProperties || canManageUsers || canViewMedia
        ? {
            label: "Administration",
            items: [
              ...(["BTLS_ADMIN", "BTLS_OPERATOR"].includes(context.user.platformRole ?? "")
                ? [
                    {
                      href: `/admin/operations?propertyId=${context.property.id}`,
                      icon: "audit-log" as const,
                      label: "Operations",
                    },
                  ]
                : []),
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
      display={
        foundationDocumentNavigation
          ? {
              ...display,
              primaryNavigation: display.primaryNavigation.map((item) => ({
                ...item,
                navigationMode: "document" as const,
              })),
              administrativeNavigation: display.administrativeNavigation
                ? {
                    ...display.administrativeNavigation,
                    items: display.administrativeNavigation.items.map((item) => ({
                      ...item,
                      navigationMode: "document" as const,
                    })),
                  }
                : undefined,
            }
          : display
      }
      notificationControl={
        <NotificationBell propertyId={context.property.id} unreadCount={unreadCount} />
      }
      propertySwitcher={
        <PropertySwitcher
          documentNavigation={foundationDocumentNavigation}
          currentPropertyId={context.property.id}
          properties={properties}
        />
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
