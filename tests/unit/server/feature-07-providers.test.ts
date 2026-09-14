import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { createPostmarkTransactionalEmailProvider } from "@/server/integrations/email/postmark-adapter";
import { ProviderDispatchError } from "@/server/integrations/provider-errors";
import {
  dispatchSms,
  dispatchTransactionalEmail,
  type ProviderDispatchDependencies,
} from "@/server/integrations/provider-dispatch";
import { createTwilioSmsProvider } from "@/server/integrations/sms/twilio-adapter";
import {
  claimWebhookReceipt,
  completeWebhookReceipt,
  failWebhookReceipt,
  recordWebhookReceipt,
  type WebhookReceiptDependencies,
} from "@/server/integrations/webhooks/webhook-receipts";

const ids = {
  correlation: "11111111-1111-4111-8111-111111111111",
  identity: "22222222-2222-4222-8222-222222222222",
  property: "33333333-3333-4333-8333-333333333333",
};

function dispatchDependencies() {
  const records: Array<Record<string, unknown>> = [];
  let currentTime = new Date("2026-09-11T12:00:00.000Z");
  const dependencies = {
    now: () => new Date(currentTime),
    jobExecution: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) =>
        where.id === "44444444-4444-4444-8444-444444444444" && where.propertyId === ids.property
          ? { id: where.id }
          : null,
    },
    sendingIdentity: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) =>
        where.id === ids.identity && where.propertyId === ids.property
          ? {
              id: ids.identity,
              mode: "BTLS_MANAGED",
              status: "ACTIVE",
              displayName: 'BTLS "Command" Center',
              fromAddress: "no-reply@btls.example",
              replyToAddress: "team@example.com",
            }
          : null,
    },
    providerDispatch: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        if (
          records.some(
            (record) =>
              record.propertyId === data.propertyId &&
              record.channel === data.channel &&
              record.operationType === data.operationType &&
              record.idempotencyKey === data.idempotencyKey,
          )
        ) {
          throw Object.assign(new Error("duplicate"), { code: "P2002" });
        }
        const record = {
          id: randomUUID(),
          providerMessageId: null,
          providerCorrelationId: null,
          acceptedAt: null,
          failureCategory: null,
          status: "PENDING",
          createdAt: dependencies.now(),
          updatedAt: dependencies.now(),
          ...data,
        };
        records.push(record);
        return record;
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) =>
        records.find((record) =>
          Object.entries(where).every(([key, value]) => record[key] === value),
        ) ?? null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const record = records.find((candidate) => candidate.id === where.id);
        if (!record) throw new Error("missing");
        Object.assign(record, data, { updatedAt: dependencies.now() });
        return record;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        const record = records.find((candidate) =>
          Object.entries(where).every(([key, value]) => {
            const candidateValue = candidate[key];
            return candidateValue instanceof Date && value instanceof Date
              ? candidateValue.getTime() === value.getTime()
              : candidateValue === value;
          }),
        );
        if (!record) return { count: 0 };
        Object.assign(record, data, { updatedAt: dependencies.now() });
        return { count: 1 };
      },
    },
  } as unknown as ProviderDispatchDependencies;
  return {
    dependencies,
    records,
    setNow(value: string) {
      currentTime = new Date(value);
    },
  };
}

describe("Feature 07 provider adapters and durable evidence", () => {
  it("maps BTLS-managed transactional mail to Postmark and normalizes its message ID", async () => {
    const sendEmail = vi.fn().mockResolvedValue({
      MessageID: "postmark-message",
      SubmittedAt: "2026-09-11T12:00:00.000Z",
    });
    const provider = createPostmarkTransactionalEmailProvider({
      client: { sendEmail },
      messageStream: "outbound",
    });
    const result = await provider.sendTransactionalEmail({
      correlationId: ids.correlation,
      idempotencyKey: "system-notice",
      identity: {
        displayName: 'BTLS "Command" Center',
        fromAddress: "no-reply@btls.example",
        mode: "BTLS_MANAGED",
        replyToAddress: "team@example.com",
      },
      recipients: [{ email: "owner@example.com", name: "Property Owner" }],
      subject: "System notice",
      textBody: "A safe system notice.",
    });
    expect(result).toEqual({
      acceptedAt: new Date("2026-09-11T12:00:00.000Z"),
      providerMessageId: "postmark-message",
      providerName: "POSTMARK",
    });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        From: '"BTLS \\"Command\\" Center" <no-reply@btls.example>',
        To: '"Property Owner" <owner@example.com>',
        MessageStream: "outbound",
        Metadata: {
          correlationId: ids.correlation,
          idempotencyKey: "system-notice",
        },
      }),
    );
  });

  it("rejects non-BTLS sending modes and header injection before provider access", async () => {
    const provider = createPostmarkTransactionalEmailProvider({
      client: { sendEmail: vi.fn() },
    });
    await expect(
      provider.sendTransactionalEmail({
        correlationId: ids.correlation,
        idempotencyKey: "unsupported",
        identity: {
          displayName: "Custom",
          fromAddress: "sender@example.com",
          mode: "CUSTOM_DOMAIN",
          replyToAddress: null,
        },
        recipients: [{ email: "owner@example.com" }],
        subject: "Unsupported",
        textBody: "No send.",
      }),
    ).rejects.toMatchObject({ category: "SENDING_IDENTITY_MODE_UNSUPPORTED" });
    await expect(
      provider.sendTransactionalEmail({
        correlationId: ids.correlation,
        idempotencyKey: "headers",
        identity: {
          displayName: "BTLS",
          fromAddress: "sender@example.com",
          mode: "BTLS_MANAGED",
          replyToAddress: null,
        },
        recipients: [{ email: "owner@example.com" }],
        subject: "Hello\r\nBcc: hidden@example.com",
        textBody: "No send.",
      }),
    ).rejects.toThrow();
  });

  it("maps property-scoped SMS to Twilio Messaging Services", async () => {
    const create = vi.fn().mockResolvedValue({
      sid: "SM123",
      dateCreated: new Date("2026-09-11T12:00:00.000Z"),
    });
    const provider = createTwilioSmsProvider({
      client: { messages: { create } },
      messagingServiceSid: "MG123",
    });
    await expect(
      provider.sendMessage({
        body: "System notice",
        correlationId: ids.correlation,
        idempotencyKey: "sms-notice",
        propertyId: ids.property,
        to: "+15550100",
      }),
    ).resolves.toMatchObject({ providerMessageId: "SM123", providerName: "TWILIO" });
    expect(create).toHaveBeenCalledWith({
      body: "System notice",
      messagingServiceSid: "MG123",
      statusCallback: undefined,
      to: "+15550100",
    });
  });

  it("persists one email dispatch and does not repeat its external effect", async () => {
    const { dependencies, records } = dispatchDependencies();
    const provider = {
      sendTransactionalEmail: vi.fn().mockResolvedValue({
        acceptedAt: new Date("2026-09-11T12:00:00.000Z"),
        providerMessageId: "pm-1",
        providerName: "POSTMARK" as const,
      }),
    };
    const input = {
      correlationId: ids.correlation,
      idempotencyKey: "notice-1",
      operationType: "system.notice",
      propertyId: ids.property,
      sendingIdentityId: ids.identity,
      recipients: [{ email: "owner@example.com" }],
      subject: "Ready",
      textBody: "The operation is ready.",
    };
    await expect(dispatchTransactionalEmail(input, provider, dependencies)).resolves.toMatchObject({
      created: true,
      outcome: "ACCEPTED",
      record: { status: "ACCEPTED", providerMessageId: "pm-1" },
    });
    await expect(dispatchTransactionalEmail(input, provider, dependencies)).resolves.toMatchObject({
      created: false,
      outcome: "ACCEPTED",
      record: { status: "ACCEPTED" },
    });
    expect(provider.sendTransactionalEmail).toHaveBeenCalledTimes(1);
    expect(records).toHaveLength(1);
    await expect(
      dispatchTransactionalEmail({ ...input, subject: "Changed" }, provider, dependencies),
    ).rejects.toMatchObject({ category: "IDEMPOTENCY_CONTEXT_CONFLICT" });
  });

  it("rejects a dispatch linked to a job outside the property", async () => {
    const { dependencies, records } = dispatchDependencies();
    const provider = { sendMessage: vi.fn() };
    await expect(
      dispatchSms(
        {
          body: "System notice",
          correlationId: ids.correlation,
          idempotencyKey: "cross-property",
          jobExecutionId: "55555555-5555-4555-8555-555555555555",
          operationType: "system.notice",
          propertyId: ids.property,
          to: "+15550100",
        },
        provider,
        dependencies,
      ),
    ).rejects.toMatchObject({ category: "JOB_EXECUTION_SCOPE_MISMATCH" });
    expect(records).toHaveLength(0);
    expect(provider.sendMessage).not.toHaveBeenCalled();
  });

  it("keeps an uncertain SMS result visible and does not resend it", async () => {
    const { dependencies, records } = dispatchDependencies();
    const provider = {
      sendMessage: vi.fn().mockRejectedValue(
        new ProviderDispatchError({
          category: "TWILIO_OUTCOME_UNCERTAIN",
          disposition: "UNCERTAIN",
        }),
      ),
    };
    const input = {
      body: "System notice",
      correlationId: ids.correlation,
      idempotencyKey: "sms-1",
      operationType: "system.notice",
      propertyId: ids.property,
      to: "+15550100",
    };
    await expect(dispatchSms(input, provider, dependencies)).rejects.toMatchObject({
      category: "TWILIO_OUTCOME_UNCERTAIN",
    });
    expect(records[0]).toMatchObject({
      status: "UNCERTAIN",
      failureCategory: "TWILIO_OUTCOME_UNCERTAIN",
    });
    await expect(dispatchSms(input, provider, dependencies)).rejects.toMatchObject({
      category: "TWILIO_OUTCOME_UNCERTAIN",
      disposition: "UNCERTAIN",
    });
    expect(provider.sendMessage).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["REJECTED", "POSTMARK_REQUEST_REJECTED"],
    ["FAILED", "PROVIDER_DISPATCH_FAILED"],
  ] as const)(
    "keeps an existing %s dispatch as a controlled non-success",
    async (status, failureCategory) => {
      const { dependencies, records } = dispatchDependencies();
      const provider = {
        sendTransactionalEmail: vi.fn().mockResolvedValue({
          acceptedAt: new Date("2026-09-11T12:00:00.000Z"),
          providerMessageId: "pm-status",
          providerName: "POSTMARK" as const,
        }),
      };
      const input = {
        correlationId: ids.correlation,
        idempotencyKey: `email-${status.toLowerCase()}`,
        operationType: "system.notice",
        propertyId: ids.property,
        sendingIdentityId: ids.identity,
        recipients: [{ email: "owner@example.com" }],
        subject: "Ready",
        textBody: "The operation is ready.",
      };
      await dispatchTransactionalEmail(input, provider, dependencies);
      Object.assign(records[0], { status, failureCategory });
      await expect(dispatchTransactionalEmail(input, provider, dependencies)).rejects.toMatchObject(
        {
          category: failureCategory,
          disposition: "REJECTED",
        },
      );
      expect(provider.sendTransactionalEmail).toHaveBeenCalledTimes(1);
    },
  );

  it("does not resend a live or interrupted pending provider dispatch", async () => {
    const live = dispatchDependencies();
    let acceptSend:
      | ((value: { acceptedAt: Date; providerMessageId: string; providerName: "TWILIO" }) => void)
      | undefined;
    const provider = {
      sendMessage: vi.fn(
        () =>
          new Promise<{
            acceptedAt: Date;
            providerMessageId: string;
            providerName: "TWILIO";
          }>((resolve) => {
            acceptSend = resolve;
          }),
      ),
    };
    const input = {
      body: "System notice",
      correlationId: ids.correlation,
      idempotencyKey: "pending-sms",
      operationType: "system.notice",
      propertyId: ids.property,
      to: "+15550100",
    };
    const first = dispatchSms(input, provider, live.dependencies);
    await vi.waitFor(() => expect(live.records).toHaveLength(1));
    await expect(dispatchSms(input, provider, live.dependencies)).rejects.toMatchObject({
      category: "PROVIDER_DISPATCH_IN_PROGRESS",
      disposition: "UNCERTAIN",
      retryAt: new Date("2026-09-11T12:05:00.000Z"),
    });
    expect(provider.sendMessage).toHaveBeenCalledTimes(1);
    acceptSend?.({
      acceptedAt: new Date("2026-09-11T12:00:00.000Z"),
      providerMessageId: "SM-live",
      providerName: "TWILIO",
    });
    await expect(first).resolves.toMatchObject({ outcome: "ACCEPTED" });

    const interrupted = dispatchDependencies();
    const acceptedProvider = {
      sendMessage: vi.fn().mockResolvedValue({
        acceptedAt: new Date("2026-09-11T12:00:00.000Z"),
        providerMessageId: "SM-interrupted",
        providerName: "TWILIO" as const,
      }),
    };
    await dispatchSms(input, acceptedProvider, interrupted.dependencies);
    Object.assign(interrupted.records[0], {
      status: "PENDING",
      acceptedAt: null,
      providerMessageId: null,
      updatedAt: new Date("2026-09-11T12:00:00.000Z"),
    });
    interrupted.setNow("2026-09-11T12:06:00.000Z");
    await expect(
      dispatchSms(input, acceptedProvider, interrupted.dependencies),
    ).rejects.toMatchObject({
      category: "PROVIDER_DISPATCH_INTERRUPTED",
      disposition: "UNCERTAIN",
    });
    expect(interrupted.records[0]).toMatchObject({
      status: "UNCERTAIN",
      failureCategory: "PROVIDER_DISPATCH_INTERRUPTED",
    });
    expect(acceptedProvider.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("deduplicates provider-neutral receipts and recovers an expired fenced claim", async () => {
    const receipts: Array<Record<string, unknown>> = [];
    let currentTime = new Date("2026-09-11T12:00:00.000Z");
    const dependencies = {
      now: () => new Date(currentTime),
      webhookReceipt: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          if (receipts.length) throw Object.assign(new Error("duplicate"), { code: "P2002" });
          const record = {
            id: randomUUID(),
            status: "RECEIVED",
            processingStartedAt: null,
            ...data,
          };
          receipts.push(record);
          return record;
        },
        findFirst: async () => receipts[0] ?? null,
        updateMany: async ({
          where,
          data,
        }: {
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }) => {
          const record = receipts.find((candidate) =>
            Object.entries(where).every(([key, value]) => candidate[key] === value),
          );
          if (!record) return { count: 0 };
          Object.assign(record, data);
          return { count: 1 };
        },
      },
    } as unknown as WebhookReceiptDependencies;
    const input = {
      correlationId: ids.correlation,
      externalEventId: "provider-event-1",
      propertyId: ids.property,
      provider: "POSTMARK",
      providerAccountKey: "transactional",
      type: "Delivery",
    };
    const first = await recordWebhookReceipt(input, dependencies);
    expect(first.created).toBe(true);
    await expect(recordWebhookReceipt(input, dependencies)).resolves.toMatchObject({
      created: false,
    });
    const initialClaim = await claimWebhookReceipt(first.record.id, dependencies);
    expect(initialClaim).toEqual({
      outcome: "CLAIMED",
      processingStartedAt: new Date("2026-09-11T12:00:00.000Z"),
      recovered: false,
      retryAt: new Date("2026-09-11T12:05:00.000Z"),
    });
    await expect(claimWebhookReceipt(first.record.id, dependencies)).resolves.toEqual({
      outcome: "ACTIVE",
      retryAt: new Date("2026-09-11T12:05:00.000Z"),
    });
    currentTime = new Date("2026-09-11T12:06:00.000Z");
    const recoveredClaim = await claimWebhookReceipt(first.record.id, dependencies);
    expect(recoveredClaim).toEqual({
      outcome: "CLAIMED",
      processingStartedAt: currentTime,
      recovered: true,
      retryAt: new Date("2026-09-11T12:11:00.000Z"),
    });
    if (initialClaim.outcome !== "CLAIMED" || recoveredClaim.outcome !== "CLAIMED") {
      throw new Error("Expected claimed webhook receipt leases.");
    }
    await expect(
      completeWebhookReceipt(
        { receiptId: first.record.id, processingStartedAt: initialClaim.processingStartedAt },
        dependencies,
      ),
    ).resolves.toBe(false);
    await expect(
      completeWebhookReceipt(
        { receiptId: first.record.id, processingStartedAt: recoveredClaim.processingStartedAt },
        dependencies,
      ),
    ).resolves.toBe(true);
    expect(receipts[0]).toMatchObject({ status: "PROCESSED" });
    await expect(
      failWebhookReceipt(
        {
          receiptId: first.record.id,
          processingStartedAt: recoveredClaim.processingStartedAt,
          failureCategory: "secret text",
        },
        dependencies,
      ),
    ).rejects.toThrow();
  });
});
