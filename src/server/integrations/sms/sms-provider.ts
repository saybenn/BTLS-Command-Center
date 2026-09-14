import "server-only";

import { z } from "zod";

export const smsProviderInputSchema = z.object({
  body: z.string().trim().min(1).max(1_600),
  correlationId: z.string().uuid(),
  idempotencyKey: z.string().trim().min(1).max(200),
  propertyId: z.string().uuid(),
  to: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Expected an E.164 phone number."),
});
export type SmsProviderInput = z.infer<typeof smsProviderInputSchema>;

export const smsProviderResultSchema = z.object({
  acceptedAt: z.coerce.date(),
  providerMessageId: z.string().trim().min(1).max(200),
  providerName: z.literal("TWILIO"),
});
export type SmsProviderResult = z.infer<typeof smsProviderResultSchema>;

export interface SmsProvider {
  sendMessage(input: SmsProviderInput): Promise<SmsProviderResult>;
}
