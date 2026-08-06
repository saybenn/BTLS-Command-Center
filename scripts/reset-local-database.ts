import path from "node:path";

import { Client } from "pg";

import { getLocalSupabaseEnvironment, runProcess } from "./local-supabase-environment";

async function main() {
  const environment = await getLocalSupabaseEnvironment();
  const directDatabaseUrl = environment.DIRECT_DATABASE_URL;

  if (!directDatabaseUrl) {
    throw new Error("DIRECT_DATABASE_URL is required for the local reset workflow.");
  }

  const client = new Client({ connectionString: directDatabaseUrl });
  await client.connect();

  try {
    await client.query(`
      drop schema if exists app cascade;

      drop policy if exists "storage_public_buckets_read" on storage.objects;
      drop policy if exists "storage_private_buckets_read_authorized" on storage.objects;
      drop policy if exists "storage_property_uploads_insert_authorized" on storage.objects;
      drop policy if exists "storage_property_uploads_update_authorized" on storage.objects;
      drop policy if exists "storage_property_uploads_delete_authorized" on storage.objects;
    `);
  } finally {
    await client.end();
  }

  const prismaCliPath = path.resolve(process.cwd(), "node_modules", "prisma", "build", "index.js");
  const tsxCliPath = path.resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

  await runProcess(process.execPath, [prismaCliPath, "migrate", "reset", "--force"], environment);
  await runProcess(
    process.execPath,
    [tsxCliPath, "scripts/apply-supabase-security-migrations.ts"],
    environment,
  );
  await runProcess(process.execPath, [tsxCliPath, "prisma/seed.ts"], environment);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
