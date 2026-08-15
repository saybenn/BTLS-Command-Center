export const dynamic = "force-dynamic";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { signInAction } from "@/server/auth/auth-actions";

const notices = {
  disabled: {
    message: "This BTLS account is disabled. Contact your BTLS administrator for help.",
    variant: "warning" as const,
  },
  "password-reset": {
    message: "Your password has been reset. Sign in with your new password.",
    variant: "success" as const,
  },
  "session-expired": {
    message: "Your session expired. Sign in again to continue.",
    variant: "info" as const,
  },
};

export default async function SignInPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ reason?: string }> }>) {
  const { reason } = await searchParams;
  const notice = reason && reason in notices ? notices[reason as keyof typeof notices] : undefined;

  return (
    <AuthPageLayout>
      <AuthForm
        action={signInAction}
        description="Use the email and password from your BTLS invitation."
        fields={[
          { autoComplete: "email", label: "Email address", name: "email", type: "email" },
          {
            autoComplete: "current-password",
            label: "Password",
            name: "password",
            type: "password",
          },
        ]}
        links={[{ href: "/forgot-password", label: "Forgot your password?" }]}
        notice={notice}
        submitLabel="Sign in"
        title="Sign in to BTLS"
      />
    </AuthPageLayout>
  );
}
