"use client";

import { Check, CheckCheck, CircleDot, ExternalLink, Inbox } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PropertyNotificationPage } from "@/server/notifications/notifications";

type NotificationAction = (
  notificationId: string,
) => Promise<{ message: string; status: "error" | "success" }>;
type MarkAllNotificationsAction = () => Promise<{ message: string; status: "error" | "success" }>;

export function NotificationCenter({
  markAllReadAction,
  markReadAction,
  notifications: initialNotifications,
  propertyId,
}: Readonly<{
  markAllReadAction: MarkAllNotificationsAction;
  markReadAction: NotificationAction;
  notifications: PropertyNotificationPage;
  propertyId: string;
}>) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [serverSnapshot, setServerSnapshot] = useState(initialNotifications);
  if (serverSnapshot !== initialNotifications) {
    setServerSnapshot(initialNotifications);
    setNotifications(initialNotifications);
  }
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markRead(notificationId: string) {
    startTransition(async () => {
      let result;
      try {
        result = await markReadAction(notificationId);
      } catch {
        setStatus("Could not update this notice. Please try again.");
        return;
      }
      setStatus(result.message);
      if (result.status === "success") {
        setNotifications((current) => ({
          ...current,
          unreadCount: Math.max(
            0,
            current.unreadCount -
              (current.notifications.some(
                (notice) => notice.id === notificationId && notice.readAt === null,
              )
                ? 1
                : 0),
          ),
          notifications: current.notifications.map((notification) =>
            notification.id === notificationId && notification.readAt === null
              ? { ...notification, readAt: new Date() }
              : notification,
          ),
        }));
      }
    });
  }

  function markAllRead() {
    startTransition(async () => {
      let result;
      try {
        result = await markAllReadAction();
      } catch {
        setStatus("Could not update notifications. Please try again.");
        return;
      }
      setStatus(result.message);
      if (result.status === "success") {
        setNotifications((current) => ({
          ...current,
          unreadCount: 0,
          notifications: current.notifications.map((notification) =>
            notification.readAt === null ? { ...notification, readAt: new Date() } : notification,
          ),
        }));
      }
    });
  }

  return (
    <section aria-labelledby="notifications-title" className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h1
            className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
            id="notifications-title"
          >
            Notifications
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Your updates and background-operation notices for this property.
          </p>
        </div>
        <Button
          disabled={notifications.unreadCount === 0 || isPending}
          loading={isPending}
          onClick={markAllRead}
          variant="secondary"
        >
          <CheckCheck aria-hidden="true" className="size-4" />
          Mark all as read
        </Button>
      </div>

      <p aria-live="polite" className="text-sm text-text-secondary">
        {status}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        <Badge variant={notifications.unreadCount > 0 ? "warning" : "neutral"}>
          {notifications.unreadCount} unread
        </Badge>
        <span>
          {notifications.total} {notifications.total === 1 ? "notice" : "notices"}
        </span>
      </div>

      {notifications.notifications.length === 0 ? (
        <EmptyState
          description="New notices for this property will appear here."
          icon={Inbox}
          title="You are all caught up"
        />
      ) : (
        <ol
          aria-label="Notifications"
          className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-xs"
        >
          {notifications.notifications.map((notification) => {
            const unread = notification.readAt === null;
            return (
              <li
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
                key={notification.id}
              >
                <div className="flex min-w-0 gap-3">
                  <span
                    aria-label={unread ? "Unread" : "Read"}
                    className={unread ? "mt-1 text-accent" : "mt-1 text-text-muted"}
                  >
                    {unread ? (
                      <CircleDot aria-hidden="true" className="size-4" />
                    ) : (
                      <Check aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="break-words font-medium text-text-primary">
                        {notification.title}
                      </p>
                      <span className="text-xs text-text-muted">
                        <time dateTime={new Date(notification.createdAt).toISOString()}>
                          {new Date(notification.createdAt).toISOString().slice(0, 10)}
                        </time>
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm leading-6 text-text-secondary">
                      {notification.body}
                    </p>
                    {notification.subject?.href ? (
                      <Link
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        href={notification.subject.href}
                      >
                        {notification.subject.label}
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                      </Link>
                    ) : notification.subject ? (
                      <p className="mt-2 text-xs font-medium text-text-muted">
                        {notification.subject.label}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-text-muted">Destination unavailable</p>
                    )}
                  </div>
                </div>
                {unread ? (
                  <Button
                    aria-label={`Mark ${notification.title} as read`}
                    className="shrink-0"
                    disabled={isPending}
                    onClick={() => markRead(notification.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Check aria-hidden="true" className="size-4" />
                    Mark read
                  </Button>
                ) : (
                  <Badge className="shrink-0" variant="neutral">
                    Read
                  </Badge>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {notifications.totalPages > 1 ? (
        <nav
          aria-label="Notification pages"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-sm text-text-secondary">
            Page {notifications.page} of {notifications.totalPages}
          </p>
          <div className="flex gap-2">
            {notifications.page > 1 ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href={`/${propertyId}/notifications?page=${notifications.page - 1}`}
              >
                Previous
              </Link>
            ) : null}
            {notifications.page < notifications.totalPages ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href={`/${propertyId}/notifications?page=${notifications.page + 1}`}
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
