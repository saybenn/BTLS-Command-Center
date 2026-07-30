import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
}));

import GlobalError from "@/app/global-error";

describe("GlobalError", () => {
  it("keeps the dark semantic-token baseline and a retry action", () => {
    render(<GlobalError reset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Application unavailable" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Try again" })).toHaveClass("bg-accent");
    expect(screen.getByRole("button", { name: "Try again" })).toHaveClass(
      "focus-visible:outline-focus-ring",
    );
    expect(document.documentElement).toHaveClass("dark");
  });
});
