import { spawn } from "node:child_process";
import path from "node:path";

import { getMinimalLocalSupabaseEnvironment } from "./local-supabase-environment";

async function runCommand(
  executable: string,
  argumentsList: string[],
  environment: NodeJS.ProcessEnv,
  output: "inherit" | "quiet" = "inherit",
) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, argumentsList, {
      env: environment,
      stdio: output === "inherit" ? "inherit" : ["ignore", "ignore", "ignore"],
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Command exited with ${code ?? "unknown"}.`)),
    );
  });
}

async function getLocalDevelopmentEnvironment() {
  try {
    return await getMinimalLocalSupabaseEnvironment();
  } catch {
    const supabaseCliPath = path.resolve(
      process.cwd(),
      "node_modules",
      "supabase",
      "dist",
      "supabase.js",
    );
    console.log("Preparing local Supabase Auth...");
    await runCommand(
      process.execPath,
      [supabaseCliPath, "start", "--ignore-health-check"],
      process.env,
      "quiet",
    );
    return getMinimalLocalSupabaseEnvironment();
  }
}

async function main() {
  const environment = {
    ...(await getLocalDevelopmentEnvironment()),
    BTLS_APP_URL: "http://127.0.0.1:3000",
  };
  const nextCliPath = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  console.log("Starting BTLS local development at http://127.0.0.1:3000...");
  await runCommand(
    process.execPath,
    [nextCliPath, "dev", "--hostname", "127.0.0.1", "--port", "3000"],
    environment,
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
