import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import type { NotificationDependencies } from "@/server/notifications/notifications";

export const notificationIds = {
  anotherProperty: "00000000-0000-4000-8000-000000000001",
  anotherUser: "00000000-0000-4000-8000-000000000002",
  notificationOne: "00000000-0000-4000-8000-000000000003",
  notificationTwo: "00000000-0000-4000-8000-000000000004",
  property: "00000000-0000-4000-8000-000000000005",
  user: "00000000-0000-4000-8000-000000000006",
};

const now = new Date("2026-09-07T14:00:00.000Z");

export const notificationContext = {
  property: {
    id: notificationIds.property,
    name: "Northside Plumbing",
    domain: "northside.example.test",
  },
  user: {
    id: notificationIds.user,
    email: "operator@example.test",
    displayName: "Operator",
    platformRole: null,
  },
  account: { id: "00000000-0000-4000-8000-000000000007", name: "Northside" },
  capabilities: { platform: [], property: [] },
  effectiveRole: "CLIENT_MANAGER",
  membership: { id: "00000000-0000-4000-8000-000000000008", role: "CLIENT_MANAGER" },
  propertyAccess: { id: "00000000-0000-4000-8000-000000000009", roleOverride: null },
} as AuthorizedPropertyContext;

type StoredNotification = {
  id: string;
  propertyId: string;
  recipientUserId: string;
  source: string | null;
  correlationId: string | null;
  type: string;
  title: string;
  body: string;
  subjectType: string | null;
  subjectId: string | null;
  deduplicationKey: string;
  readAt: Date | null;
  createdAt: Date;
};

function matches(where: Record<string, unknown>, record: StoredNotification): boolean {
  return Object.entries(where).every(
    ([key, expected]) => record[key as keyof StoredNotification] === expected,
  );
}

export function createNotificationFixture() {
  const records: StoredNotification[] = [
    {
      id: notificationIds.notificationOne,
      propertyId: notificationIds.property,
      recipientUserId: notificationIds.user,
      source: "system",
      correlationId: notificationIds.notificationOne,
      type: "system.test",
      title: "A background task needs attention",
      body: "Try the operation again later.",
      subjectType: "job_execution",
      subjectId: "00000000-0000-4000-8000-000000000010",
      deduplicationKey: "one",
      readAt: null,
      createdAt: new Date("2026-09-07T13:59:00.000Z"),
    },
    {
      id: notificationIds.notificationTwo,
      propertyId: notificationIds.property,
      recipientUserId: notificationIds.user,
      source: "system",
      correlationId: notificationIds.notificationOne,
      type: "system.test",
      title: "Media is ready",
      body: "Your media item is available.",
      subjectType: "media.asset",
      subjectId: "00000000-0000-4000-8000-000000000011",
      deduplicationKey: "two",
      readAt: now,
      createdAt: new Date("2026-09-07T13:58:00.000Z"),
    },
    {
      id: "00000000-0000-4000-8000-000000000012",
      propertyId: notificationIds.property,
      recipientUserId: notificationIds.anotherUser,
      source: "system",
      correlationId: notificationIds.notificationOne,
      type: "system.test",
      title: "Other user",
      body: "Not visible.",
      subjectType: null,
      subjectId: null,
      deduplicationKey: "other-user",
      readAt: null,
      createdAt: now,
    },
  ];
  const dependencies: NotificationDependencies = {
    resolveRecipientContext: async (propertyId, userId) =>
      propertyId === notificationIds.property && userId === notificationIds.user
        ? notificationContext
        : null,
    canOpenJob: async () => false,
    canOpenMedia: async () => true,
    notification: {
      async create({ data }) {
        if (
          records.some(
            (record) =>
              record.propertyId === data.propertyId &&
              record.recipientUserId === data.recipientUserId &&
              record.deduplicationKey === data.deduplicationKey,
          )
        ) {
          throw Object.assign(new Error("duplicate"), { code: "P2002" });
        }
        const record: StoredNotification = {
          id: "00000000-0000-4000-8000-000000000013",
          propertyId: data.propertyId as string,
          recipientUserId: data.recipientUserId as string,
          source: data.source as string,
          correlationId: data.correlationId as string,
          type: data.type as string,
          title: data.title as string,
          body: data.body as string,
          subjectType: (data.subjectType as string | null) ?? null,
          subjectId: (data.subjectId as string | null) ?? null,
          deduplicationKey: data.deduplicationKey as string,
          readAt: null,
          createdAt: now,
        };
        records.push(record);
        return record;
      },
      async findFirst({ where }) {
        return records.find((record) => matches(where, record)) ?? null;
      },
      async findMany({ where, skip, take }) {
        return records.filter((record) => matches(where, record)).slice(skip, skip + take);
      },
      async count({ where }) {
        return records.filter((record) => matches(where, record)).length;
      },
      async updateMany({ where, data }) {
        const matching = records.filter((record) => matches(where, record));
        for (const record of matching) Object.assign(record, data);
        return { count: matching.length };
      },
    },
    now: () => now,
  };
  return { dependencies, records };
}
