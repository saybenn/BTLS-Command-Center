"use client";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-4 p-6">
      <Alert variant="danger">
        These records could not be loaded. Check your access or try again.
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
