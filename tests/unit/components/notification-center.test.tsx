import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationCenter } from "@/components/notifications/notification-center";

const propertyId = "00000000-0000-4000-8000-000000000001";
const notificationId = "00000000-0000-4000-8000-000000000002";

const notifications = {
  page: 1,
  pageSize: 20,
  total: 2,
  totalPages: 2,
  unreadCount: 1,
  notifications: [
    {
      id: notificationId,
      source: "system",
      correlationId: notificationId,
      type: "system.test",
      title: "Task needs attention",
      body: "A background task can be retried later.",
      createdAt: new Date(),
      readAt: null,
      subject: { type: "job_execution" as const, label: "Background operation" },
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      source: "system",
      correlationId: notificationId,
      type: "system.test",
      title: "Media is ready",
      body: "A media item is ready for review.",
      createdAt: new Date(),
      readAt: new Date(),
      subject: {
        type: "media.asset" as const,
        label: "Media library",
        href: `/${propertyId}/media`,
      },
    },
  ],
};

describe("Feature 07 notification center", () => {
  it("refreshes page props and exposes failed read actions without losing unread state", async () => {
    const user = userEvent.setup();
    const actions = {
      markAllReadAction: vi.fn().mockRejectedValue(new Error("network")),
      markReadAction: vi.fn().mockResolvedValue({ status: "error", message: "Please try again." }),
    };
    const { rerender } = render(
      <NotificationCenter {...actions} notifications={notifications} propertyId={propertyId} />,
    );
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(
      await screen.findByText("Could not update notifications. Please try again."),
    ).toBeVisible();
    expect(screen.getByText("1 unread")).toBeVisible();
    rerender(
      <NotificationCenter
        {...actions}
        notifications={{ ...notifications, page: 2, notifications: [] }}
        propertyId={propertyId}
      />,
    );
    expect(screen.queryByText("Task needs attention")).not.toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeVisible();
    expect(screen.getByRole("button", { name: "Mark all as read" })).toBeEnabled();
  });

  it("shows an accessible unread bell and navigates to the property notification center", () => {
    render(<NotificationBell propertyId={propertyId} unreadCount={3} />);

    expect(screen.getByRole("link", { name: "Notifications, 3 unread" })).toHaveAttribute(
      "href",
      `/${propertyId}/notifications`,
    );
  });

  it("marks a notice as read with a keyboard-reachable action and preserves safe subject navigation", async () => {
    const user = userEvent.setup();
    const markReadAction = vi.fn(async () => ({
      status: "success" as const,
      message: "Notification marked as read.",
    }));
    render(
      <NotificationCenter
        markAllReadAction={async () => ({
          status: "success",
          message: "Notifications marked as read.",
        })}
        markReadAction={markReadAction}
        notifications={notifications}
        propertyId={propertyId}
      />,
    );

    expect(screen.getByRole("link", { name: "Media library" })).toHaveAttribute(
      "href",
      `/${propertyId}/media`,
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      `/${propertyId}/notifications?page=2`,
    );

    const markRead = screen.getByRole("button", { name: "Mark Task needs attention as read" });
    markRead.focus();
    expect(markRead).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(markReadAction).toHaveBeenCalledWith(notificationId);
    expect(await screen.findByText("Notification marked as read.")).toBeInTheDocument();
    expect(screen.getByText("0 unread")).toBeInTheDocument();
    expect(screen.getAllByText("Read")).toHaveLength(2);
  });
});
