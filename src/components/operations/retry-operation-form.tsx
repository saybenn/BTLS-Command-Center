"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type RetryActionResult = { status: "success" | "error"; message: string };
export function RetryOperationForm({
  action,
}: Readonly<{ action: (reason: string) => Promise<RetryActionResult> }>) {
  const [message, setMessage] = useState<RetryActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const reason = String(new FormData(event.currentTarget).get("reason") ?? "");
        startTransition(async () => {
          try {
            const result = await action(reason);
            setMessage(result);
            if (result.status === "success") router.refresh();
          } catch {
            setMessage({
              status: "error",
              message: "Could not request a retry. Reload the operation before trying again.",
            });
          }
        });
      }}
    >
      <label className="grid gap-2 text-sm font-medium text-text-secondary">
        Reason for retry
        <Textarea
          name="reason"
          required
          minLength={5}
          maxLength={300}
          disabled={pending || message?.status === "success"}
        />
      </label>
      <p className="text-sm text-text-secondary">
        This requests one more attempt of the same operation and records your reason.
      </p>
      <Button type="submit" loading={pending} disabled={message?.status === "success"}>
        Request safe retry
      </Button>
      <p
        role="status"
        aria-live="polite"
        className={
          message?.status === "error"
            ? "text-sm text-danger-foreground"
            : "text-sm text-text-secondary"
        }
      >
        {message?.message}
      </p>
    </form>
  );
}
