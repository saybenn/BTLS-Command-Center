import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../../..");

async function readRepositoryFile(...filePath: string[]) {
  return readFile(path.join(repositoryRoot, ...filePath), "utf8");
}

describe("local database workflow", () => {
  it("deploys Prisma, Supabase security, and seed data in that order", async () => {
    const deployScript = await readRepositoryFile("scripts", "deploy-local-database.ts");

    expect(deployScript.indexOf('"migrate", "deploy"')).toBeLessThan(
      deployScript.indexOf("scripts/apply-supabase-security-migrations.ts"),
    );
    expect(deployScript.indexOf("scripts/apply-supabase-security-migrations.ts")).toBeLessThan(
      deployScript.indexOf("prisma/seed.ts"),
    );
  });

  it("cleans only BTLS-owned security state before rebuilding the local database", async () => {
    const resetScript = await readRepositoryFile("scripts", "reset-local-database.ts");

    expect(resetScript).toContain("drop schema if exists app cascade");
    expect(resetScript).toContain('drop policy if exists "storage_public_buckets_read"');
    expect(resetScript).toContain(
      'drop policy if exists "storage_property_uploads_delete_authorized"',
    );
    expect(resetScript.indexOf('"migrate", "reset", "--force"')).toBeLessThan(
      resetScript.indexOf("scripts/apply-supabase-security-migrations.ts"),
    );
    expect(resetScript.indexOf("scripts/apply-supabase-security-migrations.ts")).toBeLessThan(
      resetScript.indexOf("prisma/seed.ts"),
    );
  });

  it("protects production and seeds the approved property-role example", async () => {
    const seedScript = await readRepositoryFile("prisma", "seed.ts");

    expect(seedScript).toContain("The non-production seed process cannot run in production.");
    expect(seedScript).toContain('name: "BTLS Test Client"');
    expect(seedScript).toContain('name: "BTLS Test HVAC"');
    expect(seedScript).toContain('name: "BTLS Test Plumbing"');
    expect(seedScript).toContain('roleOverride: "CLIENT_MANAGER"');
    expect(seedScript).toContain('roleOverride: "CLIENT_VIEWER"');
  });
});
