import type { AppShellDisplay } from "./app-shell.types";

import { NavigationList } from "@/components/navigation/navigation-list";

export function ApplicationSidebar({ display }: Readonly<{ display: AppShellDisplay }>) {
  return (
    <aside
      aria-label="Application sidebar"
      className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-border-subtle bg-sidebar lg:flex"
    >
      <div className="border-b border-border-subtle px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Current property
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-sm font-semibold text-accent">
            {display.property.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {display.property.name}
            </p>
            {display.property.domain ? (
              <p className="truncate text-xs text-text-muted">{display.property.domain}</p>
            ) : null}
          </div>
        </div>
      </div>
      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4">
        <NavigationList items={display.primaryNavigation} />
        {display.administrativeNavigation ? (
          <NavigationList group={display.administrativeNavigation} />
        ) : null}
      </nav>
      <div className="border-t border-border-subtle p-4">
        <div className="flex items-center gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-surface-tertiary text-xs font-semibold text-text-secondary">
            {display.user.initials}
          </span>
          <p className="truncate text-sm font-medium text-text-primary">{display.user.name}</p>
        </div>
      </div>
    </aside>
  );
}
