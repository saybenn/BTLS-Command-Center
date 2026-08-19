"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";

export default function PropertyUsersError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className="mx-auto w-full max-w-7xl">
      <ErrorState
        action={
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        }
        description="Users could not be loaded. Member details remain hidden until the server verifies access."
        title="Users are unavailable"
      />
    </main>
  );
}
