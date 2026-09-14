import { describe, expect, it } from "vitest";

import {
  isProductionEnvironment,
  parseInfrastructureEnvironment,
  parseServerEnvironment,
  requireDatabaseRuntimeEnvironment,
  requireSupabaseBrowserEnvironment,
} from "@/server/env";

describe("parseServerEnvironment", () => {
  it("uses a safe application environment default for production runtimes", () => {
    expect(parseServerEnvironment({ NODE_ENV: "production" })).toEqual({
      applicationEnvironment: "production",
      nodeEnvironment: "production",
    });
  });

  it("uses the explicitly configured application environment", () => {
    expect(
      parseServerEnvironment({
        NODE_ENV: "production",
        BTLS_APP_ENV: "staging",
      }),
    ).toEqual({
      applicationEnvironment: "staging",
      nodeEnvironment: "production",
    });
  });

  it("rejects unsupported environment values without exposing input values", () => {
    expect(() => parseServerEnvironment({ BTLS_APP_ENV: "preview" })).toThrow(
      "Invalid server environment configuration.",
    );
  });

  it("identifies production from the application environment", () => {
    expect(
      isProductionEnvironment({
        applicationEnvironment: "production",
        nodeEnvironment: "production",
      }),
    ).toBe(true);
  });

  it("reports absent provider configuration without exposing configuration values", () => {
    expect(parseInfrastructureEnvironment({})).toEqual({
      database: "unconfigured",
      directDatabase: "unconfigured",
      supabaseBrowser: "unconfigured",
      supabaseServiceRole: "unconfigured",
      inngest: "unconfigured",
      sentry: "unconfigured",
    });
  });

  it("reports job and monitoring configuration without returning secret values", () => {
    const result = parseInfrastructureEnvironment({
      INNGEST_EVENT_KEY: "event-key-secret",
      INNGEST_SIGNING_KEY: "signing-key-secret",
      SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
    });

    expect(result).toMatchObject({
      inngest: "configured",
      sentry: "configured",
    });
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(JSON.stringify(result)).not.toContain("sentry.io");
  });

  it("reports incomplete Inngest configuration when one hosted key is missing", () => {
    expect(parseInfrastructureEnvironment({ INNGEST_EVENT_KEY: "event-key" })).toMatchObject({
      inngest: "incomplete",
    });
  });

  it("reports incomplete Supabase configuration", () => {
    expect(
      parseInfrastructureEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toMatchObject({
      supabaseBrowser: "incomplete",
      supabaseServiceRole: "incomplete",
    });
  });

  it("returns the public Supabase configuration only when both browser values exist", () => {
    expect(
      requireSupabaseBrowserEnvironment({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toEqual({
      publishableKey: "publishable-key",
      url: "https://example.supabase.co",
    });
  });

  it("requires a PostgreSQL runtime database URL", () => {
    expect(() =>
      requireDatabaseRuntimeEnvironment({ DATABASE_URL: "https://example.com" }),
    ).toThrow("Invalid infrastructure environment configuration.");
    expect(() => requireDatabaseRuntimeEnvironment({})).toThrow(
      "Database configuration is unavailable.",
    );
  });
});
