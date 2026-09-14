import "server-only";

import { z } from "zod";

export const sendingIdentityModeSchema = z.enum([
  "BTLS_MANAGED",
  "CUSTOM_DOMAIN",
  "CONNECTED_MAILBOX",
]);
export type SendingIdentityMode = z.infer<typeof sendingIdentityModeSchema>;

export const transactionalSendingIdentitySchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[^\r\n]+$/),
  fromAddress: z.string().email(),
  mode: sendingIdentityModeSchema,
  replyToAddress: z.string().email().nullable(),
});
export type TransactionalSendingIdentity = z.infer<typeof transactionalSendingIdentitySchema>;

export const transactionalEmailRecipientSchema = z.object({
  email: z.string().email(),
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[^\r\n]+$/)
    .optional(),
});
export type TransactionalEmailRecipient = z.infer<typeof transactionalEmailRecipientSchema>;

export const transactionalEmailInputSchema = z
  .object({
    correlationId: z.string().uuid(),
    htmlBody: z.string().min(1).max(1_000_000).optional(),
    idempotencyKey: z.string().trim().min(1).max(200),
    identity: transactionalSendingIdentitySchema,
    providerCorrelationId: z.string().trim().min(1).max(200).optional(),
    recipients: z.array(transactionalEmailRecipientSchema).min(1).max(100),
    subject: z
      .string()
      .trim()
      .min(1)
      .max(998)
      .regex(/^[^\r\n]+$/),
    textBody: z.string().min(1).max(1_000_000).optional(),
  })
  .refine((input) => input.htmlBody !== undefined || input.textBody !== undefined, {
    message: "Transactional email requires an HTML or plain-text body.",
  });
export type TransactionalEmailInput = z.infer<typeof transactionalEmailInputSchema>;

export const transactionalEmailResultSchema = z.object({
  acceptedAt: z.coerce.date(),
  providerMessageId: z.string().trim().min(1).max(200),
  providerName: z.literal("POSTMARK"),
});
export type TransactionalEmailResult = z.infer<typeof transactionalEmailResultSchema>;

export interface TransactionalEmailProvider {
  sendTransactionalEmail(input: TransactionalEmailInput): Promise<TransactionalEmailResult>;
}
