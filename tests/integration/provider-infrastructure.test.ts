import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { prisma } from "@/server/database/prisma";
import {
  dispatchSms,
  dispatchTransactionalEmail,
  type ProviderDispatchDependencies,
} from "@/server/integrations/provider-dispatch";
import {
  claimWebhookReceipt,
  completeWebhookReceipt,
  recordWebhookReceipt,
  type WebhookReceiptDependencies,
} from "@/server/integrations/webhooks/webhook-receipts";

const ids = {
  account: randomUUID(),
  correlation: randomUUID(),
  identity: randomUUID(),
  property: randomUUID(),
};

const dispatchDependencies: ProviderDispatchDependencies = {
  jobExecution: prisma.jobExecution as unknown as ProviderDispatchDependencies["jobExecution"],
  providerDispatch:
    prisma.providerDispatch as unknown as ProviderDispatchDependencies["providerDispatch"],
  sendingIdentity:
    prisma.sendingIdentity as unknown as ProviderDispatchDependencies["sendingIdentity"],
  now: () => new Date(),
};
let receiptNow = new Date("2026-09-11T12:00:00.000Z");
const receiptDependencies: WebhookReceiptDependencies = {
  webhookReceipt: prisma.webhookReceipt as unknown as WebhookReceiptDependencies["webhookReceipt"],
  now: () => new Date(receiptNow),
};

describe("Feature 07 provider infrastructure database integration", () => {
  beforeAll(async () => {
    await prisma.clientAccount.create({
      data: {
        id: ids.account,
        name: "Provider infrastructure integration",
        properties: {
          create: {
            id: ids.property,
            name: "Provider infrastructure property",
            domain: `provider-${ids.property.slice(0, 8)}.example.test`,
          },
        },
      },
    });
    await prisma.sendingIdentity.create({
      data: {
        id: ids.identity,
        propertyId: ids.property,
        mode: "BTLS_MANAGED",
        displayName: "BTLS Command Center",
        fromAddress: "no-reply@btls.example",
        replyToAddress: "team@example.com",
      },
    });
  });

  afterAll(async () => {
    await prisma.providerDispatch.deleteMany({ where: { propertyId: ids.property } });
    await prisma.webhookReceipt.deleteMany({ where: { propertyId: ids.property } });
    await prisma.sendingIdentity.deleteMany({ where: { propertyId: ids.property } });
    await prisma.clientProperty.deleteMany({ where: { accountId: ids.account } });
    await prisma.clientAccount.deleteMany({ where: { id: ids.account } });
    await prisma.$disconnect();
  });

  it("persists one transport acceptance for duplicate email and SMS requests", async () => {
    const emailProvider = {
      sendTransactionalEmail: vi.fn().mockResolvedValue({
        acceptedAt: new Date(),
        providerMessageId: "postmark-db-proof",
        providerName: "POSTMARK" as const,
      }),
    };
    const emailInput = {
      correlationId: ids.correlation,
      idempotencyKey: "email-db-proof",
      operationType: "infrastructure.proof",
      propertyId: ids.property,
      sendingIdentityId: ids.identity,
      recipients: [{ email: "owner@example.test" }],
      subject: "Infrastructure proof",
      textBody: "Provider boundary proof.",
    };
    await dispatchTransactionalEmail(emailInput, emailProvider, dispatchDependencies);
    await dispatchTransactionalEmail(emailInput, emailProvider, dispatchDependencies);
    expect(emailProvider.sendTransactionalEmail).toHaveBeenCalledTimes(1);

    const smsProvider = {
      sendMessage: vi.fn().mockResolvedValue({
        acceptedAt: new Date(),
        providerMessageId: "SM-db-proof",
        providerName: "TWILIO" as const,
      }),
    };
    const smsInput = {
      body: "Provider boundary proof.",
      correlationId: ids.correlation,
      idempotencyKey: "sms-db-proof",
      operationType: "infrastructure.proof",
      propertyId: ids.property,
      to: "+15550100",
    };
    await dispatchSms(smsInput, smsProvider, dispatchDependencies);
    await dispatchSms(smsInput, smsProvider, dispatchDependencies);
    expect(smsProvider.sendMessage).toHaveBeenCalledTimes(1);
    await expect(
      prisma.providerDispatch.count({ where: { propertyId: ids.property } }),
    ).resolves.toBe(2);
  });

  it("atomically resolves a stale pending dispatch under a two-worker database race", async () => {
    const provider = {
      sendMessage: vi.fn().mockResolvedValue({
        acceptedAt: new Date(),
        providerMessageId: "SM-stale-race",
        providerName: "TWILIO" as const,
      }),
    };
    const input = {
      body: "Provider race proof.",
      correlationId: ids.correlation,
      idempotencyKey: "sms-stale-race-" + randomUUID(),
      operationType: "infrastructure.proof",
      propertyId: ids.property,
      to: "+15550101",
    };

    await dispatchSms(input, provider, dispatchDependencies);
    const accepted = await prisma.providerDispatch.findFirstOrThrow({
      where: {
        propertyId: ids.property,
        channel: "SMS",
        operationType: input.operationType,
        idempotencyKey: input.idempotencyKey,
      },
    });
    const pending = await prisma.providerDispatch.update({
      where: { id: accepted.id },
      data: {
        status: "PENDING",
        acceptedAt: null,
        providerMessageId: null,
        failureCategory: null,
        failureAt: null,
      },
    });

    const freshDependencies: ProviderDispatchDependencies = {
      ...dispatchDependencies,
      now: () => new Date(pending.updatedAt),
      pendingDispatchLeaseMs: 1,
    };
    await expect(dispatchSms(input, provider, freshDependencies)).rejects.toMatchObject({
      category: "PROVIDER_DISPATCH_IN_PROGRESS",
      disposition: "UNCERTAIN",
      retryAt: new Date(pending.updatedAt.getTime() + 1),
    });
    await expect(
      prisma.providerDispatch.findUniqueOrThrow({ where: { id: pending.id } }),
    ).resolves.toMatchObject({ status: "PENDING" });

    const baseRepository = dispatchDependencies.providerDispatch;
    let pendingReadCount = 0;
    let releasePendingReads: () => void = () => undefined;
    const bothPendingReads = new Promise<void>((resolve) => {
      releasePendingReads = resolve;
    });
    const compareAndSetCounts: number[] = [];
    const racingDependencies: ProviderDispatchDependencies = {
      ...dispatchDependencies,
      now: () => new Date(pending.updatedAt.getTime() + 2),
      pendingDispatchLeaseMs: 1,
      providerDispatch: {
        create: (repositoryInput) => baseRepository.create(repositoryInput),
        findFirst: async (repositoryInput) => {
          const record = await baseRepository.findFirst(repositoryInput);
          if (
            record?.id === pending.id &&
            Object.hasOwn(repositoryInput.where, "idempotencyKey") &&
            record.status === "PENDING"
          ) {
            pendingReadCount += 1;
            if (pendingReadCount === 2) releasePendingReads();
            await bothPendingReads;
          }
          return record;
        },
        update: (repositoryInput) => baseRepository.update(repositoryInput),
        updateMany: async (repositoryInput) => {
          const result = await baseRepository.updateMany(repositoryInput);
          compareAndSetCounts.push(result.count);
          return result;
        },
      },
    };

    const outcomes = await Promise.allSettled([
      dispatchSms(input, provider, racingDependencies),
      dispatchSms(input, provider, racingDependencies),
    ]);
    expect(pendingReadCount).toBe(2);
    expect(compareAndSetCounts.toSorted()).toEqual([0, 1]);
    for (const outcome of outcomes) {
      expect(outcome.status).toBe("rejected");
      if (outcome.status === "fulfilled") {
        throw new Error("A stale pending duplicate must not resolve successfully.");
      }
      const reason: unknown = outcome.reason;
      expect(reason).toMatchObject({
        category: "PROVIDER_DISPATCH_INTERRUPTED",
        disposition: "UNCERTAIN",
      });
    }

    expect(provider.sendMessage).toHaveBeenCalledTimes(1);
    await expect(
      prisma.providerDispatch.findUniqueOrThrow({ where: { id: pending.id } }),
    ).resolves.toMatchObject({
      propertyId: ids.property,
      channel: "SMS",
      providerName: "TWILIO",
      operationType: input.operationType,
      idempotencyKey: input.idempotencyKey,
      correlationId: input.correlationId,
      requestFingerprint: accepted.requestFingerprint,
      providerMessageId: null,
      acceptedAt: null,
      status: "UNCERTAIN",
      failureCategory: "PROVIDER_DISPATCH_INTERRUPTED",
    });
  });
  it("deduplicates a provider receipt and recovers an expired fenced processing claim", async () => {
    const input = {
      correlationId: ids.correlation,
      externalEventId: "postmark-event-db-proof",
      propertyId: ids.property,
      provider: "POSTMARK",
      providerAccountKey: "transactional",
      type: "Delivery",
    };
    const first = await recordWebhookReceipt(input, receiptDependencies);
    const duplicate = await recordWebhookReceipt(input, receiptDependencies);
    expect(first.created).toBe(true);
    expect(duplicate.created).toBe(false);
    const simultaneousClaims = await Promise.all([
      claimWebhookReceipt(first.record.id, receiptDependencies),
      claimWebhookReceipt(first.record.id, receiptDependencies),
    ]);
    const initialClaim = simultaneousClaims.find((claim) => claim.outcome === "CLAIMED");
    const activeClaim = simultaneousClaims.find((claim) => claim.outcome === "ACTIVE");
    expect(initialClaim).toMatchObject({
      outcome: "CLAIMED",
      recovered: false,
      retryAt: new Date("2026-09-11T12:05:00.000Z"),
    });
    expect(activeClaim).toMatchObject({
      outcome: "ACTIVE",
      retryAt: new Date("2026-09-11T12:05:00.000Z"),
    });
    receiptNow = new Date("2026-09-11T12:06:00.000Z");
    const recoveredClaim = await claimWebhookReceipt(first.record.id, receiptDependencies);
    expect(recoveredClaim).toMatchObject({ outcome: "CLAIMED", recovered: true });
    if (initialClaim?.outcome !== "CLAIMED" || recoveredClaim.outcome !== "CLAIMED") {
      throw new Error("Expected claimed webhook receipt leases.");
    }
    await expect(
      completeWebhookReceipt(
        { receiptId: first.record.id, processingStartedAt: initialClaim.processingStartedAt },
        receiptDependencies,
      ),
    ).resolves.toBe(false);
    await expect(
      completeWebhookReceipt(
        { receiptId: first.record.id, processingStartedAt: recoveredClaim.processingStartedAt },
        receiptDependencies,
      ),
    ).resolves.toBe(true);
    await expect(
      prisma.webhookReceipt.findUnique({ where: { id: first.record.id } }),
    ).resolves.toMatchObject({ status: "PROCESSED" });
  });
});
