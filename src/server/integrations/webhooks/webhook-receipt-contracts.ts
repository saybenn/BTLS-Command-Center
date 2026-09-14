import "server-only";

import { z } from "zod";

export const webhookProviderSchema = z.enum(["POSTMARK", "TWILIO"]);
export type WebhookProvider = z.infer<typeof webhookProviderSchema>;

export const webhookReceiptInputSchema = z.object({
  correlationId: z.string().uuid().optional(),
  externalEventId: z.string().trim().min(1).max(200),
  occurredAt: z.coerce.date().optional(),
  propertyId: z.string().uuid().optional(),
  provider: webhookProviderSchema,
  providerAccountKey: z.string().trim().min(1).max(200),
  type: z.string().trim().min(1).max(120),
});
export type WebhookReceiptInput = z.infer<typeof webhookReceiptInputSchema>;
