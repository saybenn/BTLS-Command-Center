import { forwardRef, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent-ring disabled:cursor-not-allowed disabled:text-text-disabled aria-[invalid=true]:border-danger";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return <input ref={ref} type={type} className={cn(inputClassName, className)} {...props} />;
  },
);

Input.displayName = "Input";
