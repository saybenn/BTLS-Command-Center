import { describe, expect, it } from "vitest";

import {
  createNotificationFixture,
  notificationIds as ids,
  notificationContext as context,
} from "../../fixtures/feature-07-notifications";
import {
  createNotification,
  listPropertyNotifications,
  markAllPropertyNotificationsRead,
  markPropertyNotificationRead,
  resolveNotificationSubject,
  resolvePropertyNotificationDestination,
} from "@/server/notifications/notifications";

describe("Feature 07 notification service", () => {
  it("denies other recipients and handles deleted, unsupported, and unavailable destinations", async () => {
    const { dependencies, records } = createNotificationFixture();
    const input = { propertyId: ids.property, notificationId: ids.notificationTwo };
    dependencies.canOpenMedia = async () => false;
    await expect(
      resolvePropertyNotificationDestination(context, input, dependencies),
    ).resolves.toBeNull();
    records[1].subjectType = "future.unknown";
    await expect(
      resolvePropertyNotificationDestination(context, input, dependencies),
    ).resolves.toBeNull();
    await expect(
      resolvePropertyNotificationDestination(
        context,
        { ...input, notificationId: "00000000-0000-4000-8000-000000000012" },
        dependencies,
      ),
    ).resolves.toBeNull();
    dependencies.resolveRecipientContext = async () => null;
    await expect(
      listPropertyNotifications(context, { propertyId: ids.property }, dependencies),
    ).rejects.toThrow("unavailable");
    await expect(
      resolvePropertyNotificationDestination(context, input, dependencies),
    ).rejects.toThrow("unavailable");
  });

  it("lists only the signed-in recipient's notices and resolves typed subject links safely", async () => {
    const { dependencies } = createNotificationFixture();
    const page = await listPropertyNotifications(
      context,
      { propertyId: ids.property, page: 1, pageSize: 20 },
      dependencies,
    );

    expect(page).toMatchObject({ total: 2, unreadCount: 1, totalPages: 1 });
    expect(page.notifications.map((notification) => notification.id)).toEqual([
      ids.notificationOne,
      ids.notificationTwo,
    ]);
    expect(page.notifications[0].subject).toEqual({
      type: "job_execution",
      label: "Background operation details unavailable",
    });
    expect(page.notifications[1].subject).toEqual({
      type: "media.asset",
      label: "Media library",
      href: `/${ids.property}/notifications/${ids.notificationTwo}/open`,
    });
    expect(
      await resolveNotificationSubject(
        context,
        {
          type: "property.overview",
          id: ids.anotherProperty,
        },
        dependencies,
      ),
    ).toBeNull();
  });

  it("does not allow cross-property or cross-recipient read updates", async () => {
    const { dependencies, records } = createNotificationFixture();

    await expect(
      markPropertyNotificationRead(
        context,
        { propertyId: ids.anotherProperty, notificationId: ids.notificationOne },
        dependencies,
      ),
    ).rejects.toThrow("This property is unavailable.");

    await expect(
      markPropertyNotificationRead(
        context,
        { propertyId: ids.property, notificationId: "00000000-0000-4000-8000-000000000012" },
        dependencies,
      ),
    ).resolves.toBe(false);

    await expect(
      markPropertyNotificationRead(
        context,
        { propertyId: ids.property, notificationId: ids.notificationOne },
        dependencies,
      ),
    ).resolves.toBe(true);
    expect(records.find((record) => record.id === ids.notificationOne)?.readAt).toEqual(
      dependencies.now(),
    );

    await expect(
      markAllPropertyNotificationsRead(context, { propertyId: ids.property }, dependencies),
    ).resolves.toBe(0);
  });

  it("creates a deduplicated persistent notification without accepting a subject URL", async () => {
    const { dependencies } = createNotificationFixture();
    const input = {
      propertyId: ids.property,
      recipientUserId: ids.user,
      source: "system",
      correlationId: ids.notificationOne,
      type: "system.test",
      title: "A safe notification",
      body: "This is a durable in-app notice.",
      deduplicationKey: "safe-notice",
      subject: { type: "property.overview", id: ids.property },
    };

    const first = await createNotification(input, dependencies);
    const duplicate = await createNotification(input, dependencies);

    expect(first.notification).toMatchObject({
      source: "system",
      correlationId: ids.notificationOne,
    });
    await expect(
      createNotification({ ...input, correlationId: ids.notificationTwo }, dependencies),
    ).rejects.toThrow("conflicting context");
    await expect(
      resolvePropertyNotificationDestination(
        context,
        { propertyId: ids.property, notificationId: first.notification.id },
        dependencies,
      ),
    ).resolves.toBe(`/${ids.property}/overview`);
    expect(first.created).toBe(true);
    expect(duplicate).toEqual({ created: false, notification: first.notification });
    expect(first.notification.subject).toEqual({
      type: "property.overview",
      label: "Property overview",
      href: `/${ids.property}/notifications/${first.notification.id}/open`,
    });
  });
});
