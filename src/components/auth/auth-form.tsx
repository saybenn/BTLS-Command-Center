"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthFormState } from "@/server/auth/auth-form-state";

const initialAuthFormState: AuthFormState = { status: "idle" };

type AuthField = {
  autoComplete: string;
  label: string;
  name: "email" | "password" | "passwordConfirmation";
  type: "email" | "password";
};

type AuthAction = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

type AuthLink = { href: string; label: string };

export function AuthForm({
  action,
  description,
  fields,
  links = [],
  notice,
  submitLabel,
  title,
}: Readonly<{
  action: AuthAction;
  description: string;
  fields: readonly AuthField[];
  links?: readonly AuthLink[];
  notice?: { message: string; variant: "info" | "success" | "warning" };
  submitLabel: string;
  title: string;
}>) {
  const [state, formAction, isPending] = useActionState(action, initialAuthFormState);

  return (
    <Card aria-labelledby="auth-form-title">
      <CardHeader>
        <CardTitle id="auth-form-title">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {notice ? (
            <Alert variant={notice.variant}>
              <AlertTitle>{notice.variant === "warning" ? "Action needed" : "Update"}</AlertTitle>
              <AlertDescription>{notice.message}</AlertDescription>
            </Alert>
          ) : null}
          {state.message ? (
            <Alert
              assertive={state.status === "error"}
              variant={state.status === "success" ? "success" : "danger"}
            >
              <AlertTitle>
                {state.status === "success" ? "Check your email" : "We could not continue"}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <form action={formAction} className="grid gap-4">
            {fields.map((field) => (
              <Field
                error={state.fieldErrors?.[field.name]}
                key={field.name}
                label={field.label}
                required
              >
                <Input
                  autoComplete={field.autoComplete}
                  minLength={field.type === "password" ? 12 : undefined}
                  name={field.name}
                  required
                  type={field.type}
                />
              </Field>
            ))}
            <Button className="w-full" loading={isPending} type="submit">
              {submitLabel}
            </Button>
          </form>
        </div>
      </CardContent>
      {links.length > 0 ? (
        <CardFooter className="flex-wrap text-sm text-text-secondary">
          {links.map((link) => (
            <Link
              className="font-medium text-accent underline-offset-4 hover:underline"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </CardFooter>
      ) : null}
    </Card>
  );
}
