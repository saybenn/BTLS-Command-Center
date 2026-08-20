import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminPropertyDirectory } from "@/components/properties/admin-property-directory";
import { PropertyOnboardingForm } from "@/components/properties/property-onboarding-form";

const action = async () => ({ status: "idle" as const });
const filters = { page: 1, search: "", status: "ALL" as const };
const directory = {
  page: 1,
  pageSize: 20,
  total: 1,
  totalPages: 1,
  items: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Oak HVAC",
      domain: "oak.example",
      status: "ACTIVE" as const,
      account: {
        id: "00000000-0000-4000-8000-000000000002",
        name: "Oak Services",
        status: "ACTIVE" as const,
      },
    },
  ],
};

describe("Feature 05 Slice 3 administrative property UI", () => {
  it("renders searchable status-filtered directory data and onboarding controls", () => {
    render(
      <>
        <AdminPropertyDirectory directory={directory} filters={filters} />
        <PropertyOnboardingForm action={action} />
      </>,
    );

    expect(screen.getByLabelText("Search properties")).toBeInTheDocument();
    expect(screen.getByLabelText("Property status")).toHaveTextContent("All statuses");
    expect(screen.getByText("Oak HVAC")).toBeVisible();
    expect(screen.getByText("Oak Services")).toBeVisible();
    expect(screen.getByText("Active", { selector: "span" })).toBeVisible();
    expect(screen.getByLabelText(/Client account/)).toBeRequired();
    expect(screen.getByLabelText(/Property name/)).toBeRequired();
    expect(screen.getByRole("button", { name: "Create property" })).toBeEnabled();
  });

  it("uses the approved empty state for an authorized directory with no properties", () => {
    render(
      <AdminPropertyDirectory
        directory={{ ...directory, items: [], total: 0 }}
        filters={filters}
      />,
    );

    expect(screen.getByRole("heading", { name: "No properties yet" })).toBeVisible();
  });
});
