import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DevelopmentStatusError from "@/app/development-status/error";
import DevelopmentStatusLoading from "@/app/development-status/loading";

describe("development status boundaries", () => {
  it("shows a labelled loading state while status checks are pending", () => {
    render(<DevelopmentStatusLoading />);

    expect(
      screen.getByRole("status", { name: "Loading database and environment status" }),
    ).toBeVisible();
  });

  it("shows a generic recoverable error without rendering the underlying error", () => {
    const reset = vi.fn();

    render(<DevelopmentStatusError error={new Error("secret connection detail")} reset={reset} />);

    expect(screen.getByText("Development status is unavailable")).toBeVisible();
    expect(screen.queryByText("secret connection detail")).not.toBeInTheDocument();
    screen.getByRole("button", { name: "Try again" }).click();
    expect(reset).toHaveBeenCalledOnce();
  });
});
