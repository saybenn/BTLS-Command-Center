"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error-state";

export default function NotificationsError({
  reset,
}: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <ErrorState
        action={
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        }
        description="Try again in a moment. Your existing notices have not been changed."
        title="Notifications could not load"
      />
    </div>
  );
}
