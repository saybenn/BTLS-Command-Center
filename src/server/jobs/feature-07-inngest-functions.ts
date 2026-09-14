import "server-only";

import { NonRetriableError, RetryAfterError } from "inngest";
import { z } from "zod";
import {
  dispatchPendingEventOutbox,
  type EventOutboxRepository,
} from "@/server/events/event-outbox";

import { parseRegisteredInternalEvent } from "@/server/events/internal-event-registry";
import {
  processInternalEventDispatch,
  runFeature07JobExecution,
  shouldRetryJobExecution,
} from "@/server/jobs/feature-07-job-workflows";
import { inngest } from "@/server/jobs/inngest";
import { createPrismaJobExecutionDependencies } from "@/server/jobs/job-execution";
import { scheduleMediaCleanupJobs } from "@/server/jobs/media-cleanup-job";
import { logger } from "@/server/observability/logger";
import { captureOperationalException } from "@/server/observability/sentry";

export const internalEventOutboxDispatchFunction = inngest.createFunction(
  {
    id: "feature-07-internal-event-outbox-dispatch",
    retries: 3,
    triggers: { event: "btls/event-outbox.dispatch" },
  },
  async ({ event, step }) => {
    const data = z.object({ eventOutboxId: z.string().uuid() }).parse(event.data);
    // The durable row is authoritative; transport payloads cannot forge retry context.
    const { prisma } = await import("@/server/database/prisma");
    const outbox = await prisma.eventOutbox.findUnique({ where: { id: data.eventOutboxId } });
    if (!outbox) throw new NonRetriableError("The outbox entry is unavailable.");
    const internalEvent = parseRegisteredInternalEvent(outbox.payload);
    if (
      internalEvent.propertyId !== outbox.propertyId ||
      internalEvent.correlationId !== outbox.correlationId ||
      internalEvent.eventId !== outbox.eventId ||
      internalEvent.name !== outbox.eventName ||
      internalEvent.version !== outbox.eventVersion
    ) {
      throw new NonRetriableError("The outbox context is invalid.");
    }
    const job = await processInternalEventDispatch(
      internalEvent,
      createPrismaJobExecutionDependencies(),
    );

    await step.sendEvent("dispatch-job-execution", {
      name: "btls/job-execution.requested",
      data: {
        jobExecutionId: job.record.id,
        maximumAttempts: "maximumAttempts" in job ? job.maximumAttempts : undefined,
      },
    });

    return { eventOutboxId: data.eventOutboxId, jobExecutionId: job.record.id };
  },
);

export function requireJobExecutionContinuation(
  outcome: Awaited<ReturnType<typeof runFeature07JobExecution>>,
): void {
  if (outcome.outcome === "SKIPPED_ACTIVE") {
    throw new RetryAfterError(
      "Another worker still owns the job execution lease.",
      outcome.retryAt,
    );
  }
  if (shouldRetryJobExecution(outcome)) {
    throw new Error("The job execution is scheduled for a safe retry.");
  }
}

export const jobExecutionFunction = inngest.createFunction(
  {
    id: "feature-07-job-execution",
    retries: 3,
    triggers: { event: "btls/job-execution.requested" },
  },
  async ({ event, runId }) => {
    const parsed = z
      .object({
        jobExecutionId: z.string().uuid(),
        maximumAttempts: z.number().int().positive().max(1000000).optional(),
      })
      .safeParse(event.data);
    if (!parsed.success) {
      throw new NonRetriableError("The job execution request is invalid.");
    }

    const outcome = await runFeature07JobExecution(
      parsed.data.jobExecutionId,
      createPrismaJobExecutionDependencies(),
      {
        providerRunId: runId,
        maximumAttempts: parsed.data.maximumAttempts,
      },
    );
    requireJobExecutionContinuation(outcome);
    return outcome;
  },
);

// Recovery of committed dispatch requests is part of retry delivery, not media scheduling.
export const pendingOutboxDispatchFunction = inngest.createFunction(
  {
    id: "feature-07-pending-outbox-dispatch",
    retries: 3,
    triggers: [{ cron: "* * * * *" }],
  },
  async () => {
    const { prisma } = await import("@/server/database/prisma");
    const results = await dispatchPendingEventOutbox(
      { send: (event) => inngest.send(event) },
      {
        eventOutbox: prisma.eventOutbox as unknown as EventOutboxRepository,
        now: () => new Date(),
      },
    );
    if (
      results.some(
        (result) => result.outcome === "FAILED" && result.failureCategory !== "UNSUPPORTED_EVENT",
      )
    ) {
      throw new Error("Outbox delivery remains pending; the next run can recover it safely.");
    }
    return results;
  },
);

export const scheduledMediaCleanupFunction = inngest.createFunction(
  {
    id: "feature-07-scheduled-media-cleanup",
    concurrency: { limit: 1 },
    retries: 3,
    triggers: [{ cron: "TZ=UTC 17 3 * * *", jitter: "5m" }],
  },
  async ({ event, step }) => {
    try {
      const scheduleKey = new Date(event.ts).toISOString().slice(0, 10);
      const scheduled = await step.run("schedule-bounded-media-cleanup", () =>
        scheduleMediaCleanupJobs({ scheduleKey }),
      );
      if (scheduled.jobs.length > 0) {
        await step.sendEvent(
          "dispatch-media-cleanup-jobs",
          scheduled.jobs.map((job) => ({
            name: "btls/job-execution.requested",
            data: { jobExecutionId: job.jobExecutionId },
          })),
        );
      }
      const summary = {
        discovered: scheduled.discovered,
        created: scheduled.jobs.filter((job) => job.created).length,
        reused: scheduled.jobs.filter((job) => !job.created).length,
      };
      logger.info(
        {
          feature: "07",
          operation: "schedule_media_cleanup",
          outcome: "completed",
          ...summary,
        },
        "Scheduled media cleanup scan completed",
      );
      return summary;
    } catch (error) {
      logger.error(
        {
          feature: "07",
          operation: "schedule_media_cleanup",
          outcome: "failed",
          failureCategory: "MEDIA_CLEANUP_SCHEDULING_FAILED",
        },
        "Scheduled media cleanup scan failed",
      );
      captureOperationalException(error, {
        feature: "07",
        operation: "schedule_media_cleanup",
        outcome: "failed",
        failureCategory: "MEDIA_CLEANUP_SCHEDULING_FAILED",
      });
      throw error;
    }
  },
);

export const feature07InngestFunctions = [
  pendingOutboxDispatchFunction,
  internalEventOutboxDispatchFunction,
  jobExecutionFunction,
  scheduledMediaCleanupFunction,
];
