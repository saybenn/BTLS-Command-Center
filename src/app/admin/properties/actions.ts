"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  accountPropertyOnboardingSchema,
  onboardAccountProperty,
} from "@/server/properties/admin-properties";
import {
  initialOnboardingFormState,
  type OnboardingFormState,
} from "@/server/properties/onboarding-form-state";

function textValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function validationState(error: z.ZodError): OnboardingFormState {
  const fieldErrors: OnboardingFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === "accountName" || field === "domain" || field === "propertyName") &&
      fieldErrors[field] === undefined
    ) {
      fieldErrors[field] = issue.message;
    }
  }

  return { fieldErrors, status: "error" };
}

export async function createAccountPropertyAction(
  _previousState: OnboardingFormState = initialOnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  void _previousState;
  const input = {
    accountName: textValue(formData, "accountName"),
    domain: textValue(formData, "domain"),
    propertyName: textValue(formData, "propertyName"),
  };
  const parsed = accountPropertyOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return validationState(parsed.error);
  }

  try {
    const { requireAuthenticatedAppUser } = await import("@/server/auth/session");
    const actor = await requireAuthenticatedAppUser();
    const { property } = await onboardAccountProperty(actor, parsed.data);

    revalidatePath("/admin/properties");
    return {
      status: "success",
      propertyId: property.id,
      message: `${property.name} is active and now appears in the property directory.`,
    };
  } catch {
    return {
      status: "error",
      message: "We could not create this account and property. Check the domain and try again.",
    };
  }
}
