import { spawn } from "node:child_process";
import path from "node:path";

import { getMinimalLocalSupabaseEnvironment } from "./local-supabase-environment";

async function main() {
  const environment = await getMinimalLocalSupabaseEnvironment();
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
        "--config=playwright.dev.config.ts",
        "tests/e2e/auth.spec.ts",
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
