export const dynamic = "force-dynamic";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { forgotPasswordAction } from "@/server/auth/auth-actions";

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout>
      <AuthForm
        action={forgotPasswordAction}
        description="Enter your email and we will send recovery instructions if an account is available."
        fields={[{ autoComplete: "email", label: "Email address", name: "email", type: "email" }]}
        links={[{ href: "/sign-in", label: "Back to sign in" }]}
        submitLabel="Send reset instructions"
        title="Reset your password"
      />
    </AuthPageLayout>
  );
}
