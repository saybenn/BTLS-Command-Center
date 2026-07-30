import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("BTLS landing page", () => {
  it("introduces the command center and presents the safe application status", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "One workspace for business operations and web growth.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status", { name: "Application status" })).toHaveTextContent(
      "Available",
    );
    expect(
      screen.getByText("Public health checks are available without exposing system data."),
    ).toBeVisible();
  });
});
