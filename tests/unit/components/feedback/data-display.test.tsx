import { Inbox } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SharedUiFoundationShowcase } from "@/components/feedback/shared-ui-foundation-showcase";
import { PageHeader } from "@/components/layout/page-header";
import {
  TableShell,
  TableShellBody,
  TableShellCaption,
  TableShellCell,
  TableShellFooter,
  TableShellHead,
  TableShellHeader,
  TableShellRow,
} from "@/components/tables/table-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

describe("shared feedback and data display", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders concise loading, empty, and actionable error states", () => {
    render(
      <>
        <LoadingState label="Loading activity" lines={2} />
        <EmptyState description="New activity appears here." icon={Inbox} title="No activity yet" />
        <ErrorState
          action={<Button>Try again</Button>}
          description="Check your connection, then try again."
        />
      </>,
    );

    expect(screen.getByRole("status", { name: "Loading activity" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("heading", { name: "No activity yet" })).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("Check your connection, then try again.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  it("preserves table semantics, slots, numeric alignment, and overflow containment", () => {
    render(
      <TableShell aria-label="Work queue" className="min-w-[42rem]">
        <TableShellCaption>Work queue</TableShellCaption>
        <TableShellHeader>
          <TableShellRow>
            <TableShellHead>Task</TableShellHead>
            <TableShellHead alignment="end">Open tasks</TableShellHead>
          </TableShellRow>
        </TableShellHeader>
        <TableShellBody>
          <TableShellRow>
            <TableShellCell>Review draft</TableShellCell>
            <TableShellCell alignment="end">12</TableShellCell>
          </TableShellRow>
        </TableShellBody>
        <TableShellFooter>
          <TableShellRow>
            <TableShellCell>Total</TableShellCell>
            <TableShellCell alignment="end">12</TableShellCell>
          </TableShellRow>
        </TableShellFooter>
      </TableShell>,
    );

    const table = screen.getByRole("table", { name: "Work queue" });

    expect(table.parentElement).toHaveClass("overflow-x-auto");
    expect(table).toHaveClass("min-w-[42rem]");
    expect(screen.getByRole("columnheader", { name: "Open tasks" })).toHaveClass("text-right");
    expect(table.querySelector("thead")).not.toBeNull();
    expect(table.querySelector("tbody")).not.toBeNull();
    expect(table.querySelector("tfoot")).not.toBeNull();
  });

  it("stacks page actions before the desktop breakpoint and keeps the primary action reachable", () => {
    render(
      <PageHeader
        description="Review your work before publishing."
        primaryAction={<Button>Publish</Button>}
        secondaryControls={<Button variant="secondary">Preview</Button>}
        title="Content review"
      />,
    );

    expect(screen.getByRole("heading", { name: "Content review" })).toBeVisible();
    expect(screen.getByText("Review your work before publishing.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Publish" }).parentElement).toHaveClass(
      "w-full",
      "sm:w-auto",
    );
  });

  it("includes loading, empty, error, disabled, and success examples in the showcase", () => {
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
        <SharedUiFoundationShowcase />
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", { name: "Primitives" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Feedback states" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Table shell" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Page header" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Theme" })).toBeVisible();
    expect(screen.getByText(/illustrative examples only/i)).toBeVisible();
    expect(screen.getByRole("status", { name: "Loading example" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Nothing to review yet" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "We could not load this information" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Primary action unavailable" })).toBeDisabled();
    expect(screen.getByText("Changes saved")).toBeVisible();
    expect(screen.getByRole("table", { name: "Illustrative recent activity table" })).toBeVisible();
  });
});
