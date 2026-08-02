import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type EmptyStateProps = ComponentProps<"section"> & {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({
  action,
  className,
  description,
  icon: Icon,
  title,
  ...props
}: Readonly<EmptyStateProps>) {
  return (
    <section
      className={cn(
        "rounded-xl border border-dashed border-border bg-surface p-6 text-center",
        className,
      )}
      {...props}
    >
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-text-primary">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
