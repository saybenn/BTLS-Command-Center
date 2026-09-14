import { Bell } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function NotificationBell({
  propertyId,
  unreadCount,
}: Readonly<{
  propertyId: string;
  unreadCount: number | null;
}>) {
  const hasUnread = unreadCount !== null && unreadCount > 0;
  const label =
    unreadCount === null
      ? "Notifications, count unavailable"
      : hasUnread
        ? `Notifications, ${unreadCount} unread`
        : "Notifications, none unread";

  return (
    <Link
      aria-label={label}
      className="relative inline-flex size-10 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      href={`/${propertyId}/notifications`}
    >
      <Bell aria-hidden="true" className="size-4" />
      {hasUnread && unreadCount !== null ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-accent-foreground",
            unreadCount > 99 && "min-w-5",
          )}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
