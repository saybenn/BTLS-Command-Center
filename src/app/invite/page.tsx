export const dynamic = "force-dynamic";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { InvitationSessionBootstrap } from "@/components/auth/invitation-session-bootstrap";
import { acceptInvitationAction } from "@/server/auth/auth-actions";

export default function InvitationPage() {
  return (
    <AuthPageLayout>
      <InvitationSessionBootstrap>
        <AuthForm
          action={acceptInvitationAction}
          description="Set a password to activate your invited BTLS account. If BTLS assigned property access, it activates only after this verified acceptance."
          fields={[
            {
              autoComplete: "new-password",
              label: "Create a password",
              name: "password",
              type: "password",
            },
            {
              autoComplete: "new-password",
              label: "Confirm password",
              name: "passwordConfirmation",
              type: "password",
            },
          ]}
          submitLabel="Accept invitation"
          title="Activate your account"
        />
      </InvitationSessionBootstrap>
    </AuthPageLayout>
  );
}
