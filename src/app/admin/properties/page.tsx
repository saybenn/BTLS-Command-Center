import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { AdminPropertyDirectory } from "@/components/properties/admin-property-directory";
import { PropertyOnboardingForm } from "@/components/properties/property-onboarding-form";
import { hasPlatformCapability } from "@/server/auth/permissions";
import { getAuthenticatedAppUserResult } from "@/server/auth/session";
import {
  listAdminProperties,
  propertyDirectoryQuerySchema,
} from "@/server/properties/admin-properties";

import { createAccountPropertyAction } from "./actions";

function firstParameter(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPropertiesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const authenticated = await getAuthenticatedAppUserResult();
  if (authenticated.status !== "active") {
    redirect(authenticated.status === "disabled" ? "/unauthorized?reason=disabled" : "/sign-in");
  }

  const suppliedFilters = await searchParams;
  const parsedFilters = propertyDirectoryQuerySchema.safeParse({
    page: firstParameter(suppliedFilters.page),
    search: firstParameter(suppliedFilters.search),
    status: firstParameter(suppliedFilters.status),
  });
  const filters = parsedFilters.success
    ? parsedFilters.data
    : propertyDirectoryQuerySchema.parse({});

  if (!hasPlatformCapability(authenticated.user.platformRole, "platform.property.read")) {
    redirect("/unauthorized");
  }

  const directory = await listAdminProperties(authenticated.user, filters);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8">
      <PageHeader
        description="Create and manage the client properties available through the shared BTLS application."
        title="Properties"
      />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <AdminPropertyDirectory directory={directory} filters={filters} />
        {hasPlatformCapability(authenticated.user.platformRole, "platform.property.manage") ? (
          <PropertyOnboardingForm action={createAccountPropertyAction} />
        ) : null}
      </div>
    </main>
  );
}
