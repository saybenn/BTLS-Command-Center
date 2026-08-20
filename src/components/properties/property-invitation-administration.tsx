"use client";

import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PendingInvitationDirectory } from "@/server/properties/property-invitations";
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

function invitationVariant(status: string) {
  return status === "PENDING" ? "warning" : status === "APPLIED" ? "success" : "neutral";
}

export function PropertyInvitationAdministration({
  cancelAction,
  directory,
  inviteAction,
}: Readonly<{
  cancelAction: FormAction;
  directory: PendingInvitationDirectory;
  inviteAction: FormAction;
}>) {
  const [state, formAction, isPending] = useActionState(inviteAction, initialPropertyUserFormState);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Card aria-labelledby="pending-invitations-title">
        <CardHeader>
          <CardTitle id="pending-invitations-title">Pending invitations</CardTitle>
          <CardDescription>
            Invitations expire after the configured access window. Cancelling an invitation never
            grants property access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {directory.invitations.length === 0 ? (
            <p className="text-sm leading-6 text-text-secondary">
              No pending or prior invitations.
            </p>
          ) : (
            <div className="grid gap-3">
              {directory.invitations.map((invitation) => (
                <section
                  className="rounded-lg border border-border bg-surface-secondary p-4"
                  key={invitation.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-text-primary">{invitation.email}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {roleLabel(invitation.role)} ·{" "}
                        {invitation.propertyGrants.map((grant) => grant.propertyName).join(", ")}
                      </p>
                    </div>
                    <Badge variant={invitationVariant(invitation.status)}>
                      {invitation.status.charAt(0) + invitation.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  {invitation.status === "PENDING" ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-text-muted">
                        Expires{" "}
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(invitation.expiresAt)}
                      </p>
                      <CancelInvitationButton action={cancelAction} invitationId={invitation.id} />
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card aria-labelledby="invite-user-title">
        <CardHeader>
          <CardTitle id="invite-user-title">Invite a client user</CardTitle>
          <CardDescription>
            Existing verified users receive access immediately. New users receive a BTLS invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.message ? (
            <Alert
              assertive={state.status === "error"}
              variant={state.status === "success" ? "success" : "danger"}
            >
              <AlertTitle>
                {state.status === "success" ? "Invitation ready" : "Invitation was not created"}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <form action={formAction} className="mt-4 grid gap-4" noValidate>
            <label className="grid gap-2 text-sm font-medium text-text-secondary">
              Email address
              <input
                autoComplete="email"
                className="h-10 rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-text-secondary">
              Account baseline role
              <select
                className="h-10 rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                defaultValue="CLIENT_VIEWER"
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
                Intended properties
              </legend>
              <p className="text-xs leading-5 text-text-muted">
                Each selected property becomes an explicit grant after verified acceptance. A blank
                override uses the baseline role.
              </p>
              {directory.properties.map((property) => (
                <div
                  className="grid gap-2 rounded-lg border border-border bg-surface-secondary p-3"
                  key={property.id}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <input
                      className="size-4 rounded border-border accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
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
              ))}
            </fieldset>
            <Button loading={isPending} type="submit">
              Send invitation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CancelInvitationButton({
  action,
  invitationId,
}: Readonly<{
  action: FormAction;
  invitationId: string;
}>) {
  const [, formAction, isPending] = useActionState(action, initialPropertyUserFormState);
  return (
    <form action={formAction}>
      <input name="invitationId" type="hidden" value={invitationId} />
      <Button loading={isPending} size="sm" type="submit" variant="danger">
        Cancel
      </Button>
    </form>
  );
}
