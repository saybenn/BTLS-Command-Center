import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  description?: string;
  primaryAction?: ReactNode;
  secondaryControls?: ReactNode;
  title: string;
};

export function PageHeader({
  className,
  description,
  primaryAction,
  secondaryControls,
  title,
  ...props
}: Readonly<PageHeaderProps>) {
  const hasActions = primaryAction || secondaryControls;

  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between",
        className,
      )}
      {...props}
    >
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
        ) : null}
      </div>
      {hasActions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
          {secondaryControls}
          {primaryAction ? <div className="w-full sm:w-auto">{primaryAction}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
