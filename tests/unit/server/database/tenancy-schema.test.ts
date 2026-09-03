import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
const initialMigration = readFileSync(
  resolve(
    process.cwd(),
    "prisma/migrations/20260802150000_initial_tenancy_foundation/migration.sql",
  ),
  "utf8",
);

describe("initial tenancy schema", () => {
  it("defines the foundational tenancy and audit models", () => {
    for (const modelName of [
      "AppUser",
      "ClientAccount",
      "ClientProperty",
      "AccountMembership",
      "PropertyAccess",
      "FeatureFlag",
      "AuditEvent",
    ]) {
      expect(schema).toContain(`model ${modelName} {`);
    }
  });

  it("links application users to Supabase Auth UUIDs by contract", () => {
    expect(schema).toContain("Must equal the corresponding Supabase auth.users UUID.");
    expect(schema).toContain("id           String        @id @db.Uuid");
  });

  it("uses an explicit property grant with an optional account-role override", () => {
    expect(schema).toContain('roleOverride AccountRole? @map("role_override")');
    expect(schema).toContain("@@unique([membershipId, propertyId])");
  });

  it("prevents a membership from granting access across client accounts", () => {
    expect(initialMigration).toContain(
      'FOREIGN KEY ("membership_id", "account_id") REFERENCES "account_memberships"("id", "account_id")',
    );
    expect(initialMigration).toContain(
      'FOREIGN KEY ("property_id", "account_id") REFERENCES "client_properties"("id", "account_id")',
    );
  });

  it("constrains feature-flag targets to one declared scope", () => {
    expect(initialMigration).toContain('CONSTRAINT "feature_flags_scope_target_check"');
    expect(initialMigration).toContain('CREATE UNIQUE INDEX "feature_flags_global_key_key"');
  });
});

it("defines a property-owned MediaAsset lifecycle without domain attachment fields", () => {
  const mediaAssetModel = schema.slice(
    schema.indexOf("model MediaAsset {"),
    schema.indexOf("model AuditEvent {"),
  );

  expect(mediaAssetModel).toContain("propertyId");
  expect(mediaAssetModel).toContain("replacesAssetId");
  expect(mediaAssetModel).toContain("status                     MediaAssetStatus");
  expect(mediaAssetModel).toContain("objectPath");
  expect(mediaAssetModel).toContain("cleanupEligibleAt");
  expect(mediaAssetModel).not.toContain("subjectType");
  expect(mediaAssetModel).not.toContain("subjectId");
});
