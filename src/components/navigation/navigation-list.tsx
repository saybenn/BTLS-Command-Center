"use client";

import {
  BadgeCheck,
  BarChart3,
  Bot,
  ClipboardCheck,
  FilePenLine,
  FolderKanban,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Webhook,
  type LucideIcon,
} from "lucide-react";

import type {
  NavigationGroupDisplay,
  NavigationIcon,
  NavigationItemDisplay,
} from "@/components/layout/app-shell.types";
import { cn } from "@/lib/utils";

const iconByName: Record<NavigationIcon, LucideIcon> = {
  "audit-log": ClipboardCheck,
  "content-intelligence": BadgeCheck,
  integrations: Webhook,
  overview: LayoutDashboard,
  properties: LayoutDashboard,
  "revenue-operations": Users,
  robin: Bot,
  settings: Settings,
  "smart-blog-studio": FilePenLine,
  "users-and-permissions": ShieldCheck,
  "website-intelligence": BarChart3,
  "work-management": FolderKanban,
};

type NavigationListProps = {
  group?: NavigationGroupDisplay;
  items?: NavigationItemDisplay[];
  onItemSelect?: (item: NavigationItemDisplay) => void;
};

function NavigationItem({
  item,
  onItemSelect,
}: Readonly<{
  item: NavigationItemDisplay;
  onItemSelect?: (item: NavigationItemDisplay) => void;
}>) {
  const Icon = iconByName[item.icon];

  return (
    <button
      aria-current={item.isActive ? "page" : undefined}
      aria-disabled={item.isDisabled || undefined}
      className={cn(
        "relative flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-text-disabled",
        item.isActive
          ? "bg-surface-selected text-text-primary"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      )}
      disabled={item.isDisabled}
      onClick={() => onItemSelect?.(item)}
      type="button"
    >
      {item.isActive ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
        />
      ) : null}
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span>{item.label}</span>
    </button>
  );
}

export function NavigationList({ group, items, onItemSelect }: Readonly<NavigationListProps>) {
  const navigationItems = group?.items ?? items;

  if (!navigationItems) {
    return null;
  }

  return (
    <div className="space-y-1">
      {group?.label ? (
        <p className="px-3 pt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {group.label}
        </p>
      ) : null}
      {navigationItems.map((item) => (
        <NavigationItem item={item} key={item.label} onItemSelect={onItemSelect} />
      ))}
    </div>
  );
}
