import Link from "next/link";
import { redirect } from "next/navigation";
import { resolvePropertyNotificationDestination } from "@/server/notifications/notifications";
import { resolveAuthorizedPropertyContext } from "@/server/properties/property-context";

export const dynamic = "force-dynamic";

export default async function OpenNotificationPage({
  params,
}: Readonly<{
  params: Promise<{ propertyId: string; notificationId: string }>;
}>) {
  const { propertyId, notificationId } = await params;
  const resolution = await resolveAuthorizedPropertyContext(propertyId);
  if (resolution.status === "unauthenticated") redirect("/sign-in");
  if (resolution.status !== "authorized") redirect("/no-access");
  const destination = await resolvePropertyNotificationDestination(resolution.context, {
    propertyId,
    notificationId,
  });
  if (destination) redirect(destination);
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-text-primary">Destination unavailable</h1>
      <p className="text-sm text-text-secondary">
        This item may no longer be available or accessible to you.
      </p>
      <Link
        className="text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        href={`/${propertyId}/notifications`}
      >
        Back to notifications
      </Link>
    </main>
  );
}
