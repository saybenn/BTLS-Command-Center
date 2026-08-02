"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import type { AppShellDisplay } from "@/components/layout/app-shell.types";
import { ThemeControl } from "@/components/theme/theme-control";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { NavigationList } from "./navigation-list";

export function MobileNavigation({ display }: Readonly<{ display: AppShellDisplay }>) {
  const [open, setOpen] = useState(false);
  const selectItem = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Open navigation" size="icon" variant="ghost">
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          "inset-y-0 left-0 h-dvh w-[min(20rem,calc(100%-3rem))] max-w-none translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 p-0",
          "gap-0",
        )}
      >
        <DialogTitle className="sr-only">Navigation menu</DialogTitle>
        <aside aria-label="Mobile navigation" className="flex h-full flex-col bg-sidebar">
          <div className="border-b border-border-subtle px-6 py-5 pr-14">
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
            <NavigationList items={display.primaryNavigation} onItemSelect={selectItem} />
            {display.administrativeNavigation ? (
              <NavigationList group={display.administrativeNavigation} onItemSelect={selectItem} />
            ) : null}
          </nav>
          <div className="space-y-4 border-t border-border-subtle p-4">
            <ThemeControl />
            <div className="flex items-center gap-3 px-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-surface-tertiary text-xs font-semibold text-text-secondary">
                {display.user.initials}
              </span>
              <p className="truncate text-sm font-medium text-text-primary">{display.user.name}</p>
            </div>
          </div>
        </aside>
      </DialogContent>
    </Dialog>
  );
}
