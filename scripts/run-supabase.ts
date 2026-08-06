import { spawn } from "node:child_process";
import path from "node:path";

async function main() {
  const commandArguments = process.argv.slice(2);

  if (commandArguments.length === 0) {
    throw new Error("Provide a Supabase CLI command to run.");
  }

  const supabaseCliPath = path.resolve(
    process.cwd(),
    "node_modules",
    "supabase",
    "dist",
    "supabase.js",
  );
  const child = spawn(process.execPath, [supabaseCliPath, ...commandArguments], {
    env: {
      ...process.env,
      DO_NOT_TRACK: "1",
      SUPABASE_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  });

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
