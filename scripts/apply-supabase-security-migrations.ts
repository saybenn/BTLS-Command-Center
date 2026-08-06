import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { Client } from "pg";

async function main() {
  const migrationDirectory = path.resolve(process.cwd(), "supabase", "security-migrations");
  const databaseUrl = process.env.DIRECT_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DIRECT_DATABASE_URL is required to apply Supabase security migrations.");
  }

  const client = new Client({ connectionString: databaseUrl });
  const migrationEntries = await readdir(migrationDirectory, { withFileTypes: true });
  const migrationNames = migrationEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  await client.connect();

  try {
    await client.query(`
      create schema if not exists app;
      create table if not exists app.security_migrations (
        name text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      );
    `);

    for (const migrationName of migrationNames) {
      const migrationPath = path.join(migrationDirectory, migrationName);
      const migrationSql = await readFile(migrationPath, "utf8");
      const checksum = createHash("sha256").update(migrationSql).digest("hex");

      await client.query("begin");

      try {
        const existingMigration = await client.query<{ checksum: string }>(
          "select checksum from app.security_migrations where name = $1",
          [migrationName],
        );

        if (existingMigration.rowCount === 1) {
          if (existingMigration.rows[0]?.checksum !== checksum) {
            throw new Error(`Applied Supabase security migration was modified: ${migrationName}`);
          }
        } else {
          await client.query(migrationSql);
          await client.query(
            "insert into app.security_migrations (name, checksum) values ($1, $2)",
            [migrationName, checksum],
          );
        }

        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
