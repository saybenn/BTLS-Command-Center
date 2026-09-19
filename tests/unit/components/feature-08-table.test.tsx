import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import {
  TableShell,
  TableShellHeader,
  TableShellRow,
  TableShellHead,
} from "@/components/tables/table-shell";
it("uses the prescribed shared sentence-case header for every consumer", () => {
  render(
    <TableShell>
      <TableShellHeader>
        <TableShellRow>
          <TableShellHead>Customer name</TableShellHead>
        </TableShellRow>
      </TableShellHeader>
    </TableShell>,
  );
  const header = screen.getByRole("columnheader", { name: "Customer name" });
  expect(header).toHaveClass("text-xs", "font-medium", "text-text-muted");
  expect(header).not.toHaveClass("uppercase", "tracking-wide", "font-semibold");
});
