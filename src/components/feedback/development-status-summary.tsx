import { Badge } from "@/components/ui/badge";
import type { DatabaseReachability, DevelopmentStatus } from "@/server/development-status";
import type { InfrastructureConfigurationState } from "@/server/env";

type StatusBadge = {
  label: string;
  variant: "neutral" | "success" | "warning" | "danger";
};

function configurationBadge(state: InfrastructureConfigurationState): StatusBadge {
  switch (state) {
    case "configured":
      return { label: "Configured", variant: "success" };
    case "incomplete":
      return { label: "Incomplete", variant: "warning" };
    case "unconfigured":
      return { label: "Not configured", variant: "neutral" };
  }
}

function databaseBadge(state: DatabaseReachability): StatusBadge {
  switch (state) {
    case "healthy":
      return { label: "Reachable", variant: "success" };
    case "unavailable":
      return { label: "Unavailable", variant: "warning" };
    case "error":
      return { label: "Connection error", variant: "danger" };
  }
}

type StatusRowProps = {
  description: string;
  label: string;
  status: StatusBadge;
};

function StatusRow({ description, label, status }: Readonly<StatusRowProps>) {
  return (
    <li className="flex flex-col gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      <Badge className="w-fit shrink-0" variant={status.variant}>
        {status.label}
      </Badge>
    </li>
  );
}

export function DevelopmentStatusSummary({ status }: Readonly<{ status: DevelopmentStatus }>) {
  const applicationDatabase = configurationBadge(status.configuration.applicationDatabase);
  const migrationDatabase = configurationBadge(status.configuration.migrationDatabase);
  const supabaseBrowser = configurationBadge(status.configuration.supabaseBrowser);
  const supabaseServiceRole = configurationBadge(status.configuration.supabaseServiceRole);
  const databaseReachability = databaseBadge(status.databaseReachability);

  return (
    <section
      aria-label="Database and environment status"
      className="rounded-xl border border-border bg-surface p-6 shadow-xs"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Database and environment</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Configuration is shown without URLs, keys, or connection details.
          </p>
        </div>
        <Badge className="w-fit shrink-0" variant="info">
          {status.applicationEnvironment}
        </Badge>
      </div>
      <ul className="mt-6">
        <StatusRow
          description="Restricted application connection used by the server at runtime."
          label="Application database"
          status={applicationDatabase}
        />
        <StatusRow
          description="Direct connection reserved for migrations and local database tooling."
          label="Migration database"
          status={migrationDatabase}
        />
        <StatusRow
          description="Public Supabase URL and publishable browser key."
          label="Supabase browser"
          status={supabaseBrowser}
        />
        <StatusRow
          description="Server-only Supabase credential used by approved administration workflows."
          label="Supabase service role"
          status={supabaseServiceRole}
        />
        <StatusRow
          description="A safe server-side query verifies the restricted application connection."
          label="Database reachability"
          status={databaseReachability}
        />
      </ul>
    </section>
  );
}
