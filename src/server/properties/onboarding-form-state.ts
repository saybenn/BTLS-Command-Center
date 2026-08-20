export type OnboardingFormState = {
  fieldErrors?: Partial<Record<"accountName" | "domain" | "propertyName", string>>;
  message?: string;
  propertyId?: string;
  status: "idle" | "error" | "success";
};

export const initialOnboardingFormState: OnboardingFormState = { status: "idle" };
