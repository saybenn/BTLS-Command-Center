import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import type { AuthorizedPropertyContext } from "./property-context";
import { FoundationError } from "./foundation-authorization";

/** Creation retries reuse their existing append-only audit evidence in the same transaction. */
export async function beginFoundationCreate(
  tx: Prisma.TransactionClient,
  context: AuthorizedPropertyContext,
  action: string,
  input: { requestId?: string },
) {
  const id = input.requestId ?? randomUUID();
  const { requestId: _requestId, ...payload } = input;
  void _requestId;
  const source = { ...payload } as Record<string, unknown>;
  delete source.confirmSeparate;
  delete source.reviewToken;
  const fingerprint = createHash("sha256").update(JSON.stringify(source)).digest("hex");
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${id},0))`;
  const previous = await tx.auditEvent.findFirst({
    where: { id, propertyId: context.property.id, actorId: context.user.id },
  });
  if (previous) {
    const metadata = previous.metadata;
    if (
      previous.action !== action ||
      typeof metadata !== "object" ||
      metadata === null ||
      Array.isArray(metadata) ||
      metadata.commandFingerprint !== fingerprint
    )
      throw new FoundationError(
        "CONFLICT",
        "This creation request was already used with different information. Reload before starting another.",
      );
    return { previousId: previous.subjectId, command: { id, fingerprint } };
  }
  return { previousId: null, command: { id, fingerprint } };
}
