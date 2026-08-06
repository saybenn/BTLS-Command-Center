import { describe, expect, it, vi } from "vitest";

import { getDevelopmentStatus } from "@/server/development-status";

const developmentEnvironment = {
  applicationEnvironment: "development" as const,
  nodeEnvironment: "development" as const,
};

const configuredInfrastructure = {
  database: "configured" as const,
  directDatabase: "configured" as const,
  supabaseBrowser: "configured" as const,
  supabaseServiceRole: "configured" as const,
};

describe("development status", () => {
  it("reports a healthy database only after the restricted connection check succeeds", async () => {
    const databaseCheck = vi.fn().mockResolvedValue(undefined);

    const status = await getDevelopmentStatus({
      databaseCheck,
      getInfrastructureEnvironment: () => configuredInfrastructure,
      getServerEnvironment: () => developmentEnvironment,
    });

    expect(status.databaseReachability).toBe("healthy");
    expect(databaseCheck).toHaveBeenCalledOnce();
  });

  it("does not attempt a database connection when runtime configuration is incomplete", async () => {
    const databaseCheck = vi.fn().mockResolvedValue(undefined);

    const status = await getDevelopmentStatus({
      databaseCheck,
      getInfrastructureEnvironment: () => ({ ...configuredInfrastructure, database: "incomplete" }),
      getServerEnvironment: () => developmentEnvironment,
    });

    expect(status.databaseReachability).toBe("unavailable");
    expect(databaseCheck).not.toHaveBeenCalled();
  });

  it("returns a generic error state when the restricted connection check fails", async () => {
    const status = await getDevelopmentStatus({
      databaseCheck: vi.fn().mockRejectedValue(new Error("private database failure")),
      getInfrastructureEnvironment: () => configuredInfrastructure,
      getServerEnvironment: () => developmentEnvironment,
    });

    expect(status.databaseReachability).toBe("error");
    expect(JSON.stringify(status)).not.toContain("private database failure");
  });
});
