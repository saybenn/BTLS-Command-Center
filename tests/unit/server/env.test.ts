import { describe, expect, it } from "vitest";

import { isProductionEnvironment, parseServerEnvironment } from "@/server/env";

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
});
