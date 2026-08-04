"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";

export default function DevelopmentStatusError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-medium text-text-secondary">Development area</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
        Internal references
      </h1>
      <ErrorState
        action={
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        }
        className="mt-8"
        description="The status details could not be loaded. No configuration values are displayed."
        title="Development status is unavailable"
      />
    </main>
  );
}
