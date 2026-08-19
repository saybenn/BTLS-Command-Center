import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertyUserAdministration } from "@/components/properties/property-user-administration";

const administration = {
  properties: [
    { id: "00000000-0000-4000-8000-000000000001", name: "Oak HVAC" },
    { id: "00000000-0000-4000-8000-000000000002", name: "Oak Plumbing" },
  ],
  members: [
    {
      id: "00000000-0000-4000-8000-000000000003",
      email: "owner@oak.example",
      displayName: "Oak Owner",
      role: "CLIENT_OWNER" as const,
      status: "ACTIVE" as const,
      propertyGrants: [
        {
          propertyId: "00000000-0000-4000-8000-000000000001",
          roleOverride: null,
        },
      ],
    },
  ],
};

describe("Feature 05 Slice 5 property user administration UI", () => {
  it("distinguishes account baseline roles from optional property overrides", () => {
    render(
      <PropertyUserAdministration
        administration={administration}
        revokeAction={async () => ({ status: "idle" })}
        saveAction={async () => ({ status: "idle" })}
      />,
    );

    expect(screen.getByRole("heading", { name: "Users and permissions" })).toBeVisible();
    expect(screen.getByText("Account baseline role")).toBeVisible();
    expect(screen.getAllByText("Property role override")).toHaveLength(2);
    expect(screen.getByLabelText("Oak HVAC")).toBeChecked();
    expect(screen.getByLabelText("Oak Plumbing")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Suspend all account access" })).toBeEnabled();
  });

  it("renders a safe empty state when no manageable member exists", () => {
    render(
      <PropertyUserAdministration
        administration={{ ...administration, members: [] }}
        revokeAction={async () => ({ status: "idle" })}
        saveAction={async () => ({ status: "idle" })}
      />,
    );

    expect(screen.getByText(/No current account member has access/)).toBeVisible();
  });
});
