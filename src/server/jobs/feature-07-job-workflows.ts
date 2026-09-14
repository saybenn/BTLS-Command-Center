import "server-only";

import {
  parseRegisteredInternalEvent,
  type RegisteredInternalEvent,
} from "@/server/events/internal-event-registry";
import {
  createEventOutboxEntry,
  dispatchPendingEventOutbox,
  type EventOutboxDependencies,
  type InternalEventDispatchTarget,
} from "@/server/events/event-outbox";
import {
  enqueueJobExecution,
  executeJobExecution,
  type JobExecutionDependencies,
  RetryableJobExecutionError,
} from "@/server/jobs/job-execution";
import {
  contextualProofJobPayloadSchema,
  mediaCleanupJobPayloadSchema,
  type ContextualProofJobPayload,
  type InfrastructureTestJobPayload,
  type RegisteredJobType,
} from "@/server/jobs/job-contracts";
import {
  MediaCleanupJobRetryableError,
  runScheduledMediaCleanupJob,
  type MediaCleanupExecutionDependencies,
} from "@/server/jobs/media-cleanup-job";
import { logger } from "@/server/observability/logger";
import { captureOperationalException } from "@/server/observability/sentry";

import {
  createNotification,
  type NotificationDependencies,
} from "@/server/notifications/notifications";

export function jobRequestForInternalEvent(event: RegisteredInternalEvent): {
  jobType: RegisteredJobType;
  origin: "SYSTEM";
  payload: InfrastructureTestJobPayload | ContextualProofJobPayload;
} {
  switch (event.name) {
    case "operations.job.retry_requested":
      throw new Error("A retry dispatch must reuse the existing execution.");
    case "infrastructure.test_event.completed":
      if (event.version === 2)
        return {
          jobType: "infrastructure.contextual_proof",
          origin: "SYSTEM",
          payload: {
            propertyId: event.propertyId,
            correlationId: event.correlationId,
            eventId: event.eventId,
            idempotencyKey: "event:" + event.eventId,
            source: event.source,
            recipientUserId: event.recipientUserId,
            subject: event.subject,
          },
        };
      return {
        jobType: "infrastructure.test_job",
        origin: "SYSTEM",
        payload: {
          propertyId: event.propertyId,
          correlationId: event.correlationId,
          eventId: event.eventId,
          idempotencyKey: "event:" + event.eventId,
          subject: event.subject,
        },
      };
  }
}

export async function persistAndDispatchInternalEvent(
  input: unknown,
  target: InternalEventDispatchTarget,
  dependencies: EventOutboxDependencies,
) {
  const outbox = await createEventOutboxEntry(input, dependencies);
  const dispatches = await dispatchPendingEventOutbox(target, dependencies, {
    limit: 1,
    eventOutboxId: outbox.record.id,
  });
  return { outbox, dispatch: dispatches.find((entry) => entry.eventOutboxId === outbox.record.id) };
}

export async function processInternalEventDispatch(
  event: RegisteredInternalEvent,
  dependencies: JobExecutionDependencies,
) {
  const parsed = parseRegisteredInternalEvent(event);
  if (parsed.name === "operations.job.retry_requested") {
    const record = await dependencies.jobExecution.findFirst({
      where: {
        id: parsed.jobExecutionId,
        propertyId: parsed.propertyId,
        correlationId: parsed.correlationId,
      },
    });
    if (!record) throw new Error("The retried execution is unavailable.");
    const [failedAttempt] = await dependencies.jobExecutionAttempt.findMany({
      where: { id: parsed.failedAttemptId, jobExecutionId: record.id, status: "FAILED" },
      orderBy: { attemptNumber: "desc" },
      take: 1,
    });
    if (!failedAttempt) throw new Error("The retried failure is unavailable.");
    return { created: false, record, maximumAttempts: failedAttempt.attemptNumber + 1 };
  }
  return enqueueJobExecution(jobRequestForInternalEvent(parsed), dependencies);
}

export function createFeature07JobHandlers(input: {
  mediaCleanupDependencies?: MediaCleanupExecutionDependencies;
  notificationDependencies?: NotificationDependencies;
  onInfrastructureTestJob?: (payload: InfrastructureTestJobPayload) => Promise<void>;
}) {
  return {
    "infrastructure.contextual_proof": async ({ payload }: { payload: unknown }): Promise<void> => {
      const parsed = contextualProofJobPayloadSchema.parse(payload);
      await createNotification(
        {
          propertyId: parsed.propertyId,
          recipientUserId: parsed.recipientUserId,
          source: parsed.source,
          correlationId: parsed.correlationId,
          type: "infrastructure.proof.completed",
          subject: parsed.subject,
          title: "Background operation completed",
          body: "The test operation completed for this property.",
          deduplicationKey: `infrastructure.proof:${parsed.eventId}`,
        },
        input.notificationDependencies,
      );
    },
    "infrastructure.test_job": async ({ payload }: { payload: unknown }): Promise<void> => {
      await input.onInfrastructureTestJob?.(payload as InfrastructureTestJobPayload);
    },
    "storage.media_cleanup": async ({
      jobExecution,
      payload,
    }: {
      jobExecution: { id: string };
      payload: unknown;
    }): Promise<void> => {
      const parsed = mediaCleanupJobPayloadSchema.parse(payload);
      try {
        const outcome = await runScheduledMediaCleanupJob(parsed, input.mediaCleanupDependencies);
        logger.info(
          {
            feature: "07",
            operation: "media_cleanup",
            outcome,
            propertyId: parsed.propertyId,
            correlationId: parsed.correlationId,
            jobExecutionId: jobExecution.id,
            mediaAssetId: parsed.mediaAssetId,
          },
          "Scheduled media cleanup job completed",
        );
      } catch (error) {
        logger.error(
          {
            feature: "07",
            operation: "media_cleanup",
            outcome: "failed",
            failureCategory:
              error instanceof MediaCleanupJobRetryableError
                ? error.failureCategory
                : error instanceof RetryableJobExecutionError
                  ? "MEDIA_CLEANUP_RETRYABLE_FAILURE"
                  : "MEDIA_CLEANUP_EXECUTION_FAILED",
            propertyId: parsed.propertyId,
            correlationId: parsed.correlationId,
            jobExecutionId: jobExecution.id,
            mediaAssetId: parsed.mediaAssetId,
          },
          "Scheduled media cleanup job failed",
        );
        captureOperationalException(error, {
          feature: "07",
          operation: "media_cleanup",
          outcome: "failed",
          failureCategory:
            error instanceof MediaCleanupJobRetryableError
              ? error.failureCategory
              : error instanceof RetryableJobExecutionError
                ? "MEDIA_CLEANUP_RETRYABLE_FAILURE"
                : "MEDIA_CLEANUP_EXECUTION_FAILED",
          propertyId: parsed.propertyId,
          correlationId: parsed.correlationId,
          jobExecutionId: jobExecution.id,
          mediaAssetId: parsed.mediaAssetId,
        });
        throw error;
      }
    },
  } satisfies Partial<
    Record<RegisteredJobType, (input: { jobExecution: never; payload: unknown }) => Promise<void>>
  >;
}

export async function runFeature07JobExecution(
  jobExecutionId: string,
  dependencies: JobExecutionDependencies,
  input: {
    mediaCleanupDependencies?: MediaCleanupExecutionDependencies;
    notificationDependencies?: NotificationDependencies;
    onInfrastructureTestJob?: (payload: InfrastructureTestJobPayload) => Promise<void>;
    providerRunId?: string;
    maximumAttempts?: number;
    executionLeaseMs?: number;
  } = {},
) {
  return executeJobExecution(
    {
      jobExecutionId,
      handlers: createFeature07JobHandlers(input),
      providerRunId: input.providerRunId,
      maximumAttempts: input.maximumAttempts,
      executionLeaseMs: input.executionLeaseMs,
    },
    dependencies,
  );
}

export function shouldRetryJobExecution(
  outcome: Awaited<ReturnType<typeof runFeature07JobExecution>>,
): boolean {
  return outcome.outcome === "RETRY_SCHEDULED";
}

export { RetryableJobExecutionError };
