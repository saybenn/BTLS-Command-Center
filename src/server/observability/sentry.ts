import "server-only";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

const operationalErrorContextSchema = z
  .object({
    feature: z.string().trim().min(1).max(80),
    operation: z.string().trim().min(1).max(80),
    outcome: z.string().trim().min(1).max(80),
    failureCategory: z.string().trim().min(1).max(80).optional(),
    propertyId: z.string().uuid().optional(),
    correlationId: z.string().uuid().optional(),
    jobExecutionId: z.string().uuid().optional(),
    mediaAssetId: z.string().uuid().optional(),
    provider: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export type OperationalErrorContext = z.infer<typeof operationalErrorContextSchema>;

type SentryCapture = {
  captureException: typeof Sentry.captureException;
  withScope: typeof Sentry.withScope;
};

function safeErrorForMonitoring(error: unknown, context: OperationalErrorContext): Error {
  const safeError = new Error(
    context.failureCategory
      ? "Operational failure: " + context.failureCategory
      : "An unexpected operational failure occurred.",
  );
  safeError.name = "OperationalError";
  return safeError;
}

export function captureOperationalException(
  error: unknown,
  input: OperationalErrorContext,
  sentry: SentryCapture = Sentry,
): string | undefined {
  const context = operationalErrorContextSchema.parse(input);
  let eventId: string | undefined;

  sentry.withScope((scope) => {
    scope.setTags({
      feature: context.feature,
      operation: context.operation,
      outcome: context.outcome,
      ...(context.failureCategory ? { failure_category: context.failureCategory } : {}),
      ...(context.provider ? { provider: context.provider } : {}),
    });
    scope.setContext("operation", {
      ...(context.propertyId ? { propertyId: context.propertyId } : {}),
      ...(context.correlationId ? { correlationId: context.correlationId } : {}),
      ...(context.jobExecutionId ? { jobExecutionId: context.jobExecutionId } : {}),
      ...(context.mediaAssetId ? { mediaAssetId: context.mediaAssetId } : {}),
    });
    eventId = sentry.captureException(safeErrorForMonitoring(error, context));
  });

  return eventId;
}
