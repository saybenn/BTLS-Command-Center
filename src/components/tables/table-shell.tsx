import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type TableAlignment = "start" | "end";

const tableCellAlignment: Record<TableAlignment, string> = {
  start: "text-left",
  end: "text-right tabular-nums",
};

export type TableShellProps = ComponentProps<"table"> & {
  containerClassName?: string;
};

export function TableShell({ className, containerClassName, ...props }: Readonly<TableShellProps>) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-border bg-surface",
        containerClassName,
      )}
    >
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function TableShellCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption className={cn("sr-only", className)} {...props} />;
}

export function TableShellHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-surface-secondary", className)} {...props} />;
}

export function TableShellBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TableShellFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot className={cn("border-t border-border bg-surface-secondary", className)} {...props} />
  );
}

export function TableShellRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-surface-hover", className)} {...props} />;
}

export type TableShellHeadProps = Omit<ComponentProps<"th">, "scope"> & {
  alignment?: TableAlignment;
};

export function TableShellHead({
  alignment = "start",
  className,
  ...props
}: Readonly<TableShellHeadProps>) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary",
        tableCellAlignment[alignment],
        className,
      )}
      scope="col"
      {...props}
    />
  );
}

export type TableShellCellProps = ComponentProps<"td"> & {
  alignment?: TableAlignment;
};

export function TableShellCell({
  alignment = "start",
  className,
  ...props
}: Readonly<TableShellCellProps>) {
  return (
    <td
      className={cn("px-4 py-3 text-text-primary", tableCellAlignment[alignment], className)}
      {...props}
    />
  );
}
