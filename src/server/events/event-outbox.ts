import "server-only";

import {
  parseRegisteredInternalEvent,
  type RegisteredInternalEvent,
} from "@/server/events/internal-event-registry";

export type EventOutboxStatus = "PENDING" | "DISPATCHED" | "FAILED";

export type EventOutboxRecord = {
  id: string;
  propertyId: string;
  eventId: string;
  eventName: string;
  eventVersion: number;
  correlationId: string;
  deduplicationKey: string;
  payload: unknown;
  status: EventOutboxStatus;
  dispatchedAt: Date | null;
  failureCategory: string | null;
  failureAt: Date | null;
  createdAt: Date;
};

export type EventOutboxRepository = {
  create: (input: { data: Record<string, unknown> }) => Promise<EventOutboxRecord>;
  findFirst: (input: { where: Record<string, unknown> }) => Promise<EventOutboxRecord | null>;
  findMany: (input: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc" | "desc">;
    take: number;
  }) => Promise<EventOutboxRecord[]>;
  updateMany: (input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

export type InternalEventDispatchTarget = {
  send: (event: {
    name: "btls/event-outbox.dispatch";
    data: { eventOutboxId: string; event: RegisteredInternalEvent };
  }) => Promise<unknown>;
};

export type EventOutboxDependencies = {
  eventOutbox: EventOutboxRepository;
  now: () => Date;
};

export type EventOutboxDispatchResult =
  | { eventOutboxId: string; outcome: "DISPATCHED" }
  | { eventOutboxId: string; outcome: "FAILED"; failureCategory: string };

function normalizeFailureCategory(error: unknown): string {
  if (error instanceof UnsupportedOutboxEventError) return "UNSUPPORTED_EVENT";
  return "EVENT_DISPATCH_FAILED";
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export class UnsupportedOutboxEventError extends Error {
  constructor() {
    super("The outbox record contains an unsupported internal event.");
    this.name = "UnsupportedOutboxEventError";
  }
}

/**
 * Persists a runtime-validated event before any external dispatch is attempted.
 * Callers may use their owning database transaction to create this same record.
 */
export async function createEventOutboxEntry(
  input: unknown,
  dependencies: EventOutboxDependencies,
): Promise<{ created: boolean; record: EventOutboxRecord }> {
  const event = parseRegisteredInternalEvent(input);

  try {
    const record = await dependencies.eventOutbox.create({
      data: {
        propertyId: event.propertyId,
        eventId: event.eventId,
        eventName: event.name,
        eventVersion: event.version,
        correlationId: event.correlationId,
        deduplicationKey: event.eventId,
        payload: event,
      },
    });

    return { created: true, record };
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;

    const record = await dependencies.eventOutbox.findFirst({
      where: { eventId: event.eventId },
    });
    if (!record) throw error;
    if (
      record.propertyId !== event.propertyId ||
      record.correlationId !== event.correlationId ||
      JSON.stringify(parseRegisteredInternalEvent(record.payload)) !== JSON.stringify(event)
    ) {
      throw new Error("The event id has conflicting context.");
    }

    return { created: false, record };
  }
}

function eventFromOutboxRecord(record: EventOutboxRecord): RegisteredInternalEvent {
  try {
    const event = parseRegisteredInternalEvent(record.payload);

    if (
      event.eventId !== record.eventId ||
      event.propertyId !== record.propertyId ||
      event.correlationId !== record.correlationId ||
      event.name !== record.eventName ||
      event.version !== record.eventVersion
    ) {
      throw new UnsupportedOutboxEventError();
    }

    return event;
  } catch {
    throw new UnsupportedOutboxEventError();
  }
}

/**
 * Sending and status marking are deliberately separate. A process interruption after
 * Inngest accepts the event leaves this record dispatchable; downstream job idempotency
 * makes the safe replay harmless.
 */
export async function dispatchPendingEventOutbox(
  target: InternalEventDispatchTarget,
  dependencies: EventOutboxDependencies,
  input: { limit?: number; eventOutboxId?: string } = {},
): Promise<EventOutboxDispatchResult[]> {
  const records = await dependencies.eventOutbox.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      OR: [{ failureCategory: null }, { failureCategory: { not: "UNSUPPORTED_EVENT" } }],
      ...(input.eventOutboxId ? { id: input.eventOutboxId } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: input.limit ?? 50,
  });
  const results: EventOutboxDispatchResult[] = [];

  for (const record of records) {
    try {
      const event = eventFromOutboxRecord(record);
      await target.send({
        name: "btls/event-outbox.dispatch",
        data: { eventOutboxId: record.id, event },
      });
      await dependencies.eventOutbox.updateMany({
        where: { id: record.id, status: { in: ["PENDING", "FAILED"] } },
        data: {
          status: "DISPATCHED",
          dispatchedAt: dependencies.now(),
          failureCategory: null,
          failureAt: null,
        },
      });
      results.push({ eventOutboxId: record.id, outcome: "DISPATCHED" });
    } catch (error) {
      const failureCategory = normalizeFailureCategory(error);
      await dependencies.eventOutbox.updateMany({
        where: { id: record.id, status: { in: ["PENDING", "FAILED"] } },
        data: {
          status: "FAILED",
          failureCategory,
          failureAt: dependencies.now(),
        },
      });
      results.push({ eventOutboxId: record.id, outcome: "FAILED", failureCategory });
    }
  }

  return results;
}
