export const dynamic = "force-dynamic";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { resetPasswordAction } from "@/server/auth/auth-actions";

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout>
      <AuthForm
        action={resetPasswordAction}
        description="Choose a new password with at least 12 characters."
        fields={[
          {
            autoComplete: "new-password",
            label: "New password",
            name: "password",
            type: "password",
          },
          {
            autoComplete: "new-password",
            label: "Confirm new password",
            name: "passwordConfirmation",
            type: "password",
          },
        ]}
        submitLabel="Save new password"
        title="Choose a new password"
      />
    </AuthPageLayout>
  );
}
