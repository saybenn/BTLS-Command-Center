"use client";

import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { OnboardingFormState } from "@/server/properties/onboarding-form-state";

const initialState: OnboardingFormState = { status: "idle" };

type OnboardingAction = (
  state: OnboardingFormState,
  formData: FormData,
) => Promise<OnboardingFormState>;

export function PropertyOnboardingForm({ action }: Readonly<{ action: OnboardingAction }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card aria-labelledby="property-onboarding-title">
      <CardHeader>
        <CardTitle id="property-onboarding-title">Create account and property</CardTitle>
        <CardDescription>
          Creates one active client account and its first active property. User access is assigned
          separately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {state.message ? (
            <Alert
              assertive={state.status === "error"}
              variant={state.status === "success" ? "success" : "danger"}
            >
              <AlertTitle>
                {state.status === "success" ? "Property created" : "We could not create it"}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <form action={formAction} className="grid gap-4" noValidate>
            <Field error={state.fieldErrors?.accountName} label="Client account" required>
              <Input autoComplete="organization" name="accountName" required />
            </Field>
            <Field
              description="Optional. Use only the domain, such as example.com."
              error={state.fieldErrors?.domain}
              label="Website domain"
            >
              <Input autoComplete="url" inputMode="url" name="domain" placeholder="example.com" />
            </Field>
            <Field error={state.fieldErrors?.propertyName} label="Property name" required>
              <Input autoComplete="off" name="propertyName" required />
            </Field>
            <Button className="w-full sm:w-auto" loading={isPending} type="submit">
              Create property
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
