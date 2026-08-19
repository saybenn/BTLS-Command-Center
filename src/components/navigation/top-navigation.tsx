import { Bell, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import type { AppShellDisplay } from "@/components/layout/app-shell.types";
import { ThemeControl } from "@/components/theme/theme-control";

import { MobileNavigation } from "./mobile-navigation";

export function TopNavigation({
  display,
  propertySwitcher,
}: Readonly<{ display: AppShellDisplay; propertySwitcher?: ReactNode }>) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border-subtle bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="lg:hidden">
          <MobileNavigation display={display} />
        </div>
        {propertySwitcher ? (
          <div className="min-w-0 flex-1">{propertySwitcher}</div>
        ) : (
          <div className="min-w-0 lg:hidden">
            <p className="truncate text-sm font-semibold text-text-primary">
              {display.property.name}
            </p>
            {display.property.domain ? (
              <p className="truncate text-xs text-text-muted">{display.property.domain}</p>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <ThemeControl />
        </div>
        <button
          aria-label="Notifications are unavailable in this showcase"
          className="inline-flex size-10 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          type="button"
        >
          <Bell aria-hidden="true" className="size-4" />
        </button>
        <div className="hidden items-center gap-2 border-l border-border-subtle pl-3 sm:flex">
          <span className="flex size-8 items-center justify-center rounded-full bg-surface-tertiary text-xs font-semibold text-text-secondary">
            {display.user.initials}
          </span>
          <span className="max-w-32 truncate text-sm font-medium text-text-primary">
            {display.user.name}
          </span>
          <ChevronDown aria-hidden="true" className="size-4 text-text-muted" />
        </div>
      </div>
    </header>
  );
}
