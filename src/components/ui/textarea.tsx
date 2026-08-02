import { forwardRef, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-md border border-border bg-surface-interactive px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent-ring disabled:cursor-not-allowed disabled:text-text-disabled aria-[invalid=true]:border-danger",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
