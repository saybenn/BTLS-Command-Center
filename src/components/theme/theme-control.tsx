"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import { type ThemePreference, themePreferences, useTheme } from "./theme-provider";

const themeOptions: Record<ThemePreference, { icon: typeof Moon; label: string }> = {
  dark: { icon: Moon, label: "Dark" },
  light: { icon: Sun, label: "Light" },
  system: { icon: Monitor, label: "System" },
};

export function ThemeControl({ className }: Readonly<{ className?: string }>) {
  const { setTheme, theme } = useTheme();
  const labelId = useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Palette aria-hidden="true" className="size-4 text-text-muted" />
      <span id={labelId} className="text-sm font-medium text-text-secondary">
        Theme
      </span>
      <Select.Root
        value={theme}
        onValueChange={(value) => {
          if (themePreferences.includes(value as ThemePreference)) {
            setTheme(value as ThemePreference);
          }
        }}
      >
        <Select.Trigger
          aria-labelledby={labelId}
          className="inline-flex h-9 min-w-28 items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:text-text-disabled"
        >
          <Select.Value />
          <Select.Icon>
            <ChevronDown aria-hidden="true" className="size-4 text-text-muted" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="z-50 overflow-hidden rounded-lg border border-border-strong bg-surface-raised p-1 shadow-sm">
            <Select.Viewport>
              {themePreferences.map((preference) => {
                const { icon: Icon, label } = themeOptions[preference];

                return (
                  <Select.Item
                    key={preference}
                    value={preference}
                    className="relative flex h-9 cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm text-text-secondary outline-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-text-primary data-[state=checked]:text-text-primary"
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    <Select.ItemText>{label}</Select.ItemText>
                    <Select.ItemIndicator className="absolute right-2 inline-flex items-center text-accent">
                      <Check aria-hidden="true" className="size-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
