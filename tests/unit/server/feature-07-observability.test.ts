import { describe, expect, it, vi } from "vitest";

import { createSentryOptions, scrubSentryEvent } from "@/observability/sentry-options";
import { createStructuredLogger } from "@/server/observability/logger";
import { captureOperationalException } from "@/server/observability/sentry";

const ids = {
  asset: "30000000-0000-4000-8000-000000000001",
  correlation: "30000000-0000-4000-8000-000000000002",
  job: "30000000-0000-4000-8000-000000000003",
  property: "30000000-0000-4000-8000-000000000004",
};

describe("Feature 07 observability", () => {
  it("redacts sensitive structured log fields while retaining operational identifiers", () => {
    const lines: string[] = [];
    const logger = createStructuredLogger({
      write(value: string) {
        lines.push(value);
        return true;
      },
    });

    logger.info(
      {
        propertyId: ids.property,
        token: "SECRET_TOKEN",
        body: "SECRET_MESSAGE_BODY",
        objectPath: "SECRET_OBJECT_PATH",
        headers: { authorization: "SECRET_AUTHORIZATION" },
      },
      "Safe operation",
    );

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain(ids.property);
    expect(lines[0]).toContain("[REDACTED]");
    expect(lines[0]).not.toContain("SECRET_");
  });

  it("captures only allowlisted Sentry tags and identifiers with a sanitized error", () => {
    const scope = { setContext: vi.fn(), setTags: vi.fn() };
    const captureException = vi.fn().mockReturnValue("event-id");
    const sentry = {
      captureException,
      withScope: vi.fn((callback) => callback(scope)),
    };

    expect(
      captureOperationalException(
        new Error("SECRET_PROVIDER_RESPONSE"),
        {
          feature: "07",
          operation: "media_cleanup",
          outcome: "failed",
          failureCategory: "STORAGE_DELETE_FAILED",
          propertyId: ids.property,
          correlationId: ids.correlation,
          jobExecutionId: ids.job,
          mediaAssetId: ids.asset,
        },
        sentry as never,
      ),
    ).toBe("event-id");

    expect(scope.setTags).toHaveBeenCalledWith({
      feature: "07",
      operation: "media_cleanup",
      outcome: "failed",
      failure_category: "STORAGE_DELETE_FAILED",
    });
    expect(scope.setContext).toHaveBeenCalledWith("operation", {
      propertyId: ids.property,
      correlationId: ids.correlation,
      jobExecutionId: ids.job,
      mediaAssetId: ids.asset,
    });
    const captured = captureException.mock.calls[0]?.[0] as Error;
    expect(captured.message).toBe("Operational failure: STORAGE_DELETE_FAILED");
    expect(captured.message).not.toContain("SECRET_PROVIDER_RESPONSE");
  });

  it("rejects arbitrary sensitive Sentry context and scrubs automatic events", () => {
    expect(() =>
      captureOperationalException(
        new Error("failure"),
        {
          feature: "07",
          operation: "media_cleanup",
          outcome: "failed",
          body: "must not leave the process",
        } as never,
        { captureException: vi.fn(), withScope: vi.fn() } as never,
      ),
    ).toThrow();

    const event = {
      message: "SECRET_MESSAGE",
      breadcrumbs: [{ message: "SECRET_BREADCRUMB" }],
      contexts: { response: { body: "SECRET_BODY" } },
      extra: { token: "SECRET_TOKEN" },
      request: { headers: { authorization: "SECRET_AUTHORIZATION" } },
      user: { email: "private@example.test" },
      exception: { values: [{ type: "Error", value: "SECRET_EXCEPTION" }] },
    };
    expect(scrubSentryEvent(event as never)).toMatchObject({
      message: "An application error occurred.",
      exception: { values: [{ type: "Error", value: "An application error occurred." }] },
    });
    expect(JSON.stringify(event)).not.toContain("SECRET_");
  });

  it("keeps monitoring disabled until a DSN is configured", () => {
    expect(createSentryOptions(undefined)).toMatchObject({
      dsn: undefined,
      enabled: false,
      sendDefaultPii: false,
    });
    expect(createSentryOptions("https://public@example.ingest.sentry.io/1")).toMatchObject({
      enabled: true,
      sendDefaultPii: false,
    });
  });
});
