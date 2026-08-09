import { beforeEach, describe, expect, it, vi } from "vitest";

const resetPasswordForEmail = vi.hoisted(() => vi.fn());

vi.mock("@/server/database/prisma", () => ({
  prisma: { appUser: { findUnique: vi.fn() } },
}));
vi.mock("@/server/auth/supabase-server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { resetPasswordForEmail },
  }),
}));

import {
  forgotPasswordAction,
  resetPasswordAction,
  signInAction,
} from "@/server/auth/auth-actions";
import { initialAuthFormState } from "@/server/auth/auth-form-state";

describe("Feature 04 Slice 3 auth actions", () => {
  beforeEach(() => {
    process.env.BTLS_APP_URL = "http://127.0.0.1:3000";
    resetPasswordForEmail.mockReset();
  });

  it("enforces the 12-character password policy on sign-in and reset submissions", async () => {
    const signIn = await signInAction(initialAuthFormState, new FormData());
    expect(signIn.fieldErrors?.email).toBe("Enter a valid email address.");
    expect(signIn.fieldErrors?.password).toBe("Password must be at least 12 characters.");

    const resetForm = new FormData();
    resetForm.set("password", "short");
    resetForm.set("passwordConfirmation", "short");
    const reset = await resetPasswordAction(initialAuthFormState, resetForm);
    expect(reset.fieldErrors?.password).toBe("Password must be at least 12 characters.");
  });

  it("returns the same enumeration-safe recovery result when the provider fails", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: new Error("No user found") });
    const form = new FormData();
    form.set("email", "member@example.com");

    await expect(forgotPasswordAction(initialAuthFormState, form)).resolves.toEqual({
      message:
        "If an account exists for that email, you will receive password-reset instructions shortly.",
      status: "success",
    });
    expect(resetPasswordForEmail).toHaveBeenCalledWith("member@example.com", {
      redirectTo: "http://127.0.0.1:3000/reset-password",
    });
  });
});
