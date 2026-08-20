"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedAppUser } from "@/server/auth/session";
import { revokeMemberAccess, updateMemberAccess } from "@/server/properties/property-users";
import {
  cancelPendingInvitation,
  createPendingInvitation,
} from "@/server/properties/property-invitations";
import {
  initialPropertyUserFormState,
  type PropertyUserFormState,
} from "@/server/properties/property-users-form-state";
import { resolveAuthorizedPropertyContext } from "@/server/properties/property-context";

function textValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function propertyGrants(formData: FormData) {
  return formData
    .getAll("propertyId")
    .filter((propertyId): propertyId is string => typeof propertyId === "string")
    .map((propertyId) => ({
      propertyId,
      roleOverride: textValue(formData, `roleOverride:${propertyId}`) || null,
    }));
}

export async function contextForProperty(propertyId: string) {
  const actor = await requireAuthenticatedAppUser();
  const resolution = await resolveAuthorizedPropertyContext(propertyId);
  if (resolution.status !== "authorized" || resolution.context.user.id !== actor.id) {
    throw new Error("This property is unavailable.");
  }
  return resolution.context;
}

export async function savePropertyUserAccessAction(
  propertyId: string,
  _previousState: PropertyUserFormState = initialPropertyUserFormState,
  formData: FormData,
): Promise<PropertyUserFormState> {
  void _previousState;
  try {
    const context = await contextForProperty(propertyId);
    await updateMemberAccess(context, {
      userId: textValue(formData, "userId"),
      role: textValue(formData, "role"),
      propertyGrants: propertyGrants(formData),
    });
    revalidatePath(`/${propertyId}/settings/users`);
    revalidatePath(`/${propertyId}/overview`);
    return { status: "success", message: "Member access has been saved." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.length < 180
          ? error.message
          : "We could not save member access. Try again.",
    };
  }
}

export async function revokePropertyUserAccessAction(
  propertyId: string,
  _previousState: PropertyUserFormState = initialPropertyUserFormState,
  formData: FormData,
): Promise<PropertyUserFormState> {
  void _previousState;
  try {
    const context = await contextForProperty(propertyId);
    await revokeMemberAccess(context, { userId: textValue(formData, "userId") });
    revalidatePath(`/${propertyId}/settings/users`);
    revalidatePath(`/${propertyId}/overview`);
    return { status: "success", message: "Member access has been suspended." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.length < 180
          ? error.message
          : "We could not suspend member access. Try again.",
    };
  }
}

export async function invitePropertyUserAction(
  propertyId: string,
  _previousState: PropertyUserFormState = initialPropertyUserFormState,
  formData: FormData,
): Promise<PropertyUserFormState> {
  void _previousState;
  try {
    const context = await contextForProperty(propertyId);
    const result = await createPendingInvitation(context, {
      email: textValue(formData, "email"),
      role: textValue(formData, "role"),
      propertyGrants: propertyGrants(formData),
    });
    revalidatePath(`/${propertyId}/settings/users`);
    revalidatePath(`/${propertyId}/overview`);
    return {
      status: "success",
      message:
        result.kind === "granted"
          ? "This verified BTLS user received access immediately."
          : "Invitation created. Access will activate only after Supabase verifies the user.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.length < 180
          ? error.message
          : "We could not create this invitation. Try again.",
    };
  }
}

export async function cancelPropertyInvitationAction(
  propertyId: string,
  _previousState: PropertyUserFormState = initialPropertyUserFormState,
  formData: FormData,
): Promise<PropertyUserFormState> {
  void _previousState;
  try {
    const context = await contextForProperty(propertyId);
    await cancelPendingInvitation(context, textValue(formData, "invitationId"));
    revalidatePath(`/${propertyId}/settings/users`);
    return { status: "success", message: "Invitation cancelled. It cannot activate access." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.length < 180
          ? error.message
          : "We could not cancel this invitation. Try again.",
    };
  }
}
