import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { hasPlatformCapability } from "@/server/auth/permissions";

const repositoryRoot = process.cwd();
const schema = readFileSync(resolve(repositoryRoot, "prisma/schema.prisma"), "utf8");
const prismaMigration = readFileSync(
  resolve(
    repositoryRoot,
    "prisma/migrations/20260907120000_events_jobs_notifications_operational_records/migration.sql",
  ),
  "utf8",
);
const securityMigration = readFileSync(
  resolve(
    repositoryRoot,
    "supabase/security-migrations/20260907120100_events_jobs_notifications_security.sql",
  ),
  "utf8",
);
const providerSecurityMigration = readFileSync(
  resolve(
    repositoryRoot,
    "supabase/security-migrations/20260911121000_provider_infrastructure_server_writes.sql",
  ),
  "utf8",
);

describe("Feature 07 persistence and security contracts", () => {
  it("defines feature-neutral operational records without business delivery models", () => {
    for (const model of [
      "EventOutbox",
      "JobExecution",
      "JobExecutionAttempt",
      "Notification",
      "WebhookReceipt",
      "SendingIdentity",
      "ProviderDispatch",
    ]) {
      expect(schema).toContain(`model ${model} {`);
    }

    const providerDispatch = schema.slice(
      schema.indexOf("model ProviderDispatch {"),
      schema.length,
    );
    expect(schema).toContain(
      "Outbound transport acceptance, idempotency, and correlation evidence only.",
    );
    expect(providerDispatch).not.toContain("messageId");
    expect(providerDispatch).not.toContain("estimateId");
    expect(providerDispatch).not.toContain("invoiceId");
    expect(providerDispatch).not.toContain("reviewRequestId");
  });

  it("adds database-backed idempotency and BTLS-managed sending constraints", () => {
    expect(prismaMigration).toContain(
      'UNIQUE INDEX "event_outbox_property_id_event_name_deduplication_key_key"',
    );
    expect(prismaMigration).toContain(
      'UNIQUE INDEX "job_executions_property_id_job_type_idempotency_key_key"',
    );
    expect(prismaMigration).toContain(
      'UNIQUE INDEX "notifications_property_id_recipient_user_id_deduplication_key_key"',
    );
    expect(prismaMigration).toContain(
      'UNIQUE INDEX "provider_dispatches_property_id_channel_operation_type_idempotency_key_key"',
    );
    expect(prismaMigration).toContain(
      'CONSTRAINT "sending_identities_feature_07_mode_check" CHECK ("mode" = \'BTLS_MANAGED\')',
    );
  });

  it("gives only administrators cross-property operations visibility", () => {
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.operations.view")).toBe(true);
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.operations.retry")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.operations.view")).toBe(false);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.operations.retry")).toBe(false);

    expect(securityMigration).toContain("function app.has_explicit_property_access");
    expect(securityMigration).toContain("function app.can_view_property_operations");
    expect(securityMigration).toContain("platform_role = 'BTLS_OPERATOR'");
    expect(securityMigration).toContain("platform.operations.view");
  });

  it("limits notification updates to each recipient's read state", () => {
    expect(securityMigration).toContain("grant update(read_at) on table public.notifications");
    expect(securityMigration).toContain("recipient_user_id = app.current_user_id()");
    expect(securityMigration).not.toContain("grant delete on table public.notifications");
  });

  it("reserves provider infrastructure writes for trusted server services", () => {
    expect(providerSecurityMigration.replace(/\r\n/g, "\n")).toContain(
      "public.webhook_receipts,\n  public.sending_identities,\n  public.provider_dispatches",
    );
    expect(providerSecurityMigration.replace(/\r\n/g, "\n")).toContain(
      "from authenticated, btls_app",
    );
    expect(providerSecurityMigration.replace(/\r\n/g, "\n")).toContain(
      'drop policy if exists "provider_dispatches_insert_property_authorized"',
    );
  });
});
