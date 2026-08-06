import "server-only";

import {
  getInfrastructureEnvironment,
  getServerEnvironment,
  type InfrastructureConfigurationState,
} from "@/server/env";

export type DatabaseReachability = "healthy" | "unavailable" | "error";

export interface DevelopmentStatus {
  applicationEnvironment: string;
  configuration: {
    applicationDatabase: InfrastructureConfigurationState;
    migrationDatabase: InfrastructureConfigurationState;
    supabaseBrowser: InfrastructureConfigurationState;
    supabaseServiceRole: InfrastructureConfigurationState;
  };
  databaseReachability: DatabaseReachability;
}

type DevelopmentStatusDependencies = {
  databaseCheck?: () => Promise<void>;
  getInfrastructureEnvironment?: typeof getInfrastructureEnvironment;
  getServerEnvironment?: typeof getServerEnvironment;
};

async function checkApplicationDatabase() {
  const { prisma } = await import("@/server/database/prisma");

  await prisma.$queryRaw`SELECT 1`;
}

export async function getDevelopmentStatus({
  databaseCheck = checkApplicationDatabase,
  getInfrastructureEnvironment: readInfrastructureEnvironment = getInfrastructureEnvironment,
  getServerEnvironment: readServerEnvironment = getServerEnvironment,
}: DevelopmentStatusDependencies = {}): Promise<DevelopmentStatus> {
  const environment = readServerEnvironment();
  const infrastructure = readInfrastructureEnvironment();
  const configuration = {
    applicationDatabase: infrastructure.database,
    migrationDatabase: infrastructure.directDatabase,
    supabaseBrowser: infrastructure.supabaseBrowser,
    supabaseServiceRole: infrastructure.supabaseServiceRole,
  };

  if (configuration.applicationDatabase !== "configured") {
    return {
      applicationEnvironment: environment.applicationEnvironment,
      configuration,
      databaseReachability: "unavailable",
    };
  }

  try {
    await databaseCheck();

    return {
      applicationEnvironment: environment.applicationEnvironment,
      configuration,
      databaseReachability: "healthy",
    };
  } catch {
    return {
      applicationEnvironment: environment.applicationEnvironment,
      configuration,
      databaseReachability: "error",
    };
  }
}
