import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { PropertyOverviewShell } from "@/components/layout/property-overview-shell";
import { PropertyUserAdministration } from "@/components/properties/property-user-administration";
import { PropertyInvitationAdministration } from "@/components/properties/property-invitation-administration";
import { hasPlatformCapability } from "@/server/auth/permissions";
import {
  listAuthorizedProperties,
  resolveAuthorizedPropertyContext,
} from "@/server/properties/property-context";
import { getPropertyUserAdministration } from "@/server/properties/property-users";
import { getPendingInvitationDirectory } from "@/server/properties/property-invitations";

import {
  cancelPropertyInvitationAction,
  invitePropertyUserAction,
  revokePropertyUserAccessAction,
  savePropertyUserAccessAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function PropertyUsersPage({
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

  const canManageUsers =
    hasPlatformCapability(resolution.context.user.platformRole, "platform.user.manage") ||
    resolution.context.capabilities.property.includes("property.member.manage");
  if (!canManageUsers) {
    redirect("/no-access");
  }

  const [properties, administration, invitationDirectory] = await Promise.all([
    listAuthorizedProperties(),
    getPropertyUserAdministration(resolution.context),
    getPendingInvitationDirectory(resolution.context),
  ]);
  const authorizedProperties = properties.status === "authorized" ? properties.properties : [];
  const saveAction = savePropertyUserAccessAction.bind(null, propertyId);
  const revokeAction = revokePropertyUserAccessAction.bind(null, propertyId);
  const inviteAction = invitePropertyUserAction.bind(null, propertyId);
  const cancelInvitationAction = cancelPropertyInvitationAction.bind(null, propertyId);

  return (
    <PropertyOverviewShell context={resolution.context} properties={authorizedProperties}>
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <PageHeader
          description={`Control client membership and explicit property access for ${resolution.context.account.name}.`}
          title="Users and permissions"
        />
        <PropertyUserAdministration
          administration={administration}
          revokeAction={revokeAction}
          saveAction={saveAction}
        />
        <PropertyInvitationAdministration
          cancelAction={cancelInvitationAction}
          directory={invitationDirectory}
          inviteAction={inviteAction}
        />
      </div>
    </PropertyOverviewShell>
  );
}
