import "server-only";

import { prisma } from "@/server/database/prisma";

export type TrustedAuthIdentity = {
  email?: string;
  emailConfirmedAt?: string | null;
  id: string;
  userMetadata?: Record<string, unknown>;
};

export async function synchronizeAppUserProfile(
  identity: TrustedAuthIdentity,
  database: Pick<typeof prisma, "appUser"> = prisma,
) {
  if (!identity.email || !identity.emailConfirmedAt) {
    throw new Error("A verified email address is required to synchronize an AppUser.");
  }

  const displayName =
    typeof identity.userMetadata?.display_name === "string"
      ? identity.userMetadata.display_name
      : undefined;

  return database.appUser.upsert({
    where: { id: identity.id },
    create: {
      id: identity.id,
      email: identity.email,
      displayName,
    },
    update: {
      email: identity.email,
      displayName,
    },
  });
}
