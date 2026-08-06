import { z } from "zod";

const nodeEnvironmentSchema = z.enum(["development", "test", "production"]);
const applicationEnvironmentSchema = z.enum(["development", "staging", "test", "production"]);
const optionalEnvironmentValue = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);
const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);
const optionalPostgresUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === "postgresql:", {
      message: "Expected a PostgreSQL connection URL.",
    })
    .optional(),
);

const serverEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default("development"),
  BTLS_APP_ENV: applicationEnvironmentSchema.optional(),
});

const infrastructureEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalEnvironmentValue,
  SUPABASE_SERVICE_ROLE_KEY: optionalEnvironmentValue,
  DATABASE_URL: optionalPostgresUrl,
  DIRECT_DATABASE_URL: optionalPostgresUrl,
});

export type InfrastructureConfigurationState = "configured" | "incomplete" | "unconfigured";

export interface InfrastructureEnvironment {
  database: InfrastructureConfigurationState;
  directDatabase: InfrastructureConfigurationState;
  supabaseBrowser: InfrastructureConfigurationState;
  supabaseServiceRole: InfrastructureConfigurationState;
}

export interface SupabaseBrowserEnvironment {
  publishableKey: string;
  url: string;
}

export interface SupabaseServiceRoleEnvironment extends SupabaseBrowserEnvironment {
  serviceRoleKey: string;
}

export interface DatabaseRuntimeEnvironment {
  databaseUrl: string;
}

export type ServerEnvironment =
  | {
      applicationEnvironment: "production";
      nodeEnvironment: z.infer<typeof nodeEnvironmentSchema>;
    }
  | {
      applicationEnvironment: Exclude<z.infer<typeof applicationEnvironmentSchema>, "production">;
      nodeEnvironment: z.infer<typeof nodeEnvironmentSchema>;
    };

export function parseServerEnvironment(
  input: Record<string, string | undefined>,
): ServerEnvironment {
  const parsed = serverEnvironmentSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Invalid server environment configuration.");
  }

  const { NODE_ENV: nodeEnvironment, BTLS_APP_ENV: configuredApplicationEnvironment } = parsed.data;

  const applicationEnvironment =
    configuredApplicationEnvironment ??
    (nodeEnvironment === "production" ? "production" : "development");

  if (applicationEnvironment === "production") {
    return { applicationEnvironment, nodeEnvironment };
  }

  return { applicationEnvironment, nodeEnvironment };
}

export function getServerEnvironment(): ServerEnvironment {
  return parseServerEnvironment(process.env);
}

function getConfigurationState(
  values: Array<string | undefined>,
): InfrastructureConfigurationState {
  const configuredValues = values.filter((value) => value !== undefined).length;

  if (configuredValues === 0) {
    return "unconfigured";
  }

  return configuredValues === values.length ? "configured" : "incomplete";
}

function parseInfrastructureValues(input: Record<string, string | undefined>) {
  const parsed = infrastructureEnvironmentSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Invalid infrastructure environment configuration.");
  }

  return parsed.data;
}

export function parseInfrastructureEnvironment(
  input: Record<string, string | undefined>,
): InfrastructureEnvironment {
  const values = parseInfrastructureValues(input);

  return {
    database: getConfigurationState([values.DATABASE_URL]),
    directDatabase: getConfigurationState([values.DIRECT_DATABASE_URL]),
    supabaseBrowser: getConfigurationState([
      values.NEXT_PUBLIC_SUPABASE_URL,
      values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ]),
    supabaseServiceRole: getConfigurationState([
      values.NEXT_PUBLIC_SUPABASE_URL,
      values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      values.SUPABASE_SERVICE_ROLE_KEY,
    ]),
  };
}

export function getInfrastructureEnvironment(): InfrastructureEnvironment {
  return parseInfrastructureEnvironment(process.env);
}

export function requireSupabaseBrowserEnvironment(
  input: Record<string, string | undefined> = process.env,
): SupabaseBrowserEnvironment {
  const values = parseInfrastructureValues(input);

  if (
    values.NEXT_PUBLIC_SUPABASE_URL === undefined ||
    values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === undefined
  ) {
    throw new Error("Supabase browser configuration is unavailable.");
  }

  return {
    publishableKey: values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: values.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export function requireSupabaseServiceRoleEnvironment(
  input: Record<string, string | undefined> = process.env,
): SupabaseServiceRoleEnvironment {
  const browserEnvironment = requireSupabaseBrowserEnvironment(input);
  const values = parseInfrastructureValues(input);

  if (values.SUPABASE_SERVICE_ROLE_KEY === undefined) {
    throw new Error("Supabase service-role configuration is unavailable.");
  }

  return {
    ...browserEnvironment,
    serviceRoleKey: values.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function requireDatabaseRuntimeEnvironment(
  input: Record<string, string | undefined> = process.env,
): DatabaseRuntimeEnvironment {
  const values = parseInfrastructureValues(input);

  if (values.DATABASE_URL === undefined) {
    throw new Error("Database configuration is unavailable.");
  }

  return { databaseUrl: values.DATABASE_URL };
}

export function isProductionEnvironment(
  environment: ServerEnvironment,
): environment is ServerEnvironment & { applicationEnvironment: "production" } {
  return environment.applicationEnvironment === "production";
}
