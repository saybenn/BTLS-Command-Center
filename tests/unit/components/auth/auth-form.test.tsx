import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthForm } from "@/components/auth/auth-form";

const action = async () => ({ status: "idle" as const });

describe("AuthForm", () => {
  it("uses labelled shared controls and keeps the submit action keyboard reachable", () => {
    render(
      <AuthForm
        action={action}
        description="Use a verified account."
        fields={[
          { autoComplete: "email", label: "Email address", name: "email", type: "email" },
          {
            autoComplete: "current-password",
            label: "Password",
            name: "password",
            type: "password",
          },
        ]}
        submitLabel="Sign in"
        title="Sign in to BTLS"
      />,
    );

    expect(screen.getByRole("heading", { name: "Sign in to BTLS" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/)).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(/Password/)).toHaveAttribute("minlength", "12");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});
