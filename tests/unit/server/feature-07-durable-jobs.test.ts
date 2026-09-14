import {
  createNotificationFixture,
  notificationIds,
} from "../../fixtures/feature-07-notifications";
import { resolvePropertyNotificationDestination } from "@/server/notifications/notifications";
import { notificationContext } from "../../fixtures/feature-07-notifications";
import { RetryAfterError } from "inngest";
import { describe, expect, it, vi } from "vitest";

import type { RegisteredInternalEvent } from "@/server/events/internal-event-registry";

import {
  createEventOutboxEntry,
  dispatchPendingEventOutbox,
  type EventOutboxDependencies,
  type EventOutboxRecord,
} from "@/server/events/event-outbox";
import {
  processInternalEventDispatch,
  persistAndDispatchInternalEvent,
  runFeature07JobExecution,
} from "@/server/jobs/feature-07-job-workflows";
import { requireJobExecutionContinuation } from "@/server/jobs/feature-07-inngest-functions";
import {
  RetryableJobExecutionError,
  type JobExecutionDependencies,
  type JobExecutionRecord,
  type JobExecutionAttemptRecord,
} from "@/server/jobs/job-execution";

const ids = {
  correlation: "00000000-0000-4000-8000-000000000001",
  event: "00000000-0000-4000-8000-000000000002",
  outbox: "00000000-0000-4000-8000-000000000003",
  property: "00000000-0000-4000-8000-000000000004",
  subject: "00000000-0000-4000-8000-000000000005",
};

const now = new Date("2026-09-07T13:00:00.000Z");

function matches(where: Record<string, unknown>, row: Record<string, unknown>): boolean {
  return Object.entries(where).every(([key, expected]) => {
    if (key === "OR" && Array.isArray(expected))
      return expected.some((condition) => matches(condition, row));
    const actual = row[key];
    if (typeof expected === "object" && expected !== null && "not" in expected)
      return actual !== expected.not;
    if (typeof expected === "object" && expected !== null && "in" in expected) {
      return (expected as { in: unknown[] }).in.includes(actual);
    }
    if (typeof expected === "object" && expected !== null && "lte" in expected) {
      return actual instanceof Date && actual <= (expected as { lte: Date }).lte;
    }
    return actual === expected;
  });
}

function eventFixture(overrides: Record<string, unknown> = {}): RegisteredInternalEvent {
  return {
    name: "infrastructure.test_event.completed",
    version: 1,
    propertyId: ids.property,
    eventId: ids.event,
    correlationId: ids.correlation,
    occurredAt: now,
    subject: { type: "Feature07Proof", id: ids.subject },
    ...overrides,
  };
}

function createEventOutboxFixture() {
  const records: EventOutboxRecord[] = [];
  let nextId = 0;
  const dependencies: EventOutboxDependencies = {
    eventOutbox: {
      async create({ data }) {
        if (records.some((record) => record.eventId === data.eventId)) {
          throw Object.assign(new Error("duplicate"), { code: "P2002" });
        }
        const record: EventOutboxRecord = {
          id: nextId++ === 0 ? ids.outbox : "00000000-0000-4000-8000-00000000000" + (nextId + 3),
          propertyId: data.propertyId as string,
          eventId: data.eventId as string,
          eventName: data.eventName as string,
          eventVersion: data.eventVersion as number,
          correlationId: data.correlationId as string,
          deduplicationKey: data.deduplicationKey as string,
          payload: data.payload,
          status: "PENDING",
          dispatchedAt: null,
          failureCategory: null,
          failureAt: null,
          createdAt: now,
        };
        records.push(record);
        return record;
      },
      async findFirst({ where }) {
        return (
          records.find((record) => matches(where, record as unknown as Record<string, unknown>)) ??
          null
        );
      },
      async findMany({ where, take }) {
        return records
          .filter((record) => matches(where, record as unknown as Record<string, unknown>))
          .slice(0, take);
      },
      async updateMany({ where, data }) {
        const matching = records.filter((record) =>
          matches(where, record as unknown as Record<string, unknown>),
        );
        for (const record of matching) Object.assign(record, data);
        return { count: matching.length };
      },
    },
    now: () => now,
  };
  return { dependencies, records };
}

function createJobExecutionFixture() {
  const jobs: JobExecutionRecord[] = [];
  const attempts: JobExecutionAttemptRecord[] = [];
  let nextJob = 10;
  let nextAttempt = 20;
  let currentNow = now;
  const dependencies: JobExecutionDependencies = {
    jobExecution: {
      async create({ data }) {
        if (
          jobs.some(
            (job) =>
              job.propertyId === data.propertyId &&
              job.jobType === data.jobType &&
              job.idempotencyKey === data.idempotencyKey,
          )
        ) {
          throw Object.assign(new Error("duplicate"), { code: "P2002" });
        }
        const record: JobExecutionRecord = {
          id: "00000000-0000-4000-8000-0000000000" + nextJob++,
          propertyId: data.propertyId as string,
          jobType: data.jobType as string,
          jobVersion: data.jobVersion as number,
          origin: data.origin as JobExecutionRecord["origin"],
          status: "QUEUED",
          correlationId: data.correlationId as string,
          idempotencyKey: data.idempotencyKey as string,
          safePayload: data.safePayload,
          retryRequestedAt: null,
          startedAt: null,
          finishedAt: null,
          failureCategory: null,
          failureMessage: null,
          failedAt: null,
        };
        jobs.push(record);
        return record;
      },
      async findFirst({ where }) {
        return (
          jobs.find((job) => matches(where, job as unknown as Record<string, unknown>)) ?? null
        );
      },
      async findMany({ where, take }) {
        return jobs
          .filter((job) => matches(where, job as unknown as Record<string, unknown>))
          .slice(0, take);
      },
      async updateMany({ where, data }) {
        const matching = jobs.filter((job) =>
          matches(where, job as unknown as Record<string, unknown>),
        );
        for (const job of matching) Object.assign(job, data);
        return { count: matching.length };
      },
    },
    jobExecutionAttempt: {
      async create({ data }) {
        const attempt: JobExecutionAttemptRecord = {
          id: "00000000-0000-4000-8000-0000000000" + nextAttempt++,
          jobExecutionId: data.jobExecutionId as string,
          attemptNumber: data.attemptNumber as number,
          providerRunId: (data.providerRunId as string | undefined) ?? null,
          status: "STARTED",
          startedAt: currentNow,
          finishedAt: null,
          failureCategory: null,
          failureMessage: null,
        };
        attempts.push(attempt);
        return attempt;
      },
      async findMany({ where, take }) {
        return attempts
          .filter((attempt) => matches(where, attempt as unknown as Record<string, unknown>))
          .sort((left, right) => right.attemptNumber - left.attemptNumber)
          .slice(0, take);
      },
      async updateMany({ where, data }) {
        const matching = attempts.filter((attempt) =>
          matches(where, attempt as unknown as Record<string, unknown>),
        );
        for (const attempt of matching) Object.assign(attempt, data);
        return { count: matching.length };
      },
    },
    now: () => currentNow,
    transaction: async (operation) => {
      const jobSnapshots = jobs.map((job) => ({ ...job }));
      const attemptSnapshots = attempts.map((attempt) => ({ ...attempt }));
      try {
        return await operation({
          jobExecution: dependencies.jobExecution,
          jobExecutionAttempt: dependencies.jobExecutionAttempt,
        });
      } catch (error) {
        jobs.splice(jobSnapshots.length);
        attempts.splice(attemptSnapshots.length);
        jobSnapshots.forEach((snapshot, index) => Object.assign(jobs[index]!, snapshot));
        attemptSnapshots.forEach((snapshot, index) => Object.assign(attempts[index]!, snapshot));
        throw error;
      }
    },
  };
  return {
    attempts,
    dependencies,
    jobs,
    setNow(value: Date) {
      currentNow = value;
    },
  };
}

describe("Feature 07 durable event and job proof", () => {
  it("dispatches the requested persisted event even when an older event is pending", async () => {
    const outbox = createEventOutboxFixture();
    await createEventOutboxEntry(eventFixture(), outbox.dependencies);
    const later = eventFixture({ eventId: "00000000-0000-4000-8000-000000000008" });
    const sent: string[] = [];
    const result = await persistAndDispatchInternalEvent(
      later,
      {
        async send(delivery) {
          sent.push(delivery.data.event.eventId);
        },
      },
      outbox.dependencies,
    );
    expect(sent).toEqual([later.eventId]);
    expect(result.dispatch?.outcome).toBe("DISPATCHED");
    expect(outbox.records[0].status).toBe("PENDING");
  });

  it("rejects reused event identifiers with another property's context", async () => {
    const outbox = createEventOutboxFixture();
    await createEventOutboxEntry(eventFixture(), outbox.dependencies);
    await expect(
      createEventOutboxEntry(
        eventFixture({ propertyId: notificationIds.property }),
        outbox.dependencies,
      ),
    ).rejects.toThrow("conflicting context");
  });

  it("replays interrupted dispatch and a post-notification failure without duplicating the contextual effect", async () => {
    const outbox = createEventOutboxFixture();
    const jobs = createJobExecutionFixture();
    const notices = createNotificationFixture();
    const event = eventFixture({
      version: 2,
      source: "infrastructure.proof",
      recipientUserId: notificationIds.user,
      propertyId: notificationIds.property,
      subject: { type: "property.overview", id: notificationIds.property },
    });
    await createEventOutboxEntry(event, outbox.dependencies);
    const sent: Array<{ data: { event: RegisteredInternalEvent } }> = [];
    let interrupted = true;
    const target = {
      async send(delivery: { data: { event: RegisteredInternalEvent } }) {
        sent.push(delivery);
        if (interrupted) {
          interrupted = false;
          throw new Error("Lost acknowledgement after acceptance");
        }
      },
    };
    await dispatchPendingEventOutbox(target, outbox.dependencies);
    await dispatchPendingEventOutbox(target, outbox.dependencies);
    expect(sent).toHaveLength(2);
    const first = await processInternalEventDispatch(sent[0].data.event, jobs.dependencies);
    const replay = await processInternalEventDispatch(sent[1].data.event, jobs.dependencies);
    expect(replay.record.id).toBe(first.record.id);
    const originalUpdate = jobs.dependencies.jobExecutionAttempt.updateMany;
    let failOnce = true;
    jobs.dependencies.jobExecutionAttempt.updateMany = async (input) => {
      if (input.data.status === "SUCCEEDED" && failOnce) {
        failOnce = false;
        throw new Error("Lost completion after effect");
      }
      return originalUpdate(input);
    };
    const options = { notificationDependencies: notices.dependencies };
    expect(
      (await runFeature07JobExecution(first.record.id, jobs.dependencies, options)).outcome,
    ).toBe("RETRY_SCHEDULED");
    expect(
      (await runFeature07JobExecution(first.record.id, jobs.dependencies, options)).outcome,
    ).toBe("SUCCEEDED");
    expect(
      (await runFeature07JobExecution(first.record.id, jobs.dependencies, options)).outcome,
    ).toBe("SKIPPED_TERMINAL");
    const effects = notices.records.filter((row) => row.source === "infrastructure.proof");
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({
      correlationId: event.correlationId,
      recipientUserId: notificationIds.user,
      propertyId: event.propertyId,
    });
    expect(jobs.attempts.map((attempt) => attempt.status)).toEqual(["FAILED", "SUCCEEDED"]);
    await expect(
      resolvePropertyNotificationDestination(
        notificationContext,
        { propertyId: event.propertyId, notificationId: effects[0].id },
        notices.dependencies,
      ),
    ).resolves.toBe(`/${event.propertyId}/overview`);
  });

  it("persists, dispatches, and executes one property-scoped proof job despite duplicate delivery", async () => {
    const outbox = createEventOutboxFixture();
    const jobs = createJobExecutionFixture();
    const sent: unknown[] = [];
    const target = {
      async send(event: unknown) {
        sent.push(event);
      },
    };

    const first = await createEventOutboxEntry(eventFixture(), outbox.dependencies);
    const duplicate = await createEventOutboxEntry(eventFixture(), outbox.dependencies);
    expect(first.created).toBe(true);
    expect(duplicate).toEqual({ created: false, record: first.record });

    await dispatchPendingEventOutbox(target, outbox.dependencies);
    const dispatchedEvent = sent[0] as {
      data: { event: ReturnType<typeof eventFixture> };
    };
    const firstJob = await processInternalEventDispatch(
      dispatchedEvent.data.event,
      jobs.dependencies,
    );
    const duplicateJob = await processInternalEventDispatch(
      dispatchedEvent.data.event,
      jobs.dependencies,
    );
    expect(firstJob.created).toBe(true);
    expect(duplicateJob).toEqual({ created: false, record: firstJob.record });

    const completed: string[] = [];
    const outcome = await runFeature07JobExecution(firstJob.record.id, jobs.dependencies, {
      onInfrastructureTestJob: async (payload) => {
        completed.push(payload.eventId);
      },
    });
    const repeatedOutcome = await runFeature07JobExecution(firstJob.record.id, jobs.dependencies, {
      onInfrastructureTestJob: async (payload) => {
        completed.push(payload.eventId);
      },
    });

    expect(outbox.records[0]).toMatchObject({ status: "DISPATCHED" });
    expect(outcome).toEqual({ outcome: "SUCCEEDED", attemptNumber: 1 });
    expect(repeatedOutcome).toEqual({ outcome: "SKIPPED_TERMINAL" });
    expect(completed).toEqual([ids.event]);
    expect(jobs.jobs[0]).toMatchObject({
      propertyId: ids.property,
      status: "SUCCEEDED",
      correlationId: ids.correlation,
    });
    expect(jobs.attempts).toMatchObject([{ attemptNumber: 1, status: "SUCCEEDED" }]);
  });

  it("records retryable, interrupted, and terminal failure states without hiding attempts", async () => {
    const jobs = createJobExecutionFixture();
    const event = eventFixture();
    const queued = await processInternalEventDispatch(event, jobs.dependencies);

    const retry = await runFeature07JobExecution(queued.record.id, jobs.dependencies, {
      onInfrastructureTestJob: async () => {
        throw new RetryableJobExecutionError("temporary provider outage");
      },
    });
    const recovered = await runFeature07JobExecution(queued.record.id, jobs.dependencies, {
      onInfrastructureTestJob: async () => undefined,
    });
    expect(retry).toEqual({ outcome: "RETRY_SCHEDULED", attemptNumber: 1 });
    expect(recovered).toEqual({ outcome: "SUCCEEDED", attemptNumber: 2 });

    const interrupted = await processInternalEventDispatch(
      eventFixture({ eventId: "00000000-0000-4000-8000-000000000006" }),
      jobs.dependencies,
    );
    Object.assign(interrupted.record, {
      status: "RUNNING",
      startedAt: new Date("2026-09-07T12:00:00.000Z"),
    });
    const recoveredInterrupted = await runFeature07JobExecution(
      interrupted.record.id,
      jobs.dependencies,
      {
        executionLeaseMs: 5 * 60 * 1000,
        onInfrastructureTestJob: async () => undefined,
      },
    );
    expect(recoveredInterrupted).toEqual({ outcome: "SUCCEEDED", attemptNumber: 1 });

    const terminal = await processInternalEventDispatch(
      eventFixture({ eventId: "00000000-0000-4000-8000-000000000007" }),
      jobs.dependencies,
    );
    const terminalOutcome = await runFeature07JobExecution(terminal.record.id, jobs.dependencies, {
      onInfrastructureTestJob: async () => {
        throw new RetryableJobExecutionError("still unavailable");
      },
    });
    await runFeature07JobExecution(terminal.record.id, jobs.dependencies, {
      onInfrastructureTestJob: async () => {
        throw new RetryableJobExecutionError("still unavailable");
      },
    });
    const terminalResult = await runFeature07JobExecution(terminal.record.id, jobs.dependencies, {
      onInfrastructureTestJob: async () => {
        throw new RetryableJobExecutionError("still unavailable");
      },
    });

    expect(terminalOutcome).toEqual({ outcome: "RETRY_SCHEDULED", attemptNumber: 1 });
    expect(terminalResult).toEqual({ outcome: "FAILED", attemptNumber: 3 });
    expect(jobs.jobs.find((job) => job.id === terminal.record.id)).toMatchObject({
      status: "FAILED",
      failureCategory: "RETRYABLE_FAILURE",
    });
    expect(
      jobs.attempts.filter((attempt) => attempt.jobExecutionId === terminal.record.id),
    ).toHaveLength(3);
  });

  it("defers an active lease, recovers it after expiry, and fences the late worker", async () => {
    const jobs = createJobExecutionFixture();
    const queued = await processInternalEventDispatch(eventFixture(), jobs.dependencies);
    let enterHandler!: () => void;
    let releaseHandler!: () => void;
    const entered = new Promise<void>((resolve) => {
      enterHandler = resolve;
    });
    const held = new Promise<void>((resolve) => {
      releaseHandler = resolve;
    });

    const originalWorker = runFeature07JobExecution(queued.record.id, jobs.dependencies, {
      executionLeaseMs: 5 * 60 * 1000,
      onInfrastructureTestJob: async () => {
        enterHandler();
        await held;
      },
    });
    await entered;

    jobs.setNow(new Date("2026-09-07T13:01:00.000Z"));
    const active = await runFeature07JobExecution(queued.record.id, jobs.dependencies, {
      executionLeaseMs: 5 * 60 * 1000,
      onInfrastructureTestJob: async () => undefined,
    });
    expect(active).toEqual({
      outcome: "SKIPPED_ACTIVE",
      retryAt: new Date("2026-09-07T13:05:00.000Z"),
    });
    expect(() => requireJobExecutionContinuation(active)).toThrow(RetryAfterError);

    jobs.setNow(new Date("2026-09-07T13:06:00.000Z"));
    await expect(
      runFeature07JobExecution(queued.record.id, jobs.dependencies, {
        executionLeaseMs: 5 * 60 * 1000,
        onInfrastructureTestJob: async () => undefined,
      }),
    ).resolves.toEqual({ outcome: "SUCCEEDED", attemptNumber: 2 });

    releaseHandler();
    await expect(originalWorker).resolves.toEqual({
      outcome: "SKIPPED_STALE",
      attemptNumber: 1,
    });
    expect(jobs.attempts).toMatchObject([
      {
        attemptNumber: 1,
        status: "FAILED",
        failureCategory: "INTERRUPTED_EXECUTION",
        finishedAt: new Date("2026-09-07T13:06:00.000Z"),
      },
      { attemptNumber: 2, status: "SUCCEEDED" },
    ]);
    expect(jobs.attempts.some((attempt) => attempt.status === "STARTED")).toBe(false);
    expect(queued.record.status).toBe("SUCCEEDED");
  });

  it("does not start another handler after an interrupted final attempt", async () => {
    const jobs = createJobExecutionFixture();
    const queued = await processInternalEventDispatch(eventFixture(), jobs.dependencies);
    for (const attemptNumber of [1, 2, 3]) {
      const attempt = await jobs.dependencies.jobExecutionAttempt.create({
        data: { jobExecutionId: queued.record.id, attemptNumber },
      });
      if (attemptNumber < 3) {
        Object.assign(attempt, {
          status: "FAILED",
          finishedAt: new Date("2026-09-07T12:00:00.000Z"),
          failureCategory: "RETRYABLE_FAILURE",
          failureMessage: "The job did not finish and can be retried safely.",
        });
      }
    }
    Object.assign(queued.record, {
      status: "RUNNING",
      startedAt: new Date("2026-09-07T12:00:00.000Z"),
    });
    const handler = vi.fn();

    await expect(
      runFeature07JobExecution(queued.record.id, jobs.dependencies, {
        executionLeaseMs: 5 * 60 * 1000,
        maximumAttempts: 3,
        onInfrastructureTestJob: handler,
      }),
    ).resolves.toEqual({ outcome: "FAILED", attemptNumber: 3 });

    expect(handler).not.toHaveBeenCalled();
    expect(jobs.attempts).toHaveLength(3);
    expect(jobs.attempts[2]).toMatchObject({
      status: "FAILED",
      failureCategory: "INTERRUPTED_EXECUTION",
    });
    expect(queued.record).toMatchObject({
      status: "FAILED",
      failureCategory: "INTERRUPTED_EXECUTION",
    });
  });

  it("persists only controlled failure text when a handler throws sensitive details", async () => {
    const jobs = createJobExecutionFixture();
    const queued = await processInternalEventDispatch(eventFixture(), jobs.dependencies);

    await expect(
      runFeature07JobExecution(queued.record.id, jobs.dependencies, {
        onInfrastructureTestJob: async () => {
          throw new Error("SECRET_PROVIDER_TOKEN private@example.test");
        },
      }),
    ).resolves.toEqual({ outcome: "RETRY_SCHEDULED", attemptNumber: 1 });

    const persisted = JSON.stringify({ job: queued.record, attempts: jobs.attempts });
    expect(persisted).not.toContain("SECRET_PROVIDER_TOKEN");
    expect(persisted).not.toContain("private@example.test");
    expect(queued.record.failureMessage).toBe("The job did not finish and can be retried safely.");
    expect(jobs.attempts[0]?.failureMessage).toBe(
      "The job did not finish and can be retried safely.",
    );
  });

  it("fails an unknown outbox event version visibly without creating a job", async () => {
    const outbox = createEventOutboxFixture();
    const malformed = await createEventOutboxEntry(eventFixture(), outbox.dependencies);
    Object.assign(malformed.record, {
      eventVersion: 99,
      payload: eventFixture({ version: 99 }),
      status: "PENDING",
    });

    const result = await dispatchPendingEventOutbox(
      {
        async send() {
          throw new Error("should not dispatch");
        },
      },
      outbox.dependencies,
    );

    expect(result).toEqual([
      {
        eventOutboxId: malformed.record.id,
        outcome: "FAILED",
        failureCategory: "UNSUPPORTED_EVENT",
      },
    ]);
    expect(
      await dispatchPendingEventOutbox(
        {
          send: async () => {
            throw new Error("Must not replay unsupported events");
          },
        },
        outbox.dependencies,
      ),
    ).toEqual([]);
    expect(malformed.record).toMatchObject({
      status: "FAILED",
      failureCategory: "UNSUPPORTED_EVENT",
    });
  });
});
