import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createNotification,
  createNotificationDependencies,
  resolvePropertyNotificationDestination,
} from "@/server/notifications/notifications";
import { prisma } from "@/server/database/prisma";
import {
  getOperation,
  listOperations,
  requestOperationRetry,
  type OperationsActor,
  type OperationsDependencies,
} from "@/server/operations/operations";
import {
  processInternalEventDispatch,
  runFeature07JobExecution,
} from "@/server/jobs/feature-07-job-workflows";
import { parseRegisteredInternalEvent } from "@/server/events/internal-event-registry";
import { createPrismaJobExecutionDependencies } from "@/server/jobs/job-execution";

const ids = {
  account: randomUUID(),
  property: randomUUID(),
  otherProperty: randomUUID(),
  operator: randomUUID(),
};
let admin: OperationsActor;
function dependencies(actor = admin): OperationsDependencies {
  return {
    database: prisma,
    getActor: async () => actor,
    transaction: (work) => prisma.$transaction(work),
    now: () => new Date(),
    createId: randomUUID,
  };
}
async function failedJob(propertyId = ids.property) {
  const eventId = randomUUID();
  const correlationId = randomUUID();
  const now = new Date();
  return prisma.jobExecution.create({
    data: {
      propertyId,
      jobType: "infrastructure.contextual_proof",
      jobVersion: 1,
      origin: "SYSTEM",
      status: "FAILED",
      correlationId,
      idempotencyKey: `event:${eventId}`,
      failedAt: now,
      finishedAt: now,
      failureCategory: "RETRYABLE_FAILURE",
      safePayload: {
        propertyId,
        correlationId,
        idempotencyKey: `event:${eventId}`,
        eventId,
        source: "infrastructure.proof",
        recipientUserId: admin.id,
        subject: { type: "property.overview", id: propertyId },
      },
      attempts: {
        create: {
          attemptNumber: 3,
          status: "FAILED",
          finishedAt: now,
          failureCategory: "RETRYABLE_FAILURE",
        },
      },
    },
    include: { attempts: true },
  });
}

describe("Feature 07 audited retry database integration", () => {
  beforeAll(async () => {
    const found = await prisma.appUser.findFirst({
      where: { platformRole: "BTLS_ADMIN", status: "ACTIVE" },
    });
    if (!found) throw new Error("Local seed must supply an active BTLS Admin.");
    admin = found;
    await prisma.clientAccount.create({ data: { id: ids.account, name: "Operations retry test" } });
    await prisma.clientProperty.createMany({
      data: [
        { id: ids.property, accountId: ids.account, name: "Granted operation property" },
        { id: ids.otherProperty, accountId: ids.account, name: "Ungranted operation property" },
      ],
    });
    await prisma.appUser.create({
      data: {
        id: ids.operator,
        email: `${ids.operator}@example.test`,
        platformRole: "BTLS_OPERATOR",
      },
    });
    const membership = await prisma.accountMembership.create({
      data: { accountId: ids.account, userId: ids.operator, role: "CLIENT_VIEWER" },
    });
    await prisma.propertyAccess.create({
      data: { accountId: ids.account, propertyId: ids.property, membershipId: membership.id },
    });
  });
  afterAll(async () => {
    const where = { propertyId: { in: [ids.property, ids.otherProperty] } };
    await prisma.notification.deleteMany({ where });
    await prisma.eventOutbox.deleteMany({ where });
    await prisma.auditEvent.deleteMany({ where });
    await prisma.jobExecution.deleteMany({ where });
    await prisma.propertyAccess.deleteMany({ where: { accountId: ids.account } });
    await prisma.accountMembership.deleteMany({ where: { accountId: ids.account } });
    await prisma.clientProperty.deleteMany({ where: { accountId: ids.account } });
    await prisma.clientAccount.deleteMany({ where: { id: ids.account } });
    await prisma.appUser.deleteMany({ where: { id: ids.operator } });
    await prisma.$disconnect();
  });
  it("serializes concurrent retry submissions and recovers one real notification effect", async () => {
    const job = await failedJob();
    const request = {
      jobExecutionId: job.id,
      propertyId: job.propertyId,
      failedAttemptId: job.attempts[0].id,
      reason: "Dependency recovered",
    };
    const results = await Promise.allSettled([
      requestOperationRetry(request, dependencies()),
      requestOperationRetry(request, dependencies()),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(
      await prisma.auditEvent.count({
        where: { subjectId: job.id, action: "job_execution.retry_requested" },
      }),
    ).toBe(1);
    const outboxes = await prisma.eventOutbox.findMany({
      where: { correlationId: job.correlationId },
    });
    expect(outboxes).toHaveLength(1);
    const workers = createPrismaJobExecutionDependencies();
    const dispatched = await processInternalEventDispatch(
      parseRegisteredInternalEvent(outboxes[0].payload),
      workers,
    );
    expect(dispatched.record.id).toBe(job.id);
    expect(
      (
        await runFeature07JobExecution(job.id, workers, {
          maximumAttempts: "maximumAttempts" in dispatched ? dispatched.maximumAttempts : undefined,
        })
      ).outcome,
    ).toBe("SUCCEEDED");
    expect(
      (
        await runFeature07JobExecution(job.id, workers, {
          maximumAttempts: "maximumAttempts" in dispatched ? dispatched.maximumAttempts : undefined,
        })
      ).outcome,
    ).toBe("SKIPPED_TERMINAL");
    expect(
      await prisma.notification.count({
        where: { propertyId: job.propertyId, correlationId: job.correlationId },
      }),
    ).toBe(1);
    const detail = await getOperation({ jobExecutionId: job.id }, dependencies());
    expect(detail.status).toBe("SUCCEEDED");
    expect(detail.attemptCount).toBe(2);
    expect(detail.attempts.map((attempt) => attempt.status)).toEqual(["SUCCEEDED", "FAILED"]);
  });
  it("enforces actual Operator property grants on reads and rejects manual retries", async () => {
    const own = await failedJob();
    const other = await failedJob(ids.otherProperty);
    const operator = dependencies({
      id: ids.operator,
      platformRole: "BTLS_OPERATOR",
      status: "ACTIVE",
    });
    expect((await listOperations({ propertyId: ids.otherProperty }, operator)).jobs).toEqual([]);
    await expect(getOperation({ jobExecutionId: other.id }, operator)).rejects.toThrow(
      "unavailable",
    );
    expect((await getOperation({ jobExecutionId: own.id }, operator)).retry.allowed).toBe(false);
    await expect(
      requestOperationRetry(
        {
          jobExecutionId: own.id,
          propertyId: own.propertyId,
          failedAttemptId: own.attempts[0].id,
          reason: "Try again",
        },
        operator,
      ),
    ).rejects.toThrow("unavailable");
  });
  it("opens typed operation notification links only within the recipient property", async () => {
    const job = await failedJob();
    const foreignJob = await failedJob(ids.otherProperty);
    const notices = createNotificationDependencies();
    const context = await notices.resolveRecipientContext(ids.property, admin.id);
    if (!context) throw new Error("The notification recipient must be authorized.");
    for (const [subjectId, expected] of [
      [job.id, `/admin/operations/${job.id}`],
      [foreignJob.id, null],
    ] as const) {
      const notice = await createNotification(
        {
          source: "system",
          correlationId: job.correlationId,
          propertyId: ids.property,
          recipientUserId: admin.id,
          deduplicationKey: randomUUID(),
          type: "system.test",
          title: "Operation needs review",
          body: "Review the background operation.",
          subject: { type: "job_execution", id: subjectId },
        },
        notices,
      );
      await expect(
        resolvePropertyNotificationDestination(
          context,
          { propertyId: ids.property, notificationId: notice.notification.id },
          notices,
        ),
      ).resolves.toBe(expected);
    }
  });

  it("rolls back audit and queued state if the durable outbox cannot be written", async () => {
    const first = await failedJob();
    await requestOperationRetry(
      {
        jobExecutionId: first.id,
        propertyId: first.propertyId,
        failedAttemptId: first.attempts[0].id,
        reason: "Try again",
      },
      dependencies(),
    );
    const existing = await prisma.eventOutbox.findFirstOrThrow({
      where: { correlationId: first.correlationId },
    });
    const job = await failedJob();
    await expect(
      requestOperationRetry(
        {
          jobExecutionId: job.id,
          propertyId: job.propertyId,
          failedAttemptId: job.attempts[0].id,
          reason: "Try again",
        },
        { ...dependencies(), createId: () => existing.eventId },
      ),
    ).rejects.toThrow();
    expect((await prisma.jobExecution.findUniqueOrThrow({ where: { id: job.id } })).status).toBe(
      "FAILED",
    );
    expect(await prisma.auditEvent.count({ where: { subjectId: job.id } })).toBe(0);
  });
});
