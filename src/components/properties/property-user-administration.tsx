"use client";

import { useActionState, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PropertyUserAdministration } from "@/server/properties/property-users";
import {
  initialPropertyUserFormState,
  type PropertyUserFormState,
} from "@/server/properties/property-users-form-state";

const roles = [
  ["CLIENT_OWNER", "Owner"],
  ["CLIENT_MANAGER", "Manager"],
  ["CLIENT_STAFF", "Staff"],
  ["CLIENT_VIEWER", "Viewer"],
] as const;

type FormAction = (
  state: PropertyUserFormState,
  formData: FormData,
) => Promise<PropertyUserFormState>;

function roleLabel(role: string): string {
  return roles.find(([value]) => value === role)?.[1] ?? role;
}

export function PropertyUserAdministration({
  administration,
  revokeAction,
  saveAction,
}: Readonly<{
  administration: PropertyUserAdministration;
  revokeAction: FormAction;
  saveAction: FormAction;
}>) {
  const [selectedUserId, setSelectedUserId] = useState(administration.members[0]?.id ?? "");
  const selectedMember = administration.members.find((member) => member.id === selectedUserId);
  const [state, formAction, isPending] = useActionState(saveAction, initialPropertyUserFormState);
  const [revokeState, revokeFormAction, isRevoking] = useActionState(
    revokeAction,
    initialPropertyUserFormState,
  );
  const grantByPropertyId = new Map(
    selectedMember?.propertyGrants.map((grant) => [grant.propertyId, grant]) ?? [],
  );

  if (administration.members.length === 0) {
    return (
      <Card aria-labelledby="property-users-title">
        <CardHeader>
          <CardTitle id="property-users-title">Users and permissions</CardTitle>
          <CardDescription>
            No current account member has access to this property. Invite a new user in the next
            authorization workflow, or have a platform administrator assign an existing user.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Card aria-labelledby="property-users-title">
        <CardHeader>
          <CardTitle id="property-users-title">Users and permissions</CardTitle>
          <CardDescription>
            The account role is the baseline for every selected property. A property override
            changes the role only for that one property.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[35rem] text-left text-sm">
              <thead className="border-b border-border text-xs font-semibold uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Account role</th>
                  <th className="px-3 py-3">Property access</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {administration.members.map((member) => (
                  <tr className="border-b border-border last:border-0" key={member.id}>
                    <td className="px-3 py-4">
                      <p className="font-medium text-text-primary">
                        {member.displayName ?? member.email}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">{member.email}</p>
                    </td>
                    <td className="px-3 py-4 text-text-secondary">{roleLabel(member.role)}</td>
                    <td className="px-3 py-4 text-text-secondary">
                      {member.propertyGrants.length}{" "}
                      {member.propertyGrants.length === 1 ? "property" : "properties"}
                    </td>
                    <td className="px-3 py-4">
                      <Badge variant={member.status === "ACTIVE" ? "success" : "warning"}>
                        {member.status === "ACTIVE" ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card aria-labelledby="member-access-title">
        <CardHeader>
          <CardTitle id="member-access-title">Manage member access</CardTitle>
          <CardDescription>
            Changes are authorized on the server and recorded in the audit history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.message ? (
            <Alert
              assertive={state.status === "error"}
              variant={state.status === "success" ? "success" : "danger"}
            >
              <AlertTitle>
                {state.status === "success" ? "Access saved" : "Access was not saved"}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <form action={formAction} className="mt-4 grid gap-4" key={selectedMember?.id}>
            <label className="grid gap-2 text-sm font-medium text-text-secondary">
              Existing account user
              <select
                className="h-10 rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                name="userId"
                onChange={(event) => setSelectedUserId(event.target.value)}
                value={selectedUserId}
              >
                {administration.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName ?? member.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-text-secondary">
              Account baseline role
              <select
                className="h-10 rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                defaultValue={selectedMember?.role}
                name="role"
              >
                {roles.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium text-text-secondary">
                Assigned properties
              </legend>
              <p className="text-xs leading-5 text-text-muted">
                Select each property this user may enter. A blank override uses the baseline role.
              </p>
              {administration.properties.map((property) => {
                const grant = grantByPropertyId.get(property.id);
                return (
                  <div
                    className="grid gap-2 rounded-lg border border-border bg-surface-secondary p-3"
                    key={property.id}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      <input
                        className="size-4 rounded border-border accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                        defaultChecked={Boolean(grant)}
                        name="propertyId"
                        type="checkbox"
                        value={property.id}
                      />
                      {property.name}
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-text-muted">
                      Property role override
                      <select
                        className="h-9 rounded-md border border-border bg-surface-interactive px-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                        defaultValue={grant?.roleOverride ?? ""}
                        name={`roleOverride:${property.id}`}
                      >
                        <option value="">Use account baseline</option>
                        {roles.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                );
              })}
            </fieldset>
            <Button loading={isPending} type="submit">
              Save access
            </Button>
          </form>
          {selectedMember ? (
            <form action={revokeFormAction} className="mt-3">
              <input name="userId" type="hidden" value={selectedMember.id} />
              <Button loading={isRevoking} type="submit" variant="danger">
                Suspend all account access
              </Button>
            </form>
          ) : null}
          {revokeState.message ? (
            <p
              className={`mt-3 text-sm ${revokeState.status === "error" ? "text-danger-foreground" : "text-success-foreground"}`}
            >
              {revokeState.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
