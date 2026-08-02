import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-active",
        secondary:
          "border border-border bg-surface text-text-primary hover:border-border-strong hover:bg-surface-hover",
        ghost: "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        danger:
          "border border-danger bg-danger-soft text-danger-foreground hover:bg-danger-soft hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, disabled, loading = false, size, type = "button", variant, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        type={type}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
