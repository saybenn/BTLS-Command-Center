import { spawn } from "node:child_process";

import { getLocalSupabaseEnvironment } from "./local-supabase-environment";

async function main() {
  const [command, ...argumentsList] = process.argv.slice(2);

  if (!command) {
    throw new Error("Provide a command to run with the local Supabase environment.");
  }

  const environment = await getLocalSupabaseEnvironment();
  const child = spawn(command, argumentsList, { env: environment, stdio: "inherit" });
  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", resolve);
  });

  process.exitCode = exitCode ?? 1;
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
