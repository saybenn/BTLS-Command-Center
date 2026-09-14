"use client";
import { Button } from "@/components/ui/button";
export default function OperationsError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-semibold text-text-primary">Operations unavailable</h1>
      <p role="alert" className="text-sm text-text-secondary">
        The operation history could not be loaded. Try again.
      </p>
      <Button onClick={reset}>Reload operations</Button>
    </main>
  );
}
