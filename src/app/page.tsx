import { ArrowUpRight, Sparkles } from "lucide-react";

import { SystemStatus } from "@/components/feedback/system-status";
import { getPublicHealthStatus } from "@/server/health";

export default function Home() {
  const health = getPublicHealthStatus();

  return (
    <main className="min-h-screen bg-background font-sans text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-sm font-bold tracking-tight text-accent-foreground shadow-sm">
              B
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-text-primary">BTLS</p>
              <p className="text-xs text-text-muted">Command Center</p>
            </div>
          </div>
          <p className="hidden text-sm text-text-secondary sm:block">Brought to Life Solutions</p>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary shadow-sm">
              <Sparkles aria-hidden="true" className="size-4 text-intelligence" />
              Built for local service businesses
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              One workspace for business operations and web growth.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              BTLS brings lead operations, approved automation, content, and website intelligence
              into one focused workspace for service businesses and the teams that support them.
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-accent">
              <ArrowUpRight aria-hidden="true" className="size-4" />
              Platform setup is in progress.
            </div>
          </div>

          <SystemStatus
            message={
              health.status === "ok"
                ? "Public health checks are available without exposing system data."
                : "Status is unavailable."
            }
          />
        </section>

        <footer className="border-t border-border pt-6 text-sm text-text-muted">
          BTLS Command Center is being prepared for launch.
        </footer>
      </div>
    </main>
  );
}
