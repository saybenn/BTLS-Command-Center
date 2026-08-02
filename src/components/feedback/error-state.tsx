import type { ComponentProps, ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type ErrorStateProps = Omit<ComponentProps<"section">, "role"> & {
  action?: ReactNode;
  description: string;
  title?: string;
};

export function ErrorState({
  action,
  className,
  description,
  title = "We could not load this information",
  ...props
}: Readonly<ErrorStateProps>) {
  return (
    <section className={cn("rounded-xl border border-border bg-surface p-6", className)} {...props}>
      <Alert assertive variant="danger">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
