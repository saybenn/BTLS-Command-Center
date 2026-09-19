import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";
import type { AuthorizedPropertyContext } from "./property-context";
import {
  FoundationError,
  requireFoundation,
  type FoundationCapability,
} from "./foundation-authorization";

export async function withFoundation<T>(
  context: AuthorizedPropertyContext,
  capability: FoundationCapability,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  requireFoundation(context, capability);
  return prisma.$transaction(async (tx) => {
    // Use the existing restricted application role even on a maintenance/test connection.
    await tx.$executeRaw`SET LOCAL ROLE btls_app`;
    await tx.$executeRaw`SELECT set_config('app.property_id', ${context.property.id}, true)`;
    await tx.$executeRaw`SELECT set_config('app.user_id', ${context.user.id}, true)`;
    // Recheck durable authorization, including suspension/revocation since context resolution.
    const result = await tx.$queryRaw<
      Array<{ allowed: boolean }>
    >`SELECT app.has_foundation_capability(${context.property.id}::uuid, ${capability}) AS allowed`;
    if (!result[0]?.allowed)
      throw new FoundationError("DENIED", "This property or permission is no longer available.");
    return work(tx);
  });
}
export async function auditFoundation(
  tx: Prisma.TransactionClient,
  context: AuthorizedPropertyContext,
  action: string,
  subjectType: string,
  subjectId: string,
  metadata: Prisma.InputJsonObject = {},
  command?: { id: string; fingerprint: string },
) {
  await tx.auditEvent.create({
    data: {
      ...(command ? { id: command.id } : {}),
      actorId: context.user.id,
      accountId: context.account.id,
      propertyId: context.property.id,
      action,
      subjectType,
      subjectId,
      metadata: { ...metadata, ...(command ? { commandFingerprint: command.fingerprint } : {}) },
    },
  });
}
export function requireChanged(count: number) {
  if (count !== 1)
    throw new FoundationError(
      "CONFLICT",
      "This record changed or is unavailable. Reload before saving.",
    );
}
