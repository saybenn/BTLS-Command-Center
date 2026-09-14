import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { AppUser, JobExecutionAttempt, Prisma } from "@/generated/prisma/client";
import {
  contextualProofJobPayloadSchema,
  mediaCleanupJobPayloadSchema,
} from "@/server/jobs/job-contracts";
import { createEventOutboxEntry } from "@/server/events/event-outbox";

const jobInclude = {
  property: { select: { name: true, accountId: true } },
  attempts: { orderBy: { attemptNumber: "desc" as const }, take: 1 },
  _count: { select: { attempts: true } },
};
export type OperationJob = Prisma.JobExecutionGetPayload<{ include: typeof jobInclude }>;
export type OperationsActor = Pick<AppUser, "id" | "platformRole" | "status">;
export class OperationsAccessError extends Error {
  constructor() {
    super("Operations are unavailable.");
  }
}
export class RetryDeniedError extends Error {
  constructor() {
    super("This failure is no longer eligible for retry. Reload its details.");
  }
}
export const operationsFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  status: z
    .enum(["ATTENTION", "FAILED", "RETRY_SCHEDULED", "QUEUED", "RUNNING", "SUCCEEDED", "ALL"])
    .default("ATTENTION"),
  propertyId: z.string().uuid().optional(),
  correlationId: z.string().uuid().optional(),
});
export type OperationsFilters = z.infer<typeof operationsFiltersSchema>;
export const retryOperationSchema = z.strictObject({
  jobExecutionId: z.string().uuid(),
  propertyId: z.string().uuid(),
  failedAttemptId: z.string().uuid(),
  reason: z.string().trim().min(5).max(300),
});
export type RetryOperationInput = z.infer<typeof retryOperationSchema>;

type Database = Pick<
  Prisma.TransactionClient,
  "jobExecution" | "jobExecutionAttempt" | "auditEvent" | "eventOutbox"
>;
export type OperationsDependencies = {
  getActor: () => Promise<OperationsActor | null>;
  database: Database;
  transaction: <T>(work: (database: Database) => Promise<T>) => Promise<T>;
  now: () => Date;
  createId: () => string;
};
export async function createOperationsDependencies(): Promise<OperationsDependencies> {
  const { prisma } = await import("@/server/database/prisma");
  const { getAuthenticatedAppUserResult } = await import("@/server/auth/session");
  return {
    database: prisma,
    transaction: (work) => prisma.$transaction(work),
    now: () => new Date(),
    createId: randomUUID,
    getActor: async () => {
      const result = await getAuthenticatedAppUserResult();
      return result.status === "active" ? result.user : null;
    },
  };
}
async function actorForOperations(dependencies: OperationsDependencies): Promise<OperationsActor> {
  const actor = await dependencies.getActor();
  if (
    !actor ||
    actor.status !== "ACTIVE" ||
    !["BTLS_ADMIN", "BTLS_OPERATOR"].includes(actor.platformRole ?? "")
  ) {
    throw new OperationsAccessError();
  }
  return actor;
}
export function operationScope(actor: OperationsActor): Prisma.JobExecutionWhereInput {
  return {
    property: {
      status: "ACTIVE",
      account: { status: "ACTIVE" },
      ...(actor.platformRole === "BTLS_ADMIN"
        ? {}
        : {
            propertyAccesses: {
              some: {
                membership: { userId: actor.id, status: "ACTIVE" },
              },
            },
          }),
    },
  };
}
export function retryEligibility(
  job: OperationJob,
  actor: OperationsActor,
): { allowed: boolean; explanation: string } {
  if (actor.platformRole !== "BTLS_ADMIN")
    return { allowed: false, explanation: "Only BTLS Admin can request a retry." };
  if (job.status !== "FAILED")
    return {
      allowed: false,
      explanation:
        "Only a completed failure can be retried. Queued or running work must finish first.",
    };
  // This allowlist grows only as implemented handlers establish their safe replay contracts.
  const payloadSchema =
    job.jobType === "infrastructure.contextual_proof"
      ? contextualProofJobPayloadSchema
      : job.jobType === "storage.media_cleanup"
        ? mediaCleanupJobPayloadSchema
        : null;
  if (!payloadSchema || job.jobVersion !== 1) {
    return { allowed: false, explanation: "This job has no approved manual retry handler." };
  }
  if (
    !["RETRYABLE_FAILURE", "INTERRUPTED_EXECUTION"].includes(job.failureCategory ?? "") ||
    job.attempts[0]?.status !== "FAILED"
  ) {
    return {
      allowed: false,
      explanation: "This failure needs investigation before it can be retried.",
    };
  }
  const payload = payloadSchema.safeParse(job.safePayload);
  if (
    !payload.success ||
    payload.data.propertyId !== job.propertyId ||
    payload.data.correlationId !== job.correlationId ||
    payload.data.idempotencyKey !== job.idempotencyKey
  ) {
    return {
      allowed: false,
      explanation: "The execution context is invalid and cannot be replayed.",
    };
  }
  return {
    allowed: true,
    explanation:
      "Retry the same operation once. Its original duplicate protection remains in place.",
  };
}
export function operationFailureSummary(category: string | null): string {
  switch (category) {
    case "RETRYABLE_FAILURE":
      return "The operation could not finish. A safe retry may be available.";
    case "PERMANENT_FAILURE":
      return "The operation cannot be retried without investigation.";
    case "INTERRUPTED_EXECUTION":
      return "The worker stopped before recording an outcome.";
    case null:
      return "No failure recorded.";
    default:
      return "An unclassified failure needs investigation.";
  }
}
function toSummary(job: OperationJob) {
  return {
    id: job.id,
    propertyId: job.propertyId,
    propertyName: job.property.name,
    label:
      job.jobType === "infrastructure.contextual_proof"
        ? "Background operation proof"
        : job.jobType === "infrastructure.test_job"
          ? "Infrastructure test"
          : "Background operation",
    status: job.status,
    correlationId: job.correlationId,
    createdAt: job.createdAt,
    failedAt: job.failedAt,
    attemptCount: job._count.attempts,
    failureSummary: operationFailureSummary(job.failureCategory),
  };
}
export type OperationSummary = ReturnType<typeof toSummary>;
export async function listOperations(
  input: unknown,
  providedDependencies?: OperationsDependencies,
) {
  const dependencies = providedDependencies ?? (await createOperationsDependencies());
  const actor = await actorForOperations(dependencies);
  const filters = operationsFiltersSchema.parse(input);
  const where: Prisma.JobExecutionWhereInput = {
    ...operationScope(actor),
    ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
    ...(filters.correlationId ? { correlationId: filters.correlationId } : {}),
    ...(filters.status === "ALL"
      ? {}
      : {
          status:
            filters.status === "ATTENTION" ? { in: ["FAILED", "RETRY_SCHEDULED"] } : filters.status,
        }),
  };
  const total = await dependencies.database.jobExecution.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const page = Math.min(filters.page, totalPages);
  const jobs = await dependencies.database.jobExecution.findMany({
    where,
    include: jobInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * 20,
    take: 20,
  });
  return { jobs: jobs.map(toSummary), filters: { ...filters, page }, total, totalPages };
}
export async function getOperation(
  input: { jobExecutionId: string; attemptPage?: number },
  providedDependencies?: OperationsDependencies,
) {
  const dependencies = providedDependencies ?? (await createOperationsDependencies());
  const actor = await actorForOperations(dependencies);
  const id = z.string().uuid().parse(input.jobExecutionId);
  const attemptPage = z
    .number()
    .int()
    .min(1)
    .max(100000)
    .parse(input.attemptPage ?? 1);
  const job = await dependencies.database.jobExecution.findFirst({
    where: { id, ...operationScope(actor) },
    include: jobInclude,
  });
  if (!job) throw new OperationsAccessError();
  const totalPages = Math.max(1, Math.ceil(job._count.attempts / 20));
  const page = Math.min(attemptPage, totalPages);
  const attempts = await dependencies.database.jobExecutionAttempt.findMany({
    where: { jobExecutionId: id, jobExecution: operationScope(actor) },
    orderBy: { attemptNumber: "desc" },
    skip: (page - 1) * 20,
    take: 20,
  });
  const dispatch = await dependencies.database.eventOutbox.findFirst({
    where: {
      propertyId: job.propertyId,
      eventName: "operations.job.retry_requested",
      payload: { path: ["jobExecutionId"], equals: job.id },
    },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });
  return {
    retryDelivery:
      job.status === "RETRY_SCHEDULED" && dispatch
        ? dispatch.status === "DISPATCHED"
          ? "The retry was delivered to the worker."
          : dispatch.status === "FAILED"
            ? "Retry delivery failed. The durable request remains queued for recovery."
            : "Retry delivery is pending. The durable request is saved."
        : null,
    ...toSummary(job),
    retry: retryEligibility(job, actor),
    failedAttemptId: job.attempts[0]?.id ?? null,
    attemptPage: page,
    attemptTotalPages: totalPages,
    attempts: attempts.map((attempt: JobExecutionAttempt) => ({
      id: attempt.id,
      number: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
      summary: operationFailureSummary(attempt.failureCategory),
    })),
  };
}
export type OperationDetail = Awaited<ReturnType<typeof getOperation>>;
export type OperationsPage = Awaited<ReturnType<typeof listOperations>>;

export async function requestOperationRetry(
  input: unknown,
  providedDependencies?: OperationsDependencies,
): Promise<void> {
  const dependencies = providedDependencies ?? (await createOperationsDependencies());
  const actor = await actorForOperations(dependencies);
  if (actor.platformRole !== "BTLS_ADMIN") throw new OperationsAccessError();
  const parsed = retryOperationSchema.parse(input);
  await dependencies.transaction(async (database) => {
    const job = await database.jobExecution.findFirst({
      where: {
        id: parsed.jobExecutionId,
        propertyId: parsed.propertyId,
        ...operationScope(actor),
      },
      include: jobInclude,
    });
    if (!job) throw new OperationsAccessError();
    if (!retryEligibility(job, actor).allowed || job.attempts[0]?.id !== parsed.failedAttemptId)
      throw new RetryDeniedError();
    const requestedAt = dependencies.now();
    const claim = await database.jobExecution.updateMany({
      where: {
        id: job.id,
        propertyId: job.propertyId,
        status: "FAILED",
        ...operationScope(actor),
        attempts: { none: { attemptNumber: { gt: job.attempts[0].attemptNumber } } },
      },
      data: { status: "RETRY_SCHEDULED", retryRequestedAt: requestedAt, finishedAt: null },
    });
    if (claim.count !== 1) throw new RetryDeniedError();
    await database.auditEvent.create({
      data: {
        actorId: actor.id,
        accountId: job.property.accountId,
        propertyId: job.propertyId,
        action: "job_execution.retry_requested",
        subjectType: "JobExecution",
        subjectId: job.id,
        metadata: {
          reason: parsed.reason,
          failedAttemptId: parsed.failedAttemptId,
          correlationId: job.correlationId,
        },
      },
    });
    const eventId = dependencies.createId();
    await createEventOutboxEntry(
      {
        name: "operations.job.retry_requested",
        version: 1,
        eventId,
        propertyId: job.propertyId,
        correlationId: job.correlationId,
        occurredAt: requestedAt,
        jobExecutionId: job.id,
        failedAttemptId: parsed.failedAttemptId,
      },
      {
        eventOutbox:
          database.eventOutbox as unknown as import("@/server/events/event-outbox").EventOutboxRepository,
        now: dependencies.now,
      },
    );
  });
}
