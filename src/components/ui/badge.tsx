import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-surface-tertiary text-text-secondary",
      accent: "bg-accent-soft text-accent",
      intelligence: "bg-intelligence-soft text-intelligence-foreground",
      success: "bg-success-soft text-success-foreground",
      info: "bg-info-soft text-info-foreground",
      warning: "bg-warning-soft text-warning-foreground",
      danger: "bg-danger-soft text-danger-foreground",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: Readonly<BadgeProps>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
