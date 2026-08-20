import type { ReactNode } from "react";

import { TopNavigation } from "@/components/navigation/top-navigation";

import { ApplicationSidebar } from "./application-sidebar";
import type { AppShellDisplay } from "./app-shell.types";

export type AppShellProps = {
  children: ReactNode;
  display: AppShellDisplay;
  propertySwitcher?: ReactNode;
};

export function AppShell({ children, display, propertySwitcher }: Readonly<AppShellProps>) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="flex min-h-screen">
        <ApplicationSidebar display={display} />
        <div className="min-w-0 flex-1">
          <TopNavigation display={display} propertySwitcher={propertySwitcher} />
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
