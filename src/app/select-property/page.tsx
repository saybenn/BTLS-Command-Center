import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPlatformCapability } from "@/server/auth/permissions";
import { getAuthenticatedAppUserResult } from "@/server/auth/session";
import { listAuthorizedProperties } from "@/server/properties/property-context";
import { resolvePropertyLandingDestination } from "@/server/properties/property-routing";

export const dynamic = "force-dynamic";

export default async function SelectPropertyPage() {
  const authenticated = await getAuthenticatedAppUserResult();
  if (authenticated.status !== "active") {
    redirect(authenticated.status === "disabled" ? "/unauthorized?reason=disabled" : "/sign-in");
  }

  const properties = await listAuthorizedProperties();
  if (hasPlatformCapability(authenticated.user.platformRole, "platform.property.read")) {
    redirect("/admin/properties");
  }

  const destination = resolvePropertyLandingDestination(authenticated.user, properties);
  if (destination !== "/select-property") {
    redirect(destination);
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        description="Choose one of the properties your account is authorized to open."
        title="Select a property"
      />
      <section aria-label="Authorized properties" className="grid gap-4 sm:grid-cols-2">
        {properties.status === "authorized"
          ? properties.properties.map(({ account, effectiveRole, property }) => (
              <Link href={`/${property.id}/overview`} key={property.id}>
                <Card className="h-full transition-colors hover:border-border-strong hover:bg-surface-hover">
                  <CardHeader>
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription>{account.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary">
                      {property.domain ?? "No domain added"}
                      {effectiveRole
                        ? ` · ${effectiveRole.replace("CLIENT_", "").toLowerCase()}`
                        : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          : null}
      </section>
    </main>
  );
}
