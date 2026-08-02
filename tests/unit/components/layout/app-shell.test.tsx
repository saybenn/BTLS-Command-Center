import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell";
import type { AppShellDisplay } from "@/components/layout/app-shell.types";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";

const display: AppShellDisplay = {
  property: { initials: "BP", name: "Brightway Plumbing" },
  primaryNavigation: [
    { href: "#overview", icon: "overview", isActive: true, label: "Overview" },
    { href: "#settings", icon: "settings", label: "Settings" },
  ],
  user: { initials: "JR", name: "Jordan Rivera" },
};

describe("AppShell", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders display-only property, navigation, account, and page content", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      })),
    );

    render(
      <ThemeProvider>
        <AppShell display={display}>
          <h1>Example workspace</h1>
        </AppShell>
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Application sidebar")).toHaveClass("w-[232px]");
    expect(screen.getAllByText("Brightway Plumbing")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Overview" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("heading", { name: "Example workspace" })).toBeVisible();
  });

  it("opens the labelled mobile navigation drawer from its shared button trigger", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      })),
    );

    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <MobileNavigation display={display} />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));

    expect(screen.getByLabelText("Mobile navigation")).toBeVisible();
    expect(screen.getByRole("button", { name: "Overview" })).toHaveFocus();
  });
});
