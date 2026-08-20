"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";

export default function AdminPropertiesError({
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
        description="The property directory could not be loaded. No property details are shown until access is verified."
        title="Properties are unavailable"
      />
    </main>
  );
}
