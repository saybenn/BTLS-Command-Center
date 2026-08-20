import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminPropertiesError from "@/app/admin/properties/error";
import AdminPropertiesLoading from "@/app/admin/properties/loading";

describe("Feature 05 Slice 3 administrative property route boundaries", () => {
  it("renders a labelled loading state while authorized properties are loading", () => {
    render(<AdminPropertiesLoading />);

    expect(screen.getByRole("status", { name: "Loading authorized properties" })).toBeVisible();
  });

  it("renders a safe recoverable error state", () => {
    render(<AdminPropertiesError error={new Error("database unavailable")} reset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Properties are unavailable" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
    expect(screen.queryByText("database unavailable")).not.toBeInTheDocument();
  });
});
