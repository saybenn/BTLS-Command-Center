import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    })),
  );
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { PropertyOverviewShell } from "@/components/layout/property-overview-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";

const properties = [
  {
    account: { id: "account-one", name: "Oak Services" },
    effectiveRole: "CLIENT_OWNER" as const,
    property: { id: "property-one", name: "Oak HVAC", domain: "oak.example" },
  },
  {
    account: { id: "account-one", name: "Oak Services" },
    effectiveRole: "CLIENT_OWNER" as const,
    property: { id: "property-two", name: "Oak Plumbing", domain: "plumbing.example" },
  },
];

describe("PropertyOverviewShell", () => {
  it("renders the authorized overview, responsive shell, switcher, and only capability-allowed navigation", () => {
    render(
      <ThemeProvider>
        <PropertyOverviewShell
          context={{
            account: properties[0].account,
            capabilities: {
              platform: [
                "platform.property.read",
                "platform.property.manage",
                "platform.user.manage",
              ],
              property: [],
            },
            effectiveRole: null,
            membership: null,
            property: properties[0].property,
            propertyAccess: null,
            user: {
              id: "user-one",
              email: "admin@example.test",
              displayName: "BTLS Admin",
              platformRole: "BTLS_ADMIN",
            },
          }}
          properties={properties}
        />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Application sidebar")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Switch property" })).toBeVisible();
    expect(screen.getByText("Properties")).toBeVisible();
    expect(screen.getByText("Users and permissions")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Oak HVAC" })).toBeVisible();
  });
});
