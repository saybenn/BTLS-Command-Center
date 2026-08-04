import path from "node:path";

import { getLocalSupabaseEnvironment, runProcess } from "./local-supabase-environment";

async function main() {
  const environment = await getLocalSupabaseEnvironment();
  const prismaCliPath = path.resolve(process.cwd(), "node_modules", "prisma", "build", "index.js");
  const tsxCliPath = path.resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

  await runProcess(process.execPath, [prismaCliPath, "migrate", "deploy"], environment);
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
