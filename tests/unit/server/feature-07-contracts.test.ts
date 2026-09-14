import { describe, expect, it } from "vitest";

import { parseRegisteredInternalEvent } from "@/server/events/internal-event-registry";
import { transactionalEmailInputSchema } from "@/server/integrations/email/transactional-email-provider";
import { smsProviderInputSchema } from "@/server/integrations/sms/sms-provider";
import { webhookReceiptInputSchema } from "@/server/integrations/webhooks/webhook-receipt-contracts";
import {
  infrastructureTestJobPayloadSchema,
  mediaCleanupJobPayloadSchema,
} from "@/server/jobs/job-contracts";
import { createNotificationInputSchema } from "@/server/notifications/notification-contracts";

const identifiers = {
  correlationId: "11111111-1111-4111-8111-111111111111",
  eventId: "22222222-2222-4222-8222-222222222222",
  propertyId: "33333333-3333-4333-8333-333333333333",
  recipientUserId: "44444444-4444-4444-8444-444444444444",
  subjectId: "55555555-5555-4555-8555-555555555555",
};

describe("Feature 07 shared contracts", () => {
  it("rejects unknown subjects, sources, malformed correlation, and arbitrary destinations", () => {
    const input = {
      source: "system",
      correlationId: identifiers.correlationId,
      propertyId: identifiers.propertyId,
      recipientUserId: identifiers.recipientUserId,
      subject: { type: "property.overview", id: identifiers.propertyId },
      title: "Ready",
      body: "Operation completed.",
      type: "system.test",
      deduplicationKey: "test",
    };
    expect(createNotificationInputSchema.safeParse(input).success).toBe(true);
    for (const invalid of [
      { ...input, source: "robin.unknown" },
      { ...input, correlationId: "bad" },
      { ...input, href: "https://example.com" },
      { ...input, subject: { ...input.subject, href: "/elsewhere" } },
      { ...input, subject: { type: "revenue.future", id: identifiers.subjectId } },
    ]) {
      expect(createNotificationInputSchema.safeParse(invalid).success).toBe(false);
    }
    expect(() => parseRegisteredInternalEvent({ name: "toString" })).toThrow(
      "Unsupported internal event",
    );
    expect(() =>
      parseRegisteredInternalEvent({ name: "infrastructure.test_event.completed", version: 99 }),
    ).toThrow();
  });

  it("accepts only registered versioned internal events", () => {
    expect(
      parseRegisteredInternalEvent({
        correlationId: identifiers.correlationId,
        eventId: identifiers.eventId,
        name: "infrastructure.test_event.completed",
        occurredAt: new Date(),
        propertyId: identifiers.propertyId,
        subject: { id: identifiers.subjectId, type: "infrastructure_test" },
        version: 1,
      }).name,
    ).toBe("infrastructure.test_event.completed");

    expect(() => parseRegisteredInternalEvent({ name: "lead.created" })).toThrow(
      "Unsupported internal event.",
    );
  });

  it("requires property scope and idempotency for registered jobs", () => {
    expect(
      infrastructureTestJobPayloadSchema.safeParse({
        correlationId: identifiers.correlationId,
        eventId: identifiers.eventId,
        idempotencyKey: "infrastructure-event-222",
        propertyId: identifiers.propertyId,
        subject: { id: identifiers.subjectId, type: "infrastructure_test" },
      }).success,
    ).toBe(true);

    expect(
      mediaCleanupJobPayloadSchema.safeParse({
        correlationId: identifiers.correlationId,
        idempotencyKey: "cleanup-555",
        mediaAssetId: identifiers.subjectId,
      }).success,
    ).toBe(false);
  });

  it("keeps notifications recipient- and property-scoped", () => {
    expect(
      createNotificationInputSchema.safeParse({
        body: "The test operation completed.",
        source: "infrastructure.proof",
        correlationId: identifiers.correlationId,
        deduplicationKey: "test-operation-222",
        propertyId: identifiers.propertyId,
        recipientUserId: identifiers.recipientUserId,
        subject: { id: identifiers.propertyId, type: "property.overview" },
        title: "Test operation completed",
        type: "infrastructure.test.completed",
      }).success,
    ).toBe(true);

    expect(
      createNotificationInputSchema.safeParse({
        body: "Missing recipient",
        deduplicationKey: "test-operation-222",
        propertyId: identifiers.propertyId,
        title: "Test operation completed",
        type: "infrastructure.test.completed",
      }).success,
    ).toBe(false);
  });

  it("normalizes outbound provider contracts without treating provider IDs as business truth", () => {
    expect(
      transactionalEmailInputSchema.safeParse({
        correlationId: identifiers.correlationId,
        idempotencyKey: "system-notice-222",
        identity: {
          displayName: "BTLS Command Center",
          fromAddress: "no-reply@btls.example",
          mode: "BTLS_MANAGED",
          replyToAddress: "team@example.com",
        },
        recipients: [{ email: "owner@example.com" }],
        subject: "System notice",
        textBody: "A system notice.",
      }).success,
    ).toBe(true);

    expect(
      smsProviderInputSchema.safeParse({
        body: "System notice",
        correlationId: identifiers.correlationId,
        idempotencyKey: "sms-notice-222",
        propertyId: identifiers.propertyId,
        to: "555-0100",
      }).success,
    ).toBe(false);

    expect(
      webhookReceiptInputSchema.safeParse({
        externalEventId: "provider-event-222",
        propertyId: identifiers.propertyId,
        provider: "POSTMARK",
        providerAccountKey: "transactional-stream",
        type: "Delivery",
      }).success,
    ).toBe(true);
    expect(
      webhookReceiptInputSchema.safeParse({
        externalEventId: "provider-event-222",
        propertyId: "not-a-property",
        provider: "POSTMARK",
        providerAccountKey: "transactional-stream",
        type: "Delivery",
      }).success,
    ).toBe(false);
  });
});
