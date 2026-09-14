import { describe, expect, it, vi } from "vitest";
import {
  getOperation,
  listOperations,
  operationScope,
  requestOperationRetry,
  retryEligibility,
  type OperationJob,
  type OperationsDependencies,
  type OperationsActor,
} from "@/server/operations/operations";

const ids = {
  job: "10000000-0000-4000-8000-000000000001",
  property: "10000000-0000-4000-8000-000000000002",
  actor: "10000000-0000-4000-8000-000000000003",
  attempt: "10000000-0000-4000-8000-000000000004",
  correlation: "10000000-0000-4000-8000-000000000005",
  event: "10000000-0000-4000-8000-000000000006",
};
const now = new Date("2026-09-10T12:00:00Z");
const admin: OperationsActor = { id: ids.actor, platformRole: "BTLS_ADMIN", status: "ACTIVE" };
function jobFixture(): OperationJob {
  return {
    id: ids.job,
    propertyId: ids.property,
    initiatedById: null,
    jobType: "infrastructure.contextual_proof",
    jobVersion: 1,
    origin: "SYSTEM",
    status: "FAILED",
    correlationId: ids.correlation,
    idempotencyKey: `event:${ids.event}`,
    safePayload: {
      eventId: ids.event,
      propertyId: ids.property,
      correlationId: ids.correlation,
      idempotencyKey: `event:${ids.event}`,
      source: "infrastructure.proof",
      recipientUserId: ids.actor,
      subject: { type: "property.overview", id: ids.property },
    },
    retryRequestedAt: null,
    startedAt: now,
    finishedAt: now,
    failureCategory: "RETRYABLE_FAILURE",
    failureMessage: "SECRET_PROVIDER_MESSAGE",
    failedAt: now,
    createdAt: now,
    updatedAt: now,
    property: { name: "Test property", accountId: ids.property },
    _count: { attempts: 3 },
    attempts: [
      {
        id: ids.attempt,
        jobExecutionId: ids.job,
        attemptNumber: 3,
        status: "FAILED",
        providerRunId: "secret-run",
        startedAt: now,
        finishedAt: now,
        failureCategory: "RETRYABLE_FAILURE",
        failureMessage: "SECRET_PROVIDER_MESSAGE",
      },
    ],
  };
}
function fixture(actor: OperationsActor | null = admin) {
  const job = jobFixture();
  const audit = vi.fn().mockResolvedValue({});
  const outbox = vi.fn().mockResolvedValue({ id: ids.event });
  const find = vi
    .fn()
    .mockImplementation(async ({ where }) =>
      where.id === ids.job && (!where.propertyId || where.propertyId === job.propertyId)
        ? structuredClone(job)
        : null,
    );
  const database = {
    jobExecution: {
      findFirst: find,
      findMany: vi.fn().mockResolvedValue([job]),
      count: vi.fn().mockResolvedValue(1),
      updateMany: vi.fn().mockImplementation(async ({ data }) => {
        if (job.status !== "FAILED") return { count: 0 };
        Object.assign(job, data);
        return { count: 1 };
      }),
    },
    jobExecutionAttempt: { findMany: vi.fn().mockResolvedValue(job.attempts) },
    auditEvent: { create: audit },
    eventOutbox: { create: outbox, findFirst: vi.fn().mockResolvedValue(null) },
  };
  const dependencies: OperationsDependencies = {
    getActor: async () => actor,
    database: database as unknown as OperationsDependencies["database"],
    transaction: async (work) => {
      const before = structuredClone(job);
      try {
        return await work(database as unknown as OperationsDependencies["database"]);
      } catch (error) {
        Object.assign(job, before);
        throw error;
      }
    },
    now: () => now,
    createId: () => ids.event,
  };
  return { job, audit, outbox, dependencies, database };
}
const input = {
  jobExecutionId: ids.job,
  propertyId: ids.property,
  failedAttemptId: ids.attempt,
  reason: "Provider has recovered",
};

describe("Feature 07 operations and audited retry", () => {
  it("denies clients, disabled users, and unauthenticated callers", async () => {
    for (const actor of [
      null,
      { ...admin, platformRole: null },
      { ...admin, status: "DISABLED" as const },
    ]) {
      const { dependencies, audit } = fixture(actor);
      await expect(listOperations({}, dependencies)).rejects.toThrow("unavailable");
      await expect(requestOperationRetry(input, dependencies)).rejects.toThrow("unavailable");
      expect(audit).not.toHaveBeenCalled();
    }
  });
  it("puts explicit Operator property grants on list/detail queries and denies Operator retries", async () => {
    const operator = { ...admin, platformRole: "BTLS_OPERATOR" as const };
    const { dependencies, database } = fixture(operator);
    await listOperations({ propertyId: ids.property }, dependencies);
    const scope = operationScope(operator);
    expect(scope).toMatchObject({
      property: {
        propertyAccesses: { some: { membership: { userId: ids.actor, status: "ACTIVE" } } },
      },
    });
    expect(database.jobExecution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining(scope) }),
    );
    await getOperation({ jobExecutionId: ids.job }, dependencies);
    expect(database.jobExecution.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining(scope) }),
    );
    await expect(requestOperationRetry(input, dependencies)).rejects.toThrow("unavailable");
  });
  it("rejects cross-property, stale, unsupported, permanent, malformed, and active retry inputs", async () => {
    const { dependencies, job } = fixture();
    await expect(
      requestOperationRetry({ ...input, propertyId: ids.actor }, dependencies),
    ).rejects.toThrow("unavailable");
    await expect(
      requestOperationRetry({ ...input, failedAttemptId: ids.actor }, dependencies),
    ).rejects.toThrow("no longer eligible");
    await expect(requestOperationRetry({ ...input, reason: "" }, dependencies)).rejects.toThrow();
    for (const status of ["QUEUED", "RUNNING", "RETRY_SCHEDULED", "SUCCEEDED"] as const)
      expect(retryEligibility({ ...job, status }, admin).allowed).toBe(false);
    expect(
      retryEligibility(
        {
          ...job,
          jobType: "storage.media_cleanup",
          correlationId: ids.event,
          idempotencyKey: "media-cleanup:" + ids.event,
          safePayload: {
            propertyId: ids.property,
            correlationId: ids.event,
            idempotencyKey: "media-cleanup:" + ids.event,
            mediaAssetId: ids.event,
          },
        },
        admin,
      ).allowed,
    ).toBe(true);
    expect(retryEligibility({ ...job, jobType: "future.unsupported" }, admin).allowed).toBe(false);
    expect(
      retryEligibility({ ...job, failureCategory: "INTERRUPTED_EXECUTION" }, admin).allowed,
    ).toBe(true);
    expect(retryEligibility({ ...job, failureCategory: "PERMANENT_FAILURE" }, admin).allowed).toBe(
      false,
    );
    expect(retryEligibility({ ...job, safePayload: {} }, admin).allowed).toBe(false);
  });
  it("persists exactly one audited retry/outbox request and preserves effect idempotency", async () => {
    const { dependencies, audit, outbox, job } = fixture();
    await requestOperationRetry(input, dependencies);
    await expect(requestOperationRetry(input, dependencies)).rejects.toThrow("no longer eligible");
    expect(job).toMatchObject({
      status: "RETRY_SCHEDULED",
      idempotencyKey: `event:${ids.event}`,
      correlationId: ids.correlation,
    });
    expect(audit).toHaveBeenCalledTimes(1);
    expect(outbox).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: ids.actor,
        propertyId: ids.property,
        action: "job_execution.retry_requested",
      }),
    });
    expect(outbox).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventName: "operations.job.retry_requested",
        correlationId: ids.correlation,
      }),
    });
  });
  it("rolls back the claim when the audit fails", async () => {
    const { dependencies, audit, outbox, job } = fixture();
    audit.mockRejectedValueOnce(new Error("Audit unavailable"));
    await expect(requestOperationRetry(input, dependencies)).rejects.toThrow("Audit unavailable");
    expect(job.status).toBe("FAILED");
    expect(outbox).not.toHaveBeenCalled();
  });
  it("redacts raw payloads and failure text from returned UI data", async () => {
    const { dependencies } = fixture();
    const detail = await getOperation({ jobExecutionId: ids.job }, dependencies);
    expect(JSON.stringify(detail)).not.toContain("SECRET_PROVIDER_MESSAGE");
    expect(detail).not.toHaveProperty("safePayload");
    expect(detail.retry.allowed).toBe(true);
  });
});
