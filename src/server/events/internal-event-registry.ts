import "server-only";

import { z } from "zod";

import { notificationSubjectSchema } from "@/server/notifications/notification-contracts";

export const internalEventVersionSchema = z.union([z.literal(1), z.literal(2)]);
export type InternalEventVersion = z.infer<typeof internalEventVersionSchema>;

export const internalEventEnvelopeSchema = z.object({
  correlationId: z.string().uuid(),
  eventId: z.string().uuid(),
  occurredAt: z.coerce.date(),
  propertyId: z.string().uuid(),
  version: internalEventVersionSchema,
});
export type InternalEventEnvelope = z.infer<typeof internalEventEnvelopeSchema>;

export const internalEventSubjectSchema = z.object({
  id: z.string().uuid(),
  type: z.string().trim().min(1).max(80),
});
export type InternalEventSubject = z.infer<typeof internalEventSubjectSchema>;

export const infrastructureTestEventSchema = internalEventEnvelopeSchema.extend({
  version: z.literal(1),
  name: z.literal("infrastructure.test_event.completed"),
  subject: internalEventSubjectSchema,
});
export type InfrastructureTestEvent = z.infer<typeof infrastructureTestEventSchema>;

export const contextualInfrastructureTestEventSchema = internalEventEnvelopeSchema
  .extend({
    version: z.literal(2),
    name: z.literal("infrastructure.test_event.completed"),
    source: z.literal("infrastructure.proof"),
    recipientUserId: z.string().uuid(),
    subject: notificationSubjectSchema.extend({ type: z.literal("property.overview") }),
  })
  .strict()
  .refine((event) => event.subject.id === event.propertyId, {
    message: "The proof subject must belong to the event property.",
  });

export const operationRetryEventSchema = internalEventEnvelopeSchema
  .extend({
    version: z.literal(1),
    name: z.literal("operations.job.retry_requested"),
    jobExecutionId: z.string().uuid(),
    failedAttemptId: z.string().uuid(),
  })
  .strict();

export const internalEventSchemas = {
  "operations.job.retry_requested": operationRetryEventSchema,
  "infrastructure.test_event.completed": z.union([
    infrastructureTestEventSchema.strict(),
    contextualInfrastructureTestEventSchema,
  ]),
} as const;

export type RegisteredInternalEventName = keyof typeof internalEventSchemas;
export type RegisteredInternalEvent = {
  [Name in RegisteredInternalEventName]: z.infer<(typeof internalEventSchemas)[Name]>;
}[RegisteredInternalEventName];

export function parseRegisteredInternalEvent(input: unknown): RegisteredInternalEvent {
  const name = z.object({ name: z.string() }).safeParse(input);
  if (!name.success || !Object.hasOwn(internalEventSchemas, name.data.name)) {
    throw new Error("Unsupported internal event.");
  }

  const schema = internalEventSchemas[name.data.name as RegisteredInternalEventName];
  return schema.parse(input) as RegisteredInternalEvent;
}
