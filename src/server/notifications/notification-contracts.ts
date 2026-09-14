import "server-only";

import { z } from "zod";

export const notificationSubjectSchema = z.strictObject({
  id: z.string().uuid(),
  type: z.enum(["property.overview", "media.asset", "job_execution"]),
});
export type NotificationSubject = z.infer<typeof notificationSubjectSchema>;

// Source identifies the owning producer; type identifies its notice kind. Extend additively.
export const notificationSourceSchema = z.enum(["system", "infrastructure.proof"]);

export const createNotificationInputSchema = z.strictObject({
  source: notificationSourceSchema,
  correlationId: z.string().uuid(),
  body: z.string().trim().min(1).max(1_000),
  deduplicationKey: z.string().trim().min(1).max(200),
  propertyId: z.string().uuid(),
  recipientUserId: z.string().uuid(),
  subject: notificationSubjectSchema,
  title: z.string().trim().min(1).max(180),
  type: z.string().trim().min(1).max(80),
});
export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;
