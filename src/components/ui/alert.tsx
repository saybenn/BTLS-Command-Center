import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-lg border p-4", {
  variants: {
    variant: {
      info: "border-info bg-info-soft",
      success: "border-success bg-success-soft",
      warning: "border-warning bg-warning-soft",
      danger: "border-danger bg-danger-soft",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export type AlertProps = Omit<ComponentProps<"div">, "role"> &
  VariantProps<typeof alertVariants> & {
    assertive?: boolean;
  };

export function Alert({ assertive = false, className, variant, ...props }: Readonly<AlertProps>) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      {...props}
      role={assertive ? "alert" : "status"}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-sm font-semibold text-text-primary", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mt-1 text-sm leading-6 text-text-secondary", className)} {...props} />;
}
