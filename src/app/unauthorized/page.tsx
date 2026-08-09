import Link from "next/link";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <AuthPageLayout>
      <Card aria-labelledby="unauthorized-title">
        <CardHeader>
          <CardTitle id="unauthorized-title">You do not have access</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="warning">
            <AlertTitle>Access is unavailable</AlertTitle>
            <AlertDescription>
              Your account is signed in but is not authorized for this part of BTLS. Contact your
              BTLS administrator if you need access.
            </AlertDescription>
          </Alert>
          <Link
            className="mt-6 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
            href="/sign-in"
          >
            Return to sign in
          </Link>
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}
