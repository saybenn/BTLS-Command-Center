import { describe, expect, it } from "vitest";

import type { AppShellDisplay } from "@/components/layout/app-shell.types";

describe("app shell display contracts", () => {
  it("describes presentation data without a property identifier or authorization fields", () => {
    const display: AppShellDisplay = {
      property: {
        name: "Sample Property",
        domain: "example.test",
        initials: "SP",
      },
      primaryNavigation: [
        {
          label: "Overview",
          href: "/sample/overview",
          icon: "overview",
          isActive: true,
        },
      ],
      administrativeNavigation: {
        label: "Administration",
        items: [
          {
            label: "Properties",
            href: "/admin/properties",
            icon: "properties",
          },
        ],
      },
      user: {
        name: "Sample operator",
        initials: "SO",
      },
    };

    expect(display.property).toEqual({
      name: "Sample Property",
      domain: "example.test",
      initials: "SP",
    });
    expect(display.primaryNavigation[0]?.isActive).toBe(true);
  });
});
