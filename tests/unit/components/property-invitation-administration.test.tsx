import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertyInvitationAdministration } from "@/components/properties/property-invitation-administration";

const directory = {
  properties: [{ id: "00000000-0000-4000-8000-000000000001", name: "Oak HVAC" }],
  invitations: [
    {
      id: "00000000-0000-4000-8000-000000000002",
      email: "invitee@oak.example",
      role: "CLIENT_VIEWER" as const,
      status: "PENDING" as const,
      expiresAt: new Date("2026-08-19T00:00:00.000Z"),
      propertyGrants: [
        {
          propertyId: "00000000-0000-4000-8000-000000000001",
          propertyName: "Oak HVAC",
          roleOverride: null,
        },
      ],
    },
  ],
};

describe("Feature 05 Slice 6 property invitation UI", () => {
  it("shows pending status, cancellation, and intended property grants without implying activation", () => {
    render(
      <PropertyInvitationAdministration
        cancelAction={async () => ({ status: "idle" })}
        directory={directory}
        inviteAction={async () => ({ status: "idle" })}
      />,
    );

    expect(screen.getByRole("heading", { name: "Pending invitations" })).toBeVisible();
    expect(screen.getByText("invitee@oak.example")).toBeVisible();
    expect(screen.getByText("Pending", { selector: "span" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByLabelText("Email address")).toBeRequired();
    expect(screen.getByLabelText("Oak HVAC")).not.toBeChecked();
    expect(screen.getByText(/after verified acceptance/i)).toBeVisible();
  });
});
