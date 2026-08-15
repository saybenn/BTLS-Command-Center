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
async function main() {
  const supabaseCliPath = path.resolve(
    process.cwd(),
    "node_modules",
    "supabase",
    "dist",
    "supabase.js",
  );
  await runCommand(
    process.execPath,
    [supabaseCliPath, "start", "--ignore-health-check"],
    process.env,
    "quiet",
  );
  const environment = await getMinimalLocalSupabaseEnvironment();
  const tsxCliPath = path.resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  console.log("Preparing local test database...");
  await runCommand(process.execPath, [tsxCliPath, "scripts/deploy-local-database.ts"], environment);
  const nextCliPath = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  await runCommand(process.execPath, [nextCliPath, "build"], environment);
  const playwrightCliPath = path.resolve(
    process.cwd(),
    "node_modules",
    "@playwright",
    "test",
    "cli.js",
  );

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        playwrightCliPath,
        "test",
        "--config=playwright.config.ts",
        ...process.argv.slice(2).filter((argument) => argument !== "--"),
      ],
      { env: environment, stdio: "inherit" },
    );
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Playwright exited with ${code ?? "unknown"}.`)),
    );
  });
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
