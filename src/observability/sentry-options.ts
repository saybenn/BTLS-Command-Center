import * as Sentry from "@sentry/nextjs";

type SentryOptions = Parameters<typeof Sentry.init>[0];

const genericErrorMessage = "An application error occurred.";

export function scrubSentryEvent(event: Parameters<NonNullable<SentryOptions["beforeSend"]>>[0]) {
  const operation = event.contexts?.operation;
  const safeOperation =
    operation && typeof operation === "object"
      ? Object.fromEntries(
          ["propertyId", "correlationId", "jobExecutionId", "mediaAssetId"].flatMap((key) => {
            const value = operation[key];
            return typeof value === "string" &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                value,
              )
              ? [[key, value]]
              : [];
          }),
        )
      : {};
  delete event.breadcrumbs;
  delete event.extra;
  delete event.request;
  delete event.user;
  event.contexts = Object.keys(safeOperation).length > 0 ? { operation: safeOperation } : undefined;

  if (event.message) event.message = genericErrorMessage;
  for (const exception of event.exception?.values ?? []) {
    exception.value = genericErrorMessage;
  }

  return event;
}

export function createSentryOptions(dsn: string | undefined): SentryOptions {
  return {
    beforeSend: scrubSentryEvent,
    dsn: dsn || undefined,
    enabled: Boolean(dsn),
    release: process.env.SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  };
}
