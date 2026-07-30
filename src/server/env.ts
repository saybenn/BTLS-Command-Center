import { z } from "zod";

const nodeEnvironmentSchema = z.enum(["development", "test", "production"]);
const applicationEnvironmentSchema = z.enum(["development", "staging", "test", "production"]);

const serverEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default("development"),
  BTLS_APP_ENV: applicationEnvironmentSchema.optional(),
});

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

export function isProductionEnvironment(
  environment: ServerEnvironment,
): environment is ServerEnvironment & { applicationEnvironment: "production" } {
  return environment.applicationEnvironment === "production";
}
