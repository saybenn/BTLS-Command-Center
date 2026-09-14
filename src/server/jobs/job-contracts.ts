import "server-only";

import { z } from "zod";

export const jobExecutionOriginSchema = z.enum(["USER", "SYSTEM", "WEBHOOK"]);
export type JobExecutionOrigin = z.infer<typeof jobExecutionOriginSchema>;

export const jobExecutionStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "RETRY_SCHEDULED",
]);
export type JobExecutionStatus = z.infer<typeof jobExecutionStatusSchema>;

export const propertyScopedJobPayloadSchema = z.object({
  correlationId: z.string().uuid(),
  idempotencyKey: z.string().trim().min(1).max(200),
  propertyId: z.string().uuid(),
});
export type PropertyScopedJobPayload = z.infer<typeof propertyScopedJobPayloadSchema>;

export const infrastructureTestJobPayloadSchema = propertyScopedJobPayloadSchema.extend({
  eventId: z.string().uuid(),
  subject: z.object({
    id: z.string().uuid(),
    type: z.string().trim().min(1).max(80),
  }),
});
export type InfrastructureTestJobPayload = z.infer<typeof infrastructureTestJobPayloadSchema>;

export const contextualProofJobPayloadSchema = propertyScopedJobPayloadSchema
  .extend({
    eventId: z.string().uuid(),
    source: z.literal("infrastructure.proof"),
    recipientUserId: z.string().uuid(),
    subject: z.strictObject({ type: z.literal("property.overview"), id: z.string().uuid() }),
  })
  .strict()
  .refine((payload) => payload.subject.id === payload.propertyId, {
    message: "The proof subject must belong to the job property.",
  });
export type ContextualProofJobPayload = z.infer<typeof contextualProofJobPayloadSchema>;

export const mediaCleanupJobPayloadSchema = propertyScopedJobPayloadSchema.extend({
  mediaAssetId: z.string().uuid(),
});
export type MediaCleanupJobPayload = z.infer<typeof mediaCleanupJobPayloadSchema>;

export const registeredJobPayloadSchemas = {
  "infrastructure.contextual_proof": contextualProofJobPayloadSchema,
  "infrastructure.test_job": infrastructureTestJobPayloadSchema,
  "storage.media_cleanup": mediaCleanupJobPayloadSchema,
} as const;

export type RegisteredJobType = keyof typeof registeredJobPayloadSchemas;

export function parseRegisteredJobPayload(jobType: RegisteredJobType, input: unknown) {
  return registeredJobPayloadSchemas[jobType].parse(input);
}
