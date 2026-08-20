import { redirect } from "next/navigation";

import { getAuthenticatedAppUserResult } from "@/server/auth/session";
import { listAuthorizedProperties } from "@/server/properties/property-context";
import { resolvePropertyLandingDestination } from "@/server/properties/property-routing";

export const dynamic = "force-dynamic";

/** The fixed post-auth endpoint resolves a safe server-authorized property destination. */
export default async function DashboardPage() {
  const authenticated = await getAuthenticatedAppUserResult();

  if (authenticated.status === "disabled") {
    redirect("/unauthorized?reason=disabled");
  }
  if (authenticated.status === "unauthorized") {
    redirect("/sign-in");
  }

  const properties = await listAuthorizedProperties();
  redirect(resolvePropertyLandingDestination(authenticated.user, properties));
}
