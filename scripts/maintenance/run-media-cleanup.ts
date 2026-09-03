import { prisma } from "@/server/database/prisma";
import { runMediaCleanup } from "@/server/storage/media-cleanup";

function parseArguments(argumentsList: string[]): { execute: boolean; limit?: number } {
  let execute = false;
  let limit: number | undefined;

  for (const argument of argumentsList) {
    if (argument === "--execute") {
      execute = true;
      continue;
    }
    if (argument.startsWith("--limit=")) {
      const parsed = Number(argument.slice("--limit=".length));
      if (!Number.isInteger(parsed)) throw new Error("--limit must be a whole number.");
      limit = parsed;
      continue;
    }
    throw new Error(`Unsupported argument: ${argument}`);
  }

  return { execute, limit };
}

async function main() {
  const { execute, limit } = parseArguments(process.argv.slice(2));
  if (execute && process.env.BTLS_INTERNAL_MAINTENANCE !== "enabled") {
    throw new Error(
      "Refusing cleanup execution without BTLS_INTERNAL_MAINTENANCE=enabled in the server environment.",
    );
  }

  const result = await runMediaCleanup({ dryRun: !execute, limit });
  console.log(
    JSON.stringify(
      {
        mode: execute ? "execute" : "dry-run",
        boundedTo: limit ?? 25,
        discovered: result.discovered,
        results: result.results,
      },
      null,
      2,
    ),
  );
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
