import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/server/database/prisma";
import { runFeature07JobExecution } from "@/server/jobs/feature-07-job-workflows";
import {
  createPrismaJobExecutionDependencies,
  enqueueJobExecution,
} from "@/server/jobs/job-execution";

const ids = {
  account: randomUUID(),
  property: randomUUID(),
};

function proofPayload(idempotencyKey: string) {
  return {
    propertyId: ids.property,
    correlationId: randomUUID(),
    idempotencyKey,
    eventId: randomUUID(),
    subject: { type: "Feature07Proof", id: randomUUID() },
  };
}

describe("Feature 07 interrupted job recovery database integration", () => {
  beforeAll(async () => {
    await prisma.clientAccount.create({
      data: {
        id: ids.account,
        name: "Interrupted job recovery integration",
        properties: {
          create: {
            id: ids.property,
            name: "Recovery property",
            domain: "job-recovery-" + ids.property.slice(0, 8) + ".example.test",
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.jobExecution.deleteMany({ where: { propertyId: ids.property } });
    await prisma.clientProperty.deleteMany({ where: { accountId: ids.account } });
    await prisma.clientAccount.deleteMany({ where: { id: ids.account } });
    await prisma.$disconnect();
  });

  it("defers a live claim, recovers its attempt after expiry, and fences the late worker", async () => {
    let currentNow = new Date("2026-09-12T12:00:00.000Z");
    const baseDependencies = createPrismaJobExecutionDependencies();
    const dependencies = { ...baseDependencies, now: () => currentNow };
    const queued = await enqueueJobExecution(
      {
        jobType: "infrastructure.test_job",
        origin: "SYSTEM",
        payload: proofPayload("integration:interrupted-recovery"),
      },
      dependencies,
    );
    let enterHandler!: () => void;
    let releaseHandler!: () => void;
    const entered = new Promise<void>((resolve) => {
      enterHandler = resolve;
    });
    const held = new Promise<void>((resolve) => {
      releaseHandler = resolve;
    });

    const originalWorker = runFeature07JobExecution(queued.record.id, dependencies, {
      executionLeaseMs: 5 * 60 * 1000,
      onInfrastructureTestJob: async () => {
        enterHandler();
        await held;
      },
    });

    try {
      await entered;
      currentNow = new Date("2026-09-12T12:01:00.000Z");
      await expect(
        runFeature07JobExecution(queued.record.id, dependencies, {
          executionLeaseMs: 5 * 60 * 1000,
          onInfrastructureTestJob: async () => undefined,
        }),
      ).resolves.toEqual({
        outcome: "SKIPPED_ACTIVE",
        retryAt: new Date("2026-09-12T12:05:00.000Z"),
      });

      currentNow = new Date("2026-09-12T12:06:00.000Z");
      await expect(
        runFeature07JobExecution(queued.record.id, dependencies, {
          executionLeaseMs: 5 * 60 * 1000,
          onInfrastructureTestJob: async () => undefined,
        }),
      ).resolves.toEqual({ outcome: "SUCCEEDED", attemptNumber: 2 });
    } finally {
      releaseHandler();
    }

    await expect(originalWorker).resolves.toEqual({
      outcome: "SKIPPED_STALE",
      attemptNumber: 1,
    });
    await expect(
      prisma.jobExecution.findUniqueOrThrow({
        where: { id: queued.record.id },
        include: { attempts: { orderBy: { attemptNumber: "asc" } } },
      }),
    ).resolves.toMatchObject({
      status: "SUCCEEDED",
      attempts: [
        {
          attemptNumber: 1,
          status: "FAILED",
          failureCategory: "INTERRUPTED_EXECUTION",
          finishedAt: new Date("2026-09-12T12:06:00.000Z"),
        },
        { attemptNumber: 2, status: "SUCCEEDED" },
      ],
    });
    await expect(
      prisma.jobExecutionAttempt.count({
        where: { jobExecutionId: queued.record.id, status: "STARTED" },
      }),
    ).resolves.toBe(0);
  });

  it("does not persist raw exception text", async () => {
    const dependencies = createPrismaJobExecutionDependencies();
    const queued = await enqueueJobExecution(
      {
        jobType: "infrastructure.test_job",
        origin: "SYSTEM",
        payload: proofPayload("integration:safe-failure"),
      },
      dependencies,
    );

    await expect(
      runFeature07JobExecution(queued.record.id, dependencies, {
        onInfrastructureTestJob: async () => {
          throw new Error("SECRET_DATABASE_DETAIL private@example.test");
        },
      }),
    ).resolves.toEqual({ outcome: "RETRY_SCHEDULED", attemptNumber: 1 });

    const persisted = await prisma.jobExecution.findUniqueOrThrow({
      where: { id: queued.record.id },
      include: { attempts: true },
    });
    expect(JSON.stringify(persisted)).not.toContain("SECRET_DATABASE_DETAIL");
    expect(JSON.stringify(persisted)).not.toContain("private@example.test");
    expect(persisted.failureMessage).toBe("The job did not finish and can be retried safely.");
    expect(persisted.attempts[0]?.failureMessage).toBe(
      "The job did not finish and can be retried safely.",
    );
  });
});
