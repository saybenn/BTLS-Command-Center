import { SharedUiFoundationShowcase } from "@/components/feedback/shared-ui-foundation-showcase";

import { AppShell } from "./app-shell";
import type { AppShellDisplay } from "./app-shell.types";

const showcaseDisplay: AppShellDisplay = {
  property: {
    domain: "brightwayplumbing.example",
    initials: "BP",
    name: "Brightway Plumbing",
  },
  primaryNavigation: [
    { href: "#overview", icon: "overview", isActive: true, label: "Overview" },
    { href: "#revenue-operations", icon: "revenue-operations", label: "Revenue Operations" },
    { href: "#robin", icon: "robin", label: "Robin" },
    { href: "#website-intelligence", icon: "website-intelligence", label: "Website Intelligence" },
    { href: "#smart-blog-studio", icon: "smart-blog-studio", label: "Smart Blog Studio" },
    { href: "#content-intelligence", icon: "content-intelligence", label: "Content Intelligence" },
    { href: "#work-management", icon: "work-management", label: "Work Management" },
    { href: "#settings", icon: "settings", label: "Settings" },
  ],
  administrativeNavigation: {
    items: [
      { href: "#properties", icon: "properties", label: "Properties" },
      {
        href: "#users-and-permissions",
        icon: "users-and-permissions",
        label: "Users and Permissions",
      },
      { href: "#integrations", icon: "integrations", label: "Integrations" },
      { href: "#audit-log", icon: "audit-log", label: "Audit Log" },
    ],
    label: "Administration",
  },
  user: {
    initials: "JR",
    name: "Jordan Rivera",
  },
};

export function SharedUiFoundationShellShowcase() {
  return (
    <section aria-label="Full shell preview">
      <AppShell display={showcaseDisplay}>
        <SharedUiFoundationShowcase />
      </AppShell>
    </section>
  );
}
