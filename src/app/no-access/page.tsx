import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { getAuthenticatedAppUserResult } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const authenticated = await getAuthenticatedAppUserResult();
  if (authenticated.status !== "active") {
    redirect(authenticated.status === "disabled" ? "/unauthorized?reason=disabled" : "/sign-in");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10 sm:px-6">
      <EmptyState
        description="Your account does not currently have access to an active BTLS property. Ask your account owner or a BTLS administrator for access."
        icon={LockKeyhole}
        title="No property access"
      />
    </main>
  );
}
