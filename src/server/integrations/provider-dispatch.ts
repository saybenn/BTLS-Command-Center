import "server-only";

import { createHash } from "node:crypto";
import { z } from "zod";

import { prisma } from "@/server/database/prisma";
import {
  transactionalEmailRecipientSchema,
  type TransactionalEmailProvider,
} from "@/server/integrations/email/transactional-email-provider";
import { ProviderDispatchError } from "@/server/integrations/provider-errors";
import type { SmsProvider } from "@/server/integrations/sms/sms-provider";

const dispatchContextSchema = z.object({
  correlationId: z.string().uuid(),
  idempotencyKey: z.string().trim().min(1).max(200),
  jobExecutionId: z.string().uuid().optional(),
  operationType: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9._-]+$/),
  propertyId: z.string().uuid(),
});

const emailDispatchSchema = dispatchContextSchema
  .extend({
    htmlBody: z.string().min(1).max(1_000_000).optional(),
    providerCorrelationId: z.string().trim().min(1).max(200).optional(),
    recipients: z.array(transactionalEmailRecipientSchema).min(1).max(100),
    sendingIdentityId: z.string().uuid(),
    subject: z
      .string()
      .trim()
      .min(1)
      .max(998)
      .regex(/^[^\r\n]+$/),
    textBody: z.string().min(1).max(1_000_000).optional(),
  })
  .refine((value) => value.htmlBody !== undefined || value.textBody !== undefined, {
    message: "Transactional email requires an HTML or plain-text body.",
  });

const smsDispatchSchema = dispatchContextSchema.extend({
  body: z.string().trim().min(1).max(1_600),
  to: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/),
});

const DEFAULT_PENDING_DISPATCH_LEASE_MS = 5 * 60 * 1_000;

type DispatchRecord = {
  id: string;
  propertyId: string;
  channel: "TRANSACTIONAL_EMAIL" | "SMS";
  operationType: string;
  idempotencyKey: string;
  correlationId: string;
  requestFingerprint: string;
  providerName: string;
  providerMessageId: string | null;
  providerCorrelationId: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "UNCERTAIN" | "FAILED";
  acceptedAt: Date | null;
  failureCategory: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DispatchRepository = {
  create(input: { data: Record<string, unknown> }): Promise<DispatchRecord>;
  findFirst(input: { where: Record<string, unknown> }): Promise<DispatchRecord | null>;
  update(input: { where: { id: string }; data: Record<string, unknown> }): Promise<DispatchRecord>;
  updateMany(input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
};

type IdentityRepository = {
  findFirst(input: { where: Record<string, unknown> }): Promise<{
    id: string;
    mode: "BTLS_MANAGED" | "CUSTOM_DOMAIN" | "CONNECTED_MAILBOX";
    status: "ACTIVE" | "DISABLED";
    displayName: string;
    fromAddress: string;
    replyToAddress: string | null;
  } | null>;
};

type JobExecutionRepository = {
  findFirst(input: { where: Record<string, unknown> }): Promise<{ id: string } | null>;
};

export type ProviderDispatchDependencies = {
  jobExecution: JobExecutionRepository;
  providerDispatch: DispatchRepository;
  sendingIdentity: IdentityRepository;
  now: () => Date;
  pendingDispatchLeaseMs?: number;
};

export type ProviderDispatchResult = {
  created: boolean;
  outcome: "ACCEPTED";
  record: DispatchRecord;
};

function dependencies(): ProviderDispatchDependencies {
  return {
    jobExecution: prisma.jobExecution as unknown as JobExecutionRepository,
    providerDispatch: prisma.providerDispatch as unknown as DispatchRepository,
    sendingIdentity: prisma.sendingIdentity as unknown as IdentityRepository,
    now: () => new Date(),
  };
}

function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function existingDispatchError(record: DispatchRecord, retryAt?: Date): ProviderDispatchError {
  if (record.status === "PENDING") {
    return new ProviderDispatchError({
      category: "PROVIDER_DISPATCH_IN_PROGRESS",
      disposition: "UNCERTAIN",
      retryAt,
    });
  }
  if (record.status === "UNCERTAIN") {
    return new ProviderDispatchError({
      category: record.failureCategory ?? "PROVIDER_OUTCOME_UNCERTAIN",
      disposition: "UNCERTAIN",
    });
  }
  return new ProviderDispatchError({
    category:
      record.failureCategory ??
      (record.status === "FAILED" ? "PROVIDER_DISPATCH_FAILED" : "PROVIDER_DISPATCH_REJECTED"),
    disposition: "REJECTED",
  });
}

async function resolveExistingDispatch(
  record: DispatchRecord,
  providerDependencies: ProviderDispatchDependencies,
): Promise<ProviderDispatchResult> {
  if (record.status === "ACCEPTED") {
    return { created: false, outcome: "ACCEPTED", record };
  }
  if (record.status !== "PENDING") throw existingDispatchError(record);

  const leaseMs = providerDependencies.pendingDispatchLeaseMs ?? DEFAULT_PENDING_DISPATCH_LEASE_MS;
  if (!Number.isSafeInteger(leaseMs) || leaseMs <= 0) {
    throw new Error("The provider dispatch lease must be a positive integer.");
  }
  const now = providerDependencies.now();
  const retryAt = new Date(record.updatedAt.getTime() + leaseMs);
  if (now.getTime() < retryAt.getTime()) {
    throw existingDispatchError(record, retryAt);
  }

  await providerDependencies.providerDispatch.updateMany({
    where: { id: record.id, status: "PENDING", updatedAt: record.updatedAt },
    data: {
      status: "UNCERTAIN",
      failureCategory: "PROVIDER_DISPATCH_INTERRUPTED",
      failureAt: now,
    },
  });
  const current = await providerDependencies.providerDispatch.findFirst({
    where: { id: record.id },
  });
  if (!current) {
    throw new Error("The provider dispatch disappeared while resolving its state.");
  }
  if (current.status === "ACCEPTED") {
    return { created: false, outcome: "ACCEPTED", record: current };
  }
  throw existingDispatchError(current);
}

async function createDispatch(
  input: {
    channel: "TRANSACTIONAL_EMAIL" | "SMS";
    correlationId: string;
    fingerprint: string;
    idempotencyKey: string;
    jobExecutionId?: string;
    operationType: string;
    propertyId: string;
    providerName: string;
    sendingIdentityId?: string;
  },
  providerDependencies: ProviderDispatchDependencies,
): Promise<{ created: boolean; record: DispatchRecord }> {
  try {
    return {
      created: true,
      record: await providerDependencies.providerDispatch.create({
        data: {
          propertyId: input.propertyId,
          jobExecutionId: input.jobExecutionId,
          sendingIdentityId: input.sendingIdentityId,
          channel: input.channel,
          providerName: input.providerName,
          operationType: input.operationType,
          idempotencyKey: input.idempotencyKey,
          correlationId: input.correlationId,
          requestFingerprint: input.fingerprint,
        },
      }),
    };
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    const record = await providerDependencies.providerDispatch.findFirst({
      where: {
        propertyId: input.propertyId,
        channel: input.channel,
        operationType: input.operationType,
        idempotencyKey: input.idempotencyKey,
      },
    });
    if (!record) throw error;
    if (record.requestFingerprint !== input.fingerprint) {
      throw new ProviderDispatchError({
        category: "IDEMPOTENCY_CONTEXT_CONFLICT",
        disposition: "REJECTED",
      });
    }
    return { created: false, record };
  }
}

async function persistFailure(
  record: DispatchRecord,
  error: unknown,
  providerDependencies: ProviderDispatchDependencies,
): Promise<never> {
  const providerError =
    error instanceof ProviderDispatchError
      ? error
      : new ProviderDispatchError({
          category: "PROVIDER_OUTCOME_UNCERTAIN",
          disposition: "UNCERTAIN",
        });
  await providerDependencies.providerDispatch.update({
    where: { id: record.id },
    data: {
      status: providerError.disposition,
      failureCategory: providerError.category,
      failureAt: providerDependencies.now(),
    },
  });
  throw providerError;
}

async function requireJobExecutionScope(
  input: { jobExecutionId?: string; propertyId: string },
  providerDependencies: ProviderDispatchDependencies,
): Promise<void> {
  if (!input.jobExecutionId) return;
  const jobExecution = await providerDependencies.jobExecution.findFirst({
    where: { id: input.jobExecutionId, propertyId: input.propertyId },
  });
  if (!jobExecution) {
    throw new ProviderDispatchError({
      category: "JOB_EXECUTION_SCOPE_MISMATCH",
      disposition: "REJECTED",
    });
  }
}

export async function dispatchTransactionalEmail(
  rawInput: unknown,
  provider: TransactionalEmailProvider,
  providerDependencies: ProviderDispatchDependencies = dependencies(),
): Promise<ProviderDispatchResult> {
  const input = emailDispatchSchema.parse(rawInput);
  await requireJobExecutionScope(input, providerDependencies);
  const identity = await providerDependencies.sendingIdentity.findFirst({
    where: {
      id: input.sendingIdentityId,
      propertyId: input.propertyId,
      mode: "BTLS_MANAGED",
      status: "ACTIVE",
    },
  });
  if (!identity) {
    throw new ProviderDispatchError({
      category: "SENDING_IDENTITY_UNAVAILABLE",
      disposition: "REJECTED",
    });
  }
  const providerInput = {
    correlationId: input.correlationId,
    htmlBody: input.htmlBody,
    idempotencyKey: input.idempotencyKey,
    identity,
    providerCorrelationId: input.providerCorrelationId,
    recipients: input.recipients,
    subject: input.subject,
    textBody: input.textBody,
  };
  const requestFingerprint = fingerprint(input);
  const dispatch = await createDispatch(
    {
      ...input,
      channel: "TRANSACTIONAL_EMAIL",
      fingerprint: requestFingerprint,
      providerName: "POSTMARK",
    },
    providerDependencies,
  );
  if (!dispatch.created) return resolveExistingDispatch(dispatch.record, providerDependencies);
  try {
    const result = await provider.sendTransactionalEmail(providerInput);
    const record = await providerDependencies.providerDispatch.update({
      where: { id: dispatch.record.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: result.acceptedAt,
        providerCorrelationId: input.providerCorrelationId,
        providerMessageId: result.providerMessageId,
      },
    });
    return { created: true, outcome: "ACCEPTED", record } satisfies ProviderDispatchResult;
  } catch (error) {
    return persistFailure(dispatch.record, error, providerDependencies);
  }
}

export async function dispatchSms(
  rawInput: unknown,
  provider: SmsProvider,
  providerDependencies: ProviderDispatchDependencies = dependencies(),
): Promise<ProviderDispatchResult> {
  const input = smsDispatchSchema.parse(rawInput);
  await requireJobExecutionScope(input, providerDependencies);
  const providerInput = {
    body: input.body,
    correlationId: input.correlationId,
    idempotencyKey: input.idempotencyKey,
    propertyId: input.propertyId,
    to: input.to,
  };
  const dispatch = await createDispatch(
    {
      ...input,
      channel: "SMS",
      fingerprint: fingerprint(input),
      providerName: "TWILIO",
    },
    providerDependencies,
  );
  if (!dispatch.created) return resolveExistingDispatch(dispatch.record, providerDependencies);
  try {
    const result = await provider.sendMessage(providerInput);
    const record = await providerDependencies.providerDispatch.update({
      where: { id: dispatch.record.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: result.acceptedAt,
        providerMessageId: result.providerMessageId,
      },
    });
    return { created: true, outcome: "ACCEPTED", record } satisfies ProviderDispatchResult;
  } catch (error) {
    return persistFailure(dispatch.record, error, providerDependencies);
  }
}
