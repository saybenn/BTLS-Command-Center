import { redirect } from "next/navigation";

import { PropertyOverviewShell } from "@/components/layout/property-overview-shell";
import {
  listAuthorizedProperties,
  resolveAuthorizedPropertyContext,
} from "@/server/properties/property-context";

export const dynamic = "force-dynamic";

export default async function PropertyOverviewPage({
  params,
}: Readonly<{
  params: Promise<{ propertyId: string }>;
}>) {
  const { propertyId } = await params;
  const resolution = await resolveAuthorizedPropertyContext(propertyId);

  if (resolution.status === "unauthenticated") {
    redirect("/sign-in");
  }
  if (resolution.status === "disabled") {
    redirect("/unauthorized?reason=disabled");
  }
  if (resolution.status !== "authorized") {
    redirect("/no-access");
  }

  const properties = await listAuthorizedProperties();
  const authorizedProperties = properties.status === "authorized" ? properties.properties : [];

  return <PropertyOverviewShell context={resolution.context} properties={authorizedProperties} />;
}
