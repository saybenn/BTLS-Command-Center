import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../../..");

const migrationPath = path.join(
  repositoryRoot,
  "supabase",
  "security-migrations",
  "20260802153000_security_and_storage_foundation.sql",
);
const effectiveRoleMigrationPath = path.join(
  repositoryRoot,
  "supabase",
  "security-migrations",
  "20260802160000_effective_property_role.sql",
);

describe("Supabase security and storage migration", () => {
  it("keeps the security migration separate from Prisma-owned table DDL", async () => {
    const migration = await readFile(migrationPath, "utf8");

    expect(migration).toContain(
      "Apply this migration only after Prisma's initial tenancy migration",
    );
    expect(migration).not.toMatch(
      /create table public\.(app_users|client_accounts|client_properties)/i,
    );
  });

  it("creates the restricted application role and tenant-context helpers", async () => {
    const migration = await readFile(migrationPath, "utf8");

    expect(migration).toContain("create role btls_app");
    expect(migration).toContain("nobypassrls");
    expect(migration).toContain("function app.current_user_id()");
    expect(migration).toContain("function app.can_access_account(target_account_id uuid)");
    expect(migration).toContain("function app.can_access_property(target_property_id uuid)");
  });

  it("enables RLS for every initial tenancy table", async () => {
    const migration = await readFile(migrationPath, "utf8");

    for (const table of [
      "app_users",
      "client_accounts",
      "client_properties",
      "account_memberships",
      "property_accesses",
      "feature_flags",
      "audit_events",
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("initializes the four approved buckets and property-scoped Storage policies", async () => {
    const migration = await readFile(migrationPath, "utf8");

    expect(migration).toContain("'public-media', 'public-media', true");
    expect(migration).toContain("'public-content', 'public-content', true");
    expect(migration).toContain("'private-media', 'private-media', false");
    expect(migration).toContain("'temporary-uploads', 'temporary-uploads', false");
    expect(migration).toContain("function app.can_access_storage_object(object_name text)");
    expect(migration).toContain("storage_property_uploads_insert_authorized");
  });

  it("keeps property-role precedence in an additive Supabase migration", async () => {
    const migration = await readFile(effectiveRoleMigrationPath, "utf8");

    expect(migration).toContain("function app.effective_property_role(target_property_id uuid)");
    expect(migration).toContain(
      "coalesce(property_accesses.role_override, account_memberships.role)",
    );
  });
});
