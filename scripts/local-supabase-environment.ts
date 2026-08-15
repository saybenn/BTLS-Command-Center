import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";

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
  return getMinimalLocalSupabaseEnvironment();
}

type DockerContainer = {
  Config: { Env: string[] };
  NetworkSettings: { Ports: Record<string, Array<{ HostPort: string }> | null> };
};

function environmentValues(values: readonly string[]) {
  return Object.fromEntries(
    values.map((value) => {
      const [name, ...rest] = value.split("=");
      return [name, rest.join("=")];
    }),
  );
}

function requiredValue(values: Record<string, string>, name: string) {
  const value = values[name];
  if (!value) throw new Error("The local Auth and PostgreSQL containers must be running.");
  return value;
}

function publishedPort(container: DockerContainer, internalPort: string) {
  const port = container.NetworkSettings.Ports[internalPort]?.[0]?.HostPort;
  if (!port) throw new Error("The local Auth and PostgreSQL containers must be running.");
  return port;
}

function localJwt(secret: string, role: "anon" | "service_role") {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ aud: "authenticated", exp: 2147483647, iat: 0, iss: "supabase", role });
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

/** Test-only resolver for local Auth and PostgreSQL; it deliberately ignores Vector health. */
export async function getMinimalLocalSupabaseEnvironment(): Promise<NodeJS.ProcessEnv> {
  const [databaseResult, kongResult] = await Promise.all([
    runProcess("docker", ["inspect", "supabase_db_btls-command-center"], process.env),
    runProcess("docker", ["inspect", "supabase_kong_btls-command-center"], process.env),
  ]);
  const database = JSON.parse(databaseResult.stdout)[0] as DockerContainer;
  const kong = JSON.parse(kongResult.stdout)[0] as DockerContainer;
  const values = environmentValues(database.Config.Env);
  const user = requiredValue(values, "POSTGRES_USER");
  const password = requiredValue(values, "POSTGRES_PASSWORD");
  const databaseName = requiredValue(values, "POSTGRES_DB");
  const jwtSecret = requiredValue(values, "JWT_SECRET");
  const databaseUrl = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@127.0.0.1:${publishedPort(database, "5432/tcp")}/${databaseName}`;

  return {
    ...process.env,
    BTLS_APP_ENV: "development",
    DATABASE_URL: databaseUrl,
    DIRECT_DATABASE_URL: databaseUrl,
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${publishedPort(kong, "8000/tcp")}`,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: localJwt(jwtSecret, "anon"),
    SUPABASE_SERVICE_ROLE_KEY: localJwt(jwtSecret, "service_role"),
  };
}
