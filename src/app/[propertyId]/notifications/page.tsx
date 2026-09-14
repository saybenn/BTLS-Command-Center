import { redirect } from "next/navigation";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/[propertyId]/notifications/actions";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { PropertyOverviewShell } from "@/components/layout/property-overview-shell";
import { listPropertyNotifications } from "@/server/notifications/notifications";
import {
  listAuthorizedProperties,
  resolveAuthorizedPropertyContext,
} from "@/server/properties/property-context";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ page?: string }>;
}>) {
  const [{ propertyId }, { page }] = await Promise.all([params, searchParams]);
  const resolution = await resolveAuthorizedPropertyContext(propertyId);

  if (resolution.status === "unauthenticated") redirect("/sign-in");
  if (resolution.status === "disabled") redirect("/unauthorized?reason=disabled");
  if (resolution.status !== "authorized") redirect("/no-access");

  const [properties, notifications] = await Promise.all([
    listAuthorizedProperties(),
    listPropertyNotifications(resolution.context, {
      propertyId,
      page:
        page && /^\d+$/.test(page) && Number.isSafeInteger(Number(page)) && Number(page) > 0
          ? Number(page)
          : 1,
    }),
  ]);
  const authorizedProperties = properties.status === "authorized" ? properties.properties : [];

  return (
    <PropertyOverviewShell context={resolution.context} properties={authorizedProperties}>
      <div className="mx-auto w-full max-w-4xl">
        <NotificationCenter
          key={`${propertyId}:${notifications.page}`}
          markAllReadAction={markAllNotificationsReadAction.bind(null, propertyId)}
          markReadAction={markNotificationReadAction.bind(null, propertyId)}
          notifications={notifications}
          propertyId={propertyId}
        />
      </div>
    </PropertyOverviewShell>
  );
}
