import "server-only";

import { z } from "zod";

import type { AuthorizedPropertyContext } from "@/server/properties/property-context";

import { createNotificationInputSchema, notificationSubjectSchema } from "./notification-contracts";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

const notificationIdSchema = z.string().uuid();

type NotificationRecord = {
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

type NotificationRepository = {
  create: (input: { data: Record<string, unknown> }) => Promise<NotificationRecord>;
  findFirst: (input: { where: Record<string, unknown> }) => Promise<NotificationRecord | null>;
  findMany: (input: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">>;
    skip: number;
    take: number;
  }) => Promise<NotificationRecord[]>;
  count: (input: { where: Record<string, unknown> }) => Promise<number>;
  updateMany: (input: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

export type NotificationDependencies = {
  resolveRecipientContext: (
    propertyId: string,
    userId: string,
  ) => Promise<AuthorizedPropertyContext | null>;
  canOpenJob: (context: AuthorizedPropertyContext, jobExecutionId: string) => Promise<boolean>;
  canOpenMedia: (context: AuthorizedPropertyContext, mediaAssetId: string) => Promise<boolean>;
  notification: NotificationRepository;
  now: () => Date;
};

export type ResolvedNotificationSubject =
  | { href: string; label: string; type: "media.asset" | "property.overview" }
  | { href?: string; label: string; type: "job_execution" };

export type PropertyNotification = {
  source: string | null;
  correlationId: string | null;
  body: string;
  createdAt: Date;
  id: string;
  readAt: Date | null;
  subject: ResolvedNotificationSubject | null;
  title: string;
  type: string;
};

export type PropertyNotificationPage = {
  notifications: PropertyNotification[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unreadCount: number;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function requireNotificationPropertyContext(
  context: AuthorizedPropertyContext,
  propertyId: string,
): void {
  if (context.property.id !== propertyId) {
    throw new Error("This property is unavailable.");
  }
}

/** Destinations are derived only after the owning service authorizes the typed subject. */
export async function resolveNotificationSubject(
  context: AuthorizedPropertyContext,
  input: unknown,
  dependencies: NotificationDependencies = createNotificationDependencies(),
): Promise<ResolvedNotificationSubject | null> {
  const parsed = notificationSubjectSchema.safeParse(input);
  if (!parsed.success) return null;
  const subject = parsed.data;
  const propertyId = context.property.id;
  switch (subject.type) {
    case "property.overview":
      return subject.id === propertyId
        ? { type: subject.type, label: "Property overview", href: `/${propertyId}/overview` }
        : null;
    case "media.asset":
      return (await dependencies.canOpenMedia(context, subject.id))
        ? { type: subject.type, label: "Media library", href: `/${propertyId}/media` }
        : null;
    case "job_execution":
      return (await dependencies.canOpenJob(context, subject.id))
        ? {
            type: subject.type,
            label: "Background operation",
            href: `/admin/operations/${subject.id}`,
          }
        : { type: subject.type, label: "Background operation details unavailable" };
  }
}

async function toPropertyNotification(
  record: NotificationRecord,
  context: AuthorizedPropertyContext,
  dependencies: NotificationDependencies,
): Promise<PropertyNotification> {
  const subject = await resolveNotificationSubject(
    context,
    { id: record.subjectId, type: record.subjectType },
    dependencies,
  );
  return {
    id: record.id,
    type: record.type,
    source: record.source,
    correlationId: record.correlationId,
    title: record.title,
    body: record.body,
    readAt: record.readAt,
    createdAt: record.createdAt,
    subject: subject?.href
      ? { ...subject, href: `/${record.propertyId}/notifications/${record.id}/open` }
      : subject,
  };
}

async function requireCurrentRecipient(
  context: AuthorizedPropertyContext,
  dependencies: NotificationDependencies,
): Promise<AuthorizedPropertyContext> {
  const current = await dependencies.resolveRecipientContext(context.property.id, context.user.id);
  if (!current) throw new Error("This property is unavailable.");
  return current;
}

/** Rechecks scope and subject availability at click time; URLs never come from the caller. */
export async function resolvePropertyNotificationDestination(
  context: AuthorizedPropertyContext,
  input: { propertyId: string; notificationId: string },
  dependencies: NotificationDependencies = createNotificationDependencies(),
): Promise<string | null> {
  requireNotificationPropertyContext(context, input.propertyId);
  const current = await requireCurrentRecipient(context, dependencies);
  const id = notificationIdSchema.safeParse(input.notificationId);
  if (!id.success) return null;
  const record = await dependencies.notification.findFirst({
    where: {
      id: id.data,
      propertyId: current.property.id,
      recipientUserId: current.user.id,
    },
  });
  if (!record) return null;
  const subject = await resolveNotificationSubject(
    current,
    { type: record.subjectType, id: record.subjectId },
    dependencies,
  );
  return subject?.href ?? null;
}

export function createNotificationDependencies(): NotificationDependencies {
  return {
    resolveRecipientContext: async (propertyId, userId) => {
      const { prisma } = await import("@/server/database/prisma");
      const { createPropertyContextDependencies, resolveAuthorizedPropertyContext } =
        await import("@/server/properties/property-context");
      const user = await prisma.appUser.findUnique({ where: { id: userId } });
      if (!user || user.status !== "ACTIVE") return null;
      // Operators need explicit active property membership on notification surfaces.
      const scopedUser =
        user.platformRole === "BTLS_OPERATOR" ? { ...user, platformRole: null } : user;
      const result = await resolveAuthorizedPropertyContext(propertyId, {
        ...createPropertyContextDependencies(),
        getAuthenticatedAppUser: async () => ({ status: "active", user: scopedUser }),
      });
      return result.status === "authorized" ? result.context : null;
    },
    canOpenJob: async (context, jobExecutionId) => {
      const { createOperationsDependencies, getOperation, OperationsAccessError } =
        await import("@/server/operations/operations");
      const { prisma } = await import("@/server/database/prisma");
      try {
        const detail = await getOperation(
          { jobExecutionId },
          {
            ...(await createOperationsDependencies()),
            getActor: () => prisma.appUser.findUnique({ where: { id: context.user.id } }),
          },
        );
        return detail.propertyId === context.property.id;
      } catch (error) {
        if (error instanceof OperationsAccessError) return false;
        throw error;
      }
    },
    canOpenMedia: async (context, mediaAssetId) => {
      const { requireGenericLibraryAsset, GenericMediaLibraryBoundaryError } =
        await import("@/server/storage/media-library-boundary");
      const { getMediaAssetMetadata, MediaAccessError } =
        await import("@/server/storage/media-access");
      try {
        await requireGenericLibraryAsset(context, {
          propertyId: context.property.id,
          mediaAssetId,
          requiredCapability: "view",
        });
        await getMediaAssetMetadata(context, { propertyId: context.property.id, mediaAssetId });
        return true;
      } catch (error) {
        if (error instanceof MediaAccessError || error instanceof GenericMediaLibraryBoundaryError)
          return false;
        throw error;
      }
    },
    notification: new Proxy({} as NotificationRepository, {
      get(_target, method) {
        return async (...argumentsList: unknown[]) => {
          const { prisma } = await import("@/server/database/prisma");
          const delegate = prisma.notification as unknown as Record<
            string,
            (...args: unknown[]) => unknown
          >;
          return delegate[String(method)](...argumentsList);
        };
      },
    }),
    now: () => new Date(),
  };
}

export async function createNotification(
  input: unknown,
  dependencies: NotificationDependencies = createNotificationDependencies(),
): Promise<{ created: boolean; notification: PropertyNotification }> {
  const parsed = createNotificationInputSchema.parse(input);
  const subject = parsed.subject;
  const context = await dependencies.resolveRecipientContext(
    parsed.propertyId,
    parsed.recipientUserId,
  );
  if (!context) throw new Error("The notification recipient is unavailable.");
  const destination = await resolveNotificationSubject(context, subject, dependencies);
  if (!destination) throw new Error("The notification subject is unavailable.");

  try {
    const notification = await dependencies.notification.create({
      data: {
        propertyId: parsed.propertyId,
        recipientUserId: parsed.recipientUserId,
        type: parsed.type,
        source: parsed.source,
        correlationId: parsed.correlationId,
        title: parsed.title,
        body: parsed.body,
        deduplicationKey: parsed.deduplicationKey,
        subjectType: subject?.type ?? null,
        subjectId: subject?.id ?? null,
      },
    });
    return {
      created: true,
      notification: await toPropertyNotification(notification, context, dependencies),
    };
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;

    const notification = await dependencies.notification.findFirst({
      where: {
        propertyId: parsed.propertyId,
        recipientUserId: parsed.recipientUserId,
        deduplicationKey: parsed.deduplicationKey,
      },
    });
    if (!notification) throw error;
    if (
      notification.source !== parsed.source ||
      notification.correlationId !== parsed.correlationId ||
      notification.type !== parsed.type ||
      notification.subjectType !== subject.type ||
      notification.subjectId !== subject.id ||
      notification.title !== parsed.title ||
      notification.body !== parsed.body
    ) {
      throw new Error("The notification idempotency key has conflicting context.");
    }

    return {
      created: false,
      notification: await toPropertyNotification(notification, context, dependencies),
    };
  }
}

export async function listPropertyNotifications(
  context: AuthorizedPropertyContext,
  input: { page?: number; pageSize?: number; propertyId: string },
  dependencies: NotificationDependencies = createNotificationDependencies(),
): Promise<PropertyNotificationPage> {
  requireNotificationPropertyContext(context, input.propertyId);
  const current = await requireCurrentRecipient(context, dependencies);
  const pagination = paginationSchema.parse(input);
  const where = { propertyId: input.propertyId, recipientUserId: context.user.id };
  const [total, unreadCount, records] = await Promise.all([
    dependencies.notification.count({ where }),
    dependencies.notification.count({ where: { ...where, readAt: null } }),
    dependencies.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const page = Math.min(pagination.page, totalPages);

  if (page !== pagination.page) {
    return listPropertyNotifications(
      context,
      { ...input, page, pageSize: pagination.pageSize },
      dependencies,
    );
  }

  return {
    notifications: await Promise.all(
      records.map((record) => toPropertyNotification(record, current, dependencies)),
    ),
    page,
    pageSize: pagination.pageSize,
    total,
    totalPages,
    unreadCount,
  };
}

export async function getNotificationBellSummary(
  context: AuthorizedPropertyContext,
  dependencies: NotificationDependencies = createNotificationDependencies(),
): Promise<{ unreadCount: number }> {
  await requireCurrentRecipient(context, dependencies);
  const unreadCount = await dependencies.notification.count({
    where: {
      propertyId: context.property.id,
      recipientUserId: context.user.id,
      readAt: null,
    },
  });
  return { unreadCount };
}

export async function markPropertyNotificationRead(
  context: AuthorizedPropertyContext,
  input: { notificationId: string; propertyId: string },
  dependencies: NotificationDependencies = createNotificationDependencies(),
): Promise<boolean> {
  requireNotificationPropertyContext(context, input.propertyId);
  await requireCurrentRecipient(context, dependencies);
  const notificationId = notificationIdSchema.parse(input.notificationId);
  const result = await dependencies.notification.updateMany({
    where: {
      id: notificationId,
      propertyId: input.propertyId,
      recipientUserId: context.user.id,
      readAt: null,
    },
    data: { readAt: dependencies.now() },
  });
  return result.count === 1;
}

export async function markAllPropertyNotificationsRead(
  context: AuthorizedPropertyContext,
  input: { propertyId: string },
  dependencies: NotificationDependencies = createNotificationDependencies(),
): Promise<number> {
  requireNotificationPropertyContext(context, input.propertyId);
  await requireCurrentRecipient(context, dependencies);
  const result = await dependencies.notification.updateMany({
    where: {
      propertyId: input.propertyId,
      recipientUserId: context.user.id,
      readAt: null,
    },
    data: { readAt: dependencies.now() },
  });
  return result.count;
}
