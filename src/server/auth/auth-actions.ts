"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { recordProductAnalyticsEvent } from "@/server/analytics/product-analytics";

import type { AuthFormState } from "./auth-form-state";
import { getAuthRedirectUrl } from "./redirects";
import { createSupabaseServerClient } from "./supabase-server";

const passwordSchema = z.string().min(12, "Password must be at least 12 characters.").max(128);
const emailSchema = z.string().trim().email("Enter a valid email address.");
const passwordConfirmationSchema = z
  .object({ password: passwordSchema, passwordConfirmation: z.string() })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

function validationState(error: z.ZodError): AuthFormState {
  const fieldErrors: AuthFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === "email" || field === "password" || field === "passwordConfirmation") &&
      fieldErrors[field] === undefined
    ) {
      fieldErrors[field] = issue.message;
    }
  }

  return { fieldErrors, status: "error" };
}

function errorState(message: string): AuthFormState {
  return { message, status: "error" };
}

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function identityFromAuthUser(user: {
  email?: string;
  email_confirmed_at?: string | null;
  id: string;
  user_metadata?: Record<string, unknown>;
}) {
  return {
    email: user.email,
    emailConfirmedAt: user.email_confirmed_at,
    id: user.id,
    userMetadata: user.user_metadata,
  };
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = z.object({ email: emailSchema, password: passwordSchema }).safeParse({
    email: formText(formData, "email"),
    password: formText(formData, "password"),
  });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    await recordProductAnalyticsEvent({
      category: "invalid_credentials",
      name: "auth.sign_in_failed",
    });
    return errorState("We could not sign you in with those credentials.");
  }

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    await recordProductAnalyticsEvent({ category: "provider_error", name: "auth.sign_in_failed" });
    return errorState("We could not finish signing you in. Please try again.");
  }

  try {
    const { synchronizeAndActivatePendingAuthorization } =
      await import("@/server/properties/property-invitations");
    await synchronizeAndActivatePendingAuthorization(identityFromAuthUser(data.user));
  } catch {
    await recordProductAnalyticsEvent({ category: "provider_error", name: "auth.sign_in_failed" });
    return errorState("We could not finish signing you in. Please try again.");
  }

  const { getAuthenticatedAppUserResult } = await import("./session");
  const appUser = await getAuthenticatedAppUserResult();
  if (appUser.status === "disabled") {
    await recordProductAnalyticsEvent({
      category: "account_disabled",
      name: "auth.sign_in_failed",
    });
    await supabase.auth.signOut();
    redirect("/sign-in?reason=disabled");
  }

  if (appUser.status === "unauthorized") {
    await recordProductAnalyticsEvent({
      category: "app_user_unavailable",
      name: "auth.sign_in_failed",
    });
    await supabase.auth.signOut();
    return errorState("Your account is not authorized for BTLS.");
  }

  await recordProductAnalyticsEvent({ name: "auth.sign_in_succeeded" });
  redirect("/dashboard");
}

export async function forgotPasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = z.object({ email: emailSchema }).safeParse({ email: formText(formData, "email") });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getAuthRedirectUrl("/reset-password"),
  });

  return {
    message:
      "If an account exists for that email, you will receive password-reset instructions shortly.",
    status: "success",
  };
}

export async function resetPasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordConfirmationSchema.safeParse({
    password: formText(formData, "password"),
    passwordConfirmation: formText(formData, "passwordConfirmation"),
  });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    return errorState("This password-reset link is invalid or has expired.");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return errorState("We could not update your password. Request a new reset link and try again.");
  }

  redirect("/sign-in?reason=password-reset");
}

export async function acceptInvitationAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordConfirmationSchema.safeParse({
    password: formText(formData, "password"),
    passwordConfirmation: formText(formData, "passwordConfirmation"),
  });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: userError } = await supabase.auth.getUser();
  const authUser = data.user;

  if (userError || !authUser || !authUser.invited_at) {
    return errorState("This invitation is invalid or has expired.");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return errorState("We could not accept this invitation. Please request a new invitation.");
  }

  const { data: refreshedIdentity, error: refreshedIdentityError } = await supabase.auth.getUser();
  if (refreshedIdentityError || !refreshedIdentity.user) {
    return errorState(
      "Your account was created, but we could not finish signing you in. Please sign in.",
    );
  }

  const { synchronizeAndActivatePendingAuthorization } =
    await import("@/server/properties/property-invitations");
  await synchronizeAndActivatePendingAuthorization(identityFromAuthUser(refreshedIdentity.user));
  await recordProductAnalyticsEvent({ name: "auth.invitation_accepted" });
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
