import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type LoadingStateProps = ComponentProps<"div"> & {
  label?: string;
  lines?: number;
};

export function LoadingState({
  className,
  label = "Loading content",
  lines = 3,
  ...props
}: Readonly<LoadingStateProps>) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={cn("space-y-3", className)}
      role="status"
      {...props}
    >
      <span className="sr-only">{label}</span>
      <div className="h-5 w-2/5 animate-pulse rounded-md bg-surface-tertiary" />
      {Array.from({ length: lines }, (_, index) => (
        <div
          aria-hidden="true"
          className={cn(
            "h-4 animate-pulse rounded-md bg-surface-tertiary",
            index === lines - 1 ? "w-3/5" : "w-full",
          )}
          // The index is stable because the skeleton line count is fixed per render.
          key={index}
        />
      ))}
    </div>
  );
}
