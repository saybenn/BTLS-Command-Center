"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedAppUser } from "@/server/auth/session";
import {
  markAllPropertyNotificationsRead,
  markPropertyNotificationRead,
} from "@/server/notifications/notifications";
import { resolveAuthorizedPropertyContext } from "@/server/properties/property-context";

async function contextForProperty(propertyId: string) {
  const actor = await requireAuthenticatedAppUser();
  const resolution = await resolveAuthorizedPropertyContext(propertyId);
  if (resolution.status !== "authorized" || resolution.context.user.id !== actor.id) {
    throw new Error("This property is unavailable.");
  }
  return resolution.context;
}

export async function markNotificationReadAction(
  propertyId: string,
  notificationId: string,
): Promise<{ message: string; status: "error" | "success" }> {
  try {
    const context = await contextForProperty(propertyId);
    const marked = await markPropertyNotificationRead(context, { propertyId, notificationId });
    revalidatePath(`/${propertyId}/notifications`);
    revalidatePath(`/${propertyId}/overview`);
    return {
      status: "success",
      message: marked ? "Notification marked as read." : "Notification was already read.",
    };
  } catch {
    return { status: "error", message: "We could not update this notification. Try again." };
  }
}

export async function markAllNotificationsReadAction(
  propertyId: string,
): Promise<{ message: string; status: "error" | "success" }> {
  try {
    const context = await contextForProperty(propertyId);
    const count = await markAllPropertyNotificationsRead(context, { propertyId });
    revalidatePath(`/${propertyId}/notifications`);
    revalidatePath(`/${propertyId}/overview`);
    return {
      status: "success",
      message:
        count === 0 ? "There were no unread notifications." : "Notifications marked as read.",
    };
  } catch {
    return { status: "error", message: "We could not update notifications. Try again." };
  }
}
