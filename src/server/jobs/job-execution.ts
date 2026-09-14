import "server-only";

import {
  parseRegisteredJobPayload,
  registeredJobPayloadSchemas,
  type JobExecutionOrigin,
  type RegisteredJobType,
} from "@/server/jobs/job-contracts";

export type JobExecutionStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "RETRY_SCHEDULED";
export type JobExecutionAttemptStatus = "STARTED" | "SUCCEEDED" | "FAILED";

export type JobExecutionRecord = {
  id: string;
  propertyId: string;
  jobType: string;
  jobVersion: number;
  origin: JobExecutionOrigin;
  status: JobExecutionStatus;
  correlationId: string;
  idempotencyKey: string;
  safePayload: unknown;
  retryRequestedAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  failureCategory: string | null;
  failureMessage: string | null;
  failedAt: Date | null;
};

export type JobExecutionAttemptRecord = {
  id: string;
  jobExecutionId: string;
  attemptNumber: number;
  status: JobExecutionAttemptStatus;
  providerRunId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  failureCategory: string | null;
  failureMessage: string | null;
};

export type JobExecutionRepository = {
  create: (input: { data: Record<string, unknown> }) => Promise<JobExecutionRecord>;
  findFirst: (input: { where: Record<string, unknown> }) => Promise<JobExecutionRecord | null>;
  findMany: (input: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc" | "desc">;
    take: number;
  }) => Promise<JobExecutionRecord[]>;
  updateMany: (input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

export type JobExecutionAttemptRepository = {
  create: (input: { data: Record<string, unknown> }) => Promise<JobExecutionAttemptRecord>;
  findMany: (input: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc" | "desc">;
    take: number;
  }) => Promise<JobExecutionAttemptRecord[]>;
  updateMany: (input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

export type JobExecutionRepositories = {
  jobExecution: JobExecutionRepository;
  jobExecutionAttempt: JobExecutionAttemptRepository;
};

export type JobExecutionDependencies = JobExecutionRepositories & {
  now: () => Date;
  transaction: <Result>(
    operation: (repositories: JobExecutionRepositories) => Promise<Result>,
  ) => Promise<Result>;
};

export function createPrismaJobExecutionDependencies(): JobExecutionDependencies {
  const jobExecution = new Proxy({} as JobExecutionRepository, {
    get(_target, method) {
      return async (...argumentsList: unknown[]) => {
        const { prisma } = await import("@/server/database/prisma");
        const delegate = prisma.jobExecution as unknown as Record<
          string,
          (...args: unknown[]) => unknown
        >;
        return delegate[String(method)](...argumentsList);
      };
    },
  });
  const jobExecutionAttempt = new Proxy({} as JobExecutionAttemptRepository, {
    get(_target, method) {
      return async (...argumentsList: unknown[]) => {
        const { prisma } = await import("@/server/database/prisma");
        const delegate = prisma.jobExecutionAttempt as unknown as Record<
          string,
          (...args: unknown[]) => unknown
        >;
        return delegate[String(method)](...argumentsList);
      };
    },
  });

  return {
    jobExecution,
    jobExecutionAttempt,
    now: () => new Date(),
    transaction: async (operation) => {
      const { prisma } = await import("@/server/database/prisma");
      return prisma.$transaction((database) =>
        operation({
          jobExecution: database.jobExecution as unknown as JobExecutionRepository,
          jobExecutionAttempt:
            database.jobExecutionAttempt as unknown as JobExecutionAttemptRepository,
        }),
      );
    },
  };
}

export type JobHandler = (input: {
  jobExecution: JobExecutionRecord;
  payload: unknown;
}) => Promise<void>;

export class RetryableJobExecutionError extends Error {
  constructor(message = "The job can be retried safely.") {
    super(message);
    this.name = "RetryableJobExecutionError";
  }
}

export class PermanentJobExecutionError extends Error {
  constructor(message = "The job cannot be retried.") {
    super(message);
    this.name = "PermanentJobExecutionError";
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function failureDetails(error: unknown) {
  if (error instanceof PermanentJobExecutionError) {
    return {
      category: "PERMANENT_FAILURE",
      message: "The job cannot be retried without investigation.",
      retryable: false,
    };
  }

  return {
    category: "RETRYABLE_FAILURE",
    message: "The job did not finish and can be retried safely.",
    retryable: true,
  };
}

const interruptedFailure = {
  category: "INTERRUPTED_EXECUTION",
  message: "The worker stopped before recording an outcome.",
} as const;

const defaultExecutionLeaseMs = 5 * 60 * 1000;

function leaseExpiry(startedAt: Date | null, observedAt: Date, leaseMs: number): Date {
  return startedAt ? new Date(startedAt.getTime() + leaseMs) : observedAt;
}

function registeredJobType(jobType: string): jobType is RegisteredJobType {
  return Object.hasOwn(registeredJobPayloadSchemas, jobType);
}

export async function enqueueJobExecution(
  input: {
    jobType: RegisteredJobType;
    origin: JobExecutionOrigin;
    payload: unknown;
  },
  dependencies: JobExecutionDependencies,
): Promise<{ created: boolean; record: JobExecutionRecord }> {
  const payload = parseRegisteredJobPayload(input.jobType, input.payload);

  try {
    const record = await dependencies.jobExecution.create({
      data: {
        propertyId: payload.propertyId,
        jobType: input.jobType,
        jobVersion: 1,
        origin: input.origin,
        correlationId: payload.correlationId,
        idempotencyKey: payload.idempotencyKey,
        safePayload: payload,
      },
    });
    return { created: true, record };
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;

    const record = await dependencies.jobExecution.findFirst({
      where: {
        propertyId: payload.propertyId,
        jobType: input.jobType,
        idempotencyKey: payload.idempotencyKey,
      },
    });
    if (!record) throw error;
    if (
      record.correlationId !== payload.correlationId ||
      JSON.stringify(parseRegisteredJobPayload(input.jobType, record.safePayload)) !==
        JSON.stringify(payload)
    ) {
      throw new PermanentJobExecutionError("The job idempotency key has conflicting context.");
    }

    return { created: false, record };
  }
}

export type JobExecutionOutcome =
  | { outcome: "SKIPPED_TERMINAL" }
  | { outcome: "SKIPPED_ACTIVE"; retryAt: Date }
  | { outcome: "SKIPPED_STALE"; attemptNumber: number }
  | { outcome: "SUCCEEDED"; attemptNumber: number }
  | { outcome: "RETRY_SCHEDULED" | "FAILED"; attemptNumber: number };

export async function executeJobExecution(
  input: {
    jobExecutionId: string;
    handlers: Partial<Record<RegisteredJobType, JobHandler>>;
    executionLeaseMs?: number;
    maximumAttempts?: number;
    providerRunId?: string;
  },
  dependencies: JobExecutionDependencies,
): Promise<JobExecutionOutcome> {
  const maximumAttempts = input.maximumAttempts ?? 3;
  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 1) {
    throw new Error("maximumAttempts must be a positive whole number.");
  }
  const executionLeaseMs = input.executionLeaseMs ?? defaultExecutionLeaseMs;
  if (!Number.isInteger(executionLeaseMs) || executionLeaseMs < 1) {
    throw new Error("executionLeaseMs must be a positive whole number.");
  }

  const existing = await dependencies.jobExecution.findFirst({
    where: { id: input.jobExecutionId },
  });
  if (!existing) {
    throw new PermanentJobExecutionError("The requested job execution does not exist.");
  }

  if (existing.status === "SUCCEEDED" || existing.status === "FAILED") {
    return { outcome: "SKIPPED_TERMINAL" };
  }

  if (existing.status === "RUNNING") {
    const observedAt = dependencies.now();
    const retryAt = leaseExpiry(existing.startedAt, observedAt, executionLeaseMs);
    if (retryAt > observedAt) {
      return { outcome: "SKIPPED_ACTIVE", retryAt };
    }

    const recovered = await dependencies.transaction(async (repositories) => {
      const recoveredAt = dependencies.now();
      const recovery = await repositories.jobExecution.updateMany({
        where: { id: existing.id, status: "RUNNING", startedAt: existing.startedAt },
        data: {
          status: "RETRY_SCHEDULED",
          retryRequestedAt: recoveredAt,
          failureCategory: interruptedFailure.category,
          failureMessage: interruptedFailure.message,
          failedAt: recoveredAt,
        },
      });
      if (recovery.count !== 1) return false;

      await repositories.jobExecutionAttempt.updateMany({
        where: { jobExecutionId: existing.id, status: "STARTED" },
        data: {
          status: "FAILED",
          finishedAt: recoveredAt,
          failureCategory: interruptedFailure.category,
          failureMessage: interruptedFailure.message,
        },
      });
      return true;
    });

    if (!recovered) {
      const current = await dependencies.jobExecution.findFirst({ where: { id: existing.id } });
      if (!current || current.status === "SUCCEEDED" || current.status === "FAILED") {
        return { outcome: "SKIPPED_TERMINAL" };
      }
      const currentObservedAt = dependencies.now();
      return {
        outcome: "SKIPPED_ACTIVE",
        retryAt: leaseExpiry(current.startedAt, currentObservedAt, executionLeaseMs),
      };
    }
  }

  const claimStartedAt = dependencies.now();
  const claim = await dependencies.transaction(async (repositories) => {
    const claimed = await repositories.jobExecution.updateMany({
      where: { id: existing.id, status: { in: ["QUEUED", "RETRY_SCHEDULED"] } },
      data: { status: "RUNNING", startedAt: claimStartedAt },
    });
    if (claimed.count !== 1) return null;

    const attempts = await repositories.jobExecutionAttempt.findMany({
      where: { jobExecutionId: existing.id },
      orderBy: { attemptNumber: "desc" },
      take: 1,
    });
    const latestAttemptNumber = attempts[0]?.attemptNumber ?? 0;
    if (latestAttemptNumber >= maximumAttempts) {
      await repositories.jobExecution.updateMany({
        where: { id: existing.id, status: "RUNNING", startedAt: claimStartedAt },
        data: {
          status: "FAILED",
          retryRequestedAt: null,
          finishedAt: claimStartedAt,
          failureCategory: interruptedFailure.category,
          failureMessage: interruptedFailure.message,
          failedAt: claimStartedAt,
        },
      });
      return { kind: "terminal", attemptNumber: latestAttemptNumber } as const;
    }

    const attempt = await repositories.jobExecutionAttempt.create({
      data: {
        jobExecutionId: existing.id,
        attemptNumber: latestAttemptNumber + 1,
        providerRunId: input.providerRunId,
      },
    });
    return { kind: "attempt", attempt } as const;
  });

  if (!claim) {
    const current = await dependencies.jobExecution.findFirst({ where: { id: existing.id } });
    if (!current || current.status === "SUCCEEDED" || current.status === "FAILED") {
      return { outcome: "SKIPPED_TERMINAL" };
    }
    const observedAt = dependencies.now();
    return {
      outcome: "SKIPPED_ACTIVE",
      retryAt: leaseExpiry(current.startedAt, observedAt, executionLeaseMs),
    };
  }
  if (claim.kind === "terminal") {
    return { outcome: "FAILED", attemptNumber: claim.attemptNumber };
  }

  const { attempt } = claim;
  const attemptNumber = attempt.attemptNumber;

  try {
    if (!registeredJobType(existing.jobType)) {
      throw new PermanentJobExecutionError("The job type is not registered.");
    }
    if (existing.jobVersion !== 1) {
      throw new PermanentJobExecutionError("The job version is not registered.");
    }
    const validation = registeredJobPayloadSchemas[existing.jobType].safeParse(
      existing.safePayload,
    );
    if (!validation.success) {
      throw new PermanentJobExecutionError("The job payload is invalid.");
    }
    const payload = validation.data;
    if (
      payload.propertyId !== existing.propertyId ||
      payload.correlationId !== existing.correlationId ||
      payload.idempotencyKey !== existing.idempotencyKey
    ) {
      throw new PermanentJobExecutionError("The job payload does not match its execution context.");
    }
    const handler = input.handlers[existing.jobType];
    if (!handler) {
      throw new PermanentJobExecutionError("The job handler is not registered.");
    }

    await handler({
      jobExecution: { ...existing, status: "RUNNING", startedAt: claimStartedAt },
      payload,
    });

    const completedAt = dependencies.now();
    const completed = await dependencies.transaction(async (repositories) => {
      const execution = await repositories.jobExecution.updateMany({
        where: { id: existing.id, status: "RUNNING", startedAt: claimStartedAt },
        data: {
          status: "SUCCEEDED",
          finishedAt: completedAt,
          failureCategory: null,
          failureMessage: null,
          failedAt: null,
        },
      });
      if (execution.count !== 1) return false;

      const attemptResult = await repositories.jobExecutionAttempt.updateMany({
        where: { id: attempt.id, status: "STARTED" },
        data: { status: "SUCCEEDED", finishedAt: completedAt },
      });
      if (attemptResult.count !== 1) {
        throw new Error("The claimed job attempt could not be finalized.");
      }
      return true;
    });
    if (!completed) return { outcome: "SKIPPED_STALE", attemptNumber };
    return { outcome: "SUCCEEDED", attemptNumber };
  } catch (error) {
    const failure = failureDetails(error);
    const terminal = !failure.retryable || attemptNumber >= maximumAttempts;
    const failedAt = dependencies.now();
    const persisted = await dependencies.transaction(async (repositories) => {
      const execution = await repositories.jobExecution.updateMany({
        where: { id: existing.id, status: "RUNNING", startedAt: claimStartedAt },
        data: {
          status: terminal ? "FAILED" : "RETRY_SCHEDULED",
          retryRequestedAt: terminal ? null : failedAt,
          finishedAt: terminal ? failedAt : null,
          failureCategory: failure.category,
          failureMessage: failure.message,
          failedAt,
        },
      });
      if (execution.count !== 1) return false;

      const attemptResult = await repositories.jobExecutionAttempt.updateMany({
        where: { id: attempt.id, status: "STARTED" },
        data: {
          status: "FAILED",
          finishedAt: failedAt,
          failureCategory: failure.category,
          failureMessage: failure.message,
        },
      });
      if (attemptResult.count !== 1) {
        throw new Error("The claimed job attempt could not record its failure.");
      }
      return true;
    });
    if (!persisted) return { outcome: "SKIPPED_STALE", attemptNumber };
    return { outcome: terminal ? "FAILED" : "RETRY_SCHEDULED", attemptNumber };
  }
}
