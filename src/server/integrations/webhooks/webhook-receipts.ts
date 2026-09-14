import "server-only";

import { prisma } from "@/server/database/prisma";
import { z } from "zod";

import { webhookReceiptInputSchema } from "./webhook-receipt-contracts";

const failureCategorySchema = z
  .string()
  .trim()
  .regex(/^[A-Z][A-Z0-9_]{0,119}$/);

const receiptIdSchema = z.string().uuid();
const DEFAULT_PROCESSING_LEASE_MS = 5 * 60 * 1_000;

type ReceiptRecord = {
  id: string;
  propertyId: string | null;
  provider: "POSTMARK" | "TWILIO";
  providerAccountKey: string;
  externalEventId: string;
  eventType: string;
  correlationId: string | null;
  occurredAt: Date | null;
  status: "RECEIVED" | "PROCESSING" | "PROCESSED" | "FAILED";
  processingStartedAt: Date | null;
};

type ReceiptRepository = {
  create(input: { data: Record<string, unknown> }): Promise<ReceiptRecord>;
  findFirst(input: { where: Record<string, unknown> }): Promise<ReceiptRecord | null>;
  updateMany(input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
};

export type WebhookReceiptDependencies = {
  webhookReceipt: ReceiptRepository;
  now: () => Date;
  processingLeaseMs?: number;
};

export type WebhookReceiptClaim =
  | { outcome: "CLAIMED"; processingStartedAt: Date; recovered: boolean; retryAt: Date }
  | { outcome: "ACTIVE"; retryAt: Date }
  | { outcome: "UNAVAILABLE" };

function dependencies(): WebhookReceiptDependencies {
  return {
    webhookReceipt: prisma.webhookReceipt as unknown as ReceiptRepository,
    now: () => new Date(),
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function recordWebhookReceipt(
  rawInput: unknown,
  receiptDependencies: WebhookReceiptDependencies = dependencies(),
): Promise<{ created: boolean; record: ReceiptRecord }> {
  const input = webhookReceiptInputSchema.parse(rawInput);
  try {
    return {
      created: true,
      record: await receiptDependencies.webhookReceipt.create({
        data: {
          propertyId: input.propertyId,
          provider: input.provider,
          providerAccountKey: input.providerAccountKey,
          externalEventId: input.externalEventId,
          eventType: input.type,
          correlationId: input.correlationId,
          occurredAt: input.occurredAt,
        },
      }),
    };
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    const record = await receiptDependencies.webhookReceipt.findFirst({
      where: {
        provider: input.provider,
        providerAccountKey: input.providerAccountKey,
        externalEventId: input.externalEventId,
      },
    });
    if (!record) throw error;
    const sameContext =
      record.propertyId === (input.propertyId ?? null) &&
      record.eventType === input.type &&
      record.correlationId === (input.correlationId ?? null) &&
      record.occurredAt?.toISOString() === input.occurredAt?.toISOString();
    if (!sameContext) throw new Error("The webhook receipt key has conflicting context.");
    return { created: false, record };
  }
}

export async function claimWebhookReceipt(
  receiptId: string,
  receiptDependencies: WebhookReceiptDependencies = dependencies(),
): Promise<WebhookReceiptClaim> {
  const safeReceiptId = receiptIdSchema.parse(receiptId);
  const leaseMs = receiptDependencies.processingLeaseMs ?? DEFAULT_PROCESSING_LEASE_MS;
  if (!Number.isSafeInteger(leaseMs) || leaseMs <= 0) {
    throw new Error("The webhook processing lease must be a positive integer.");
  }
  const receipt = await receiptDependencies.webhookReceipt.findFirst({
    where: { id: safeReceiptId },
  });
  if (!receipt || receipt.status === "PROCESSED" || receipt.status === "FAILED") {
    return { outcome: "UNAVAILABLE" };
  }

  const claimTime = receiptDependencies.now();
  if (receipt.status === "RECEIVED") {
    const claimed = await receiptDependencies.webhookReceipt.updateMany({
      where: { id: safeReceiptId, status: "RECEIVED" },
      data: { status: "PROCESSING", processingStartedAt: claimTime },
    });
    if (claimed.count === 1) {
      return {
        outcome: "CLAIMED",
        processingStartedAt: claimTime,
        recovered: false,
        retryAt: new Date(claimTime.getTime() + leaseMs),
      };
    }
  } else if (receipt.processingStartedAt) {
    const retryAt = new Date(receipt.processingStartedAt.getTime() + leaseMs);
    if (claimTime.getTime() < retryAt.getTime()) return { outcome: "ACTIVE", retryAt };
    const recovered = await receiptDependencies.webhookReceipt.updateMany({
      where: {
        id: safeReceiptId,
        status: "PROCESSING",
        processingStartedAt: receipt.processingStartedAt,
      },
      data: { processingStartedAt: claimTime },
    });
    if (recovered.count === 1) {
      return {
        outcome: "CLAIMED",
        processingStartedAt: claimTime,
        recovered: true,
        retryAt: new Date(claimTime.getTime() + leaseMs),
      };
    }
  }

  const current = await receiptDependencies.webhookReceipt.findFirst({
    where: { id: safeReceiptId },
  });
  if (current?.status === "PROCESSING" && current.processingStartedAt) {
    return {
      outcome: "ACTIVE",
      retryAt: new Date(current.processingStartedAt.getTime() + leaseMs),
    };
  }
  return { outcome: "UNAVAILABLE" };
}

export async function completeWebhookReceipt(
  input: { receiptId: string; processingStartedAt: Date },
  receiptDependencies: WebhookReceiptDependencies = dependencies(),
): Promise<boolean> {
  const receiptId = receiptIdSchema.parse(input.receiptId);
  const result = await receiptDependencies.webhookReceipt.updateMany({
    where: {
      id: receiptId,
      status: "PROCESSING",
      processingStartedAt: input.processingStartedAt,
    },
    data: { status: "PROCESSED", processedAt: receiptDependencies.now() },
  });
  return result.count === 1;
}

export async function failWebhookReceipt(
  input: { receiptId: string; processingStartedAt: Date; failureCategory: string },
  receiptDependencies: WebhookReceiptDependencies = dependencies(),
): Promise<boolean> {
  const receiptId = receiptIdSchema.parse(input.receiptId);
  const safeFailureCategory = failureCategorySchema.parse(input.failureCategory);
  const result = await receiptDependencies.webhookReceipt.updateMany({
    where: {
      id: receiptId,
      status: "PROCESSING",
      processingStartedAt: input.processingStartedAt,
    },
    data: {
      status: "FAILED",
      failureCategory: safeFailureCategory,
      failureAt: receiptDependencies.now(),
    },
  });
  return result.count === 1;
}
