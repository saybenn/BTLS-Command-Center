import path from "node:path";

import { getLocalSupabaseEnvironment, runProcess } from "./local-supabase-environment";

async function main() {
  const environment = await getLocalSupabaseEnvironment();
  const vitestCliPath = path.resolve(process.cwd(), "node_modules", "vitest", "vitest.mjs");

  await runProcess(
    process.execPath,
    [vitestCliPath, "run", "--config", "vitest.database.config.ts"],
    environment,
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
