import { spawn } from "node:child_process";
import path from "node:path";

type ProcessResult = {
  stdout: string;
};

export async function runProcess(
  executable: string,
  argumentsList: string[],
  environment: NodeJS.ProcessEnv,
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, argumentsList, {
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve({ stdout });
        return;
      }

      reject(new Error(stderr || stdout || `Command failed with exit code ${code ?? "unknown"}.`));
    });
  });
}

export async function getLocalSupabaseEnvironment(): Promise<NodeJS.ProcessEnv> {
  const supabaseCliPath = path.resolve(
    process.cwd(),
    "node_modules",
    "supabase",
    "dist",
    "supabase.js",
  );
  const { stdout } = await runProcess(
    process.execPath,
    [supabaseCliPath, "status", "--output", "env"],
    {
      ...process.env,
      DO_NOT_TRACK: "1",
      SUPABASE_TELEMETRY_DISABLED: "1",
    },
  );
  const values = Object.fromEntries(
    stdout.split(/\r?\n/).flatMap((line) => {
      const match = /^([A-Z0-9_]+)="(.*)"$/.exec(line);

      return match === null ? [] : [[match[1], match[2]]];
    }),
  );

  const databaseUrl = values.DB_URL;
  const apiUrl = values.API_URL;
  const serviceRoleKey = values.SERVICE_ROLE_KEY;

  if (!databaseUrl || !apiUrl || !serviceRoleKey) {
    throw new Error("The local Supabase stack must be running before database commands can run.");
  }

  return {
    ...process.env,
    BTLS_APP_ENV: "development",
    DATABASE_URL: databaseUrl,
    DIRECT_DATABASE_URL: databaseUrl,
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  };
}
