import { redirect } from "next/navigation";

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
import { signOutAction } from "@/server/auth/auth-actions";
import { getAuthenticatedAppUserResult } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const result = await getAuthenticatedAppUserResult();

  if (result.status === "disabled") {
    redirect("/sign-in?reason=disabled");
    return null;
  }

  if (result.status === "unauthorized") {
    redirect("/unauthorized");
    return null;
  }

  const { user } = result;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <Card className="w-full max-w-xl" aria-labelledby="dashboard-title">
        <CardHeader>
          <CardTitle id="dashboard-title">You are signed in</CardTitle>
          <CardDescription>
            This is the temporary Feature 04 authentication-verification landing. Property
            navigation arrives in Feature 05.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert variant="success">
            <AlertTitle>Session verified</AlertTitle>
            <AlertDescription>
              Your signed-in profile is ready for BTLS access verification.
            </AlertDescription>
          </Alert>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="text-text-muted">Name</dt>
              <dd className="text-right font-medium text-text-primary">
                {user.displayName ?? "Not provided"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="text-text-muted">Email</dt>
              <dd className="text-right font-medium text-text-primary">{user.email}</dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
