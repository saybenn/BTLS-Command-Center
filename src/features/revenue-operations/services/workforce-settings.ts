import "server-only";
import { beginFoundationCreate } from "@/server/properties/creation-replay";
import { z } from "zod";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import { FoundationError } from "@/server/properties/foundation-authorization";
import {
  withFoundation,
  auditFoundation,
  requireChanged,
} from "@/server/properties/foundation-database";
import { employeeSchema, settingsSchema, listSchema, identifier } from "../schemas/foundation";

export async function listEmployees(context: AuthorizedPropertyContext, raw: unknown = {}) {
  const input = listSchema.parse(raw);
  return withFoundation(context, "employee.view", async (tx) => {
    const where = {
      propertyId: context.property.id,
      ...(input.q ? { displayName: { contains: input.q, mode: "insensitive" as const } } : {}),
      ...(input.status === "active"
        ? { isActive: true }
        : input.status === "inactive"
          ? { isActive: false }
          : {}),
    };
    const [records, total] = await Promise.all([
      tx.employeeProfile.findMany({
        where,
        orderBy: [{ displayName: "asc" }, { id: "asc" }],
        skip: (input.page - 1) * 25,
        take: 25,
      }),
      tx.employeeProfile.count({ where }),
    ]);
    return { records, total, page: input.page };
  });
}
export async function getEmployee(context: AuthorizedPropertyContext, rawId: string) {
  const id = identifier.parse(rawId);
  return withFoundation(context, "employee.view", async (tx) => {
    const record = await tx.employeeProfile.findFirst({
      where: { id, propertyId: context.property.id },
    });
    if (!record) throw new FoundationError("NOT_FOUND", "This employee is unavailable.");
    return record;
  });
}
export async function saveEmployee(context: AuthorizedPropertyContext, raw: unknown) {
  const input = employeeSchema.parse(raw);
  return withFoundation(context, "employee.manage", async (tx) => {
    const creation = !input.id
      ? await beginFoundationCreate(tx, context, "employee_profile.saved", input)
      : null;
    if (creation?.previousId) return { id: creation.previousId };
    if (
      input.appUserId &&
      !(await tx.propertyAccess.findFirst({
        where: {
          propertyId: context.property.id,
          membership: { userId: input.appUserId, status: "ACTIVE", user: { status: "ACTIVE" } },
        },
      }))
    )
      throw new FoundationError(
        "VALIDATION",
        "Choose an active user with explicit access to this property. Employee profiles do not grant login access.",
      );
    const data = {
      displayName: input.displayName,
      jobTitle: input.jobTitle,
      appUserId: input.appUserId,
      isActive: input.isActive,
    };
    let id = input.id;
    if (id)
      requireChanged(
        (
          await tx.employeeProfile.updateMany({
            where: { id, propertyId: context.property.id, revision: input.revision },
            data: { ...data, revision: { increment: 1 } },
          })
        ).count,
      );
    else
      id = (await tx.employeeProfile.create({ data: { ...data, propertyId: context.property.id } }))
        .id;
    await auditFoundation(
      tx,
      context,
      "employee_profile.saved",
      "EmployeeProfile",
      id,
      {
        linkedUserId: input.appUserId,
        isActive: input.isActive,
      },
      creation?.command,
    );
    return { id };
  });
}
export async function getRevenueSettings(context: AuthorizedPropertyContext) {
  return withFoundation(context, "revenue.settings.view", async (tx) => {
    const record = await tx.revenueOperationsSettings.findUnique({
      where: { propertyId: context.property.id },
      include: {
        sendingIdentity: { select: { id: true, displayName: true, mode: true, status: true } },
      },
    });
    return (
      record ?? {
        propertyId: context.property.id,
        defaultSendingIdentityId: null,
        reviewRequestDelayDays: null,
        revision: 0,
        sendingIdentity: null,
      }
    );
  });
}
export async function saveRevenueSettings(context: AuthorizedPropertyContext, raw: unknown) {
  const input = settingsSchema.parse(raw);
  return withFoundation(context, "revenue.settings.manage", async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${context.property.id + ":revenue-settings"},0))`;
    if (
      input.defaultSendingIdentityId &&
      !(await tx.sendingIdentity.findFirst({
        where: {
          id: input.defaultSendingIdentityId,
          propertyId: context.property.id,
          mode: "BTLS_MANAGED",
          status: "ACTIVE",
        },
      }))
    )
      throw new FoundationError(
        "VALIDATION",
        "Choose an active, supported sender from this property or leave the default unset.",
      );
    const current = await tx.revenueOperationsSettings.findUnique({
      where: { propertyId: context.property.id },
    });
    if ((current?.revision ?? 0) !== input.revision)
      throw new FoundationError("CONFLICT", "Settings changed. Reload before saving.");
    const data = {
      defaultSendingIdentityId: input.defaultSendingIdentityId,
      reviewRequestDelayDays: input.reviewRequestDelayDays,
    };
    if (current)
      await tx.revenueOperationsSettings.update({
        where: { propertyId: context.property.id },
        data: { ...data, revision: { increment: 1 } },
      });
    else
      await tx.revenueOperationsSettings.create({
        data: { ...data, propertyId: context.property.id },
      });
    await auditFoundation(
      tx,
      context,
      "revenue_settings.saved",
      "RevenueOperationsSettings",
      context.property.id,
    );
    return { id: context.property.id };
  });
}
const lookupSchema = z
  .object({
    kind: z.enum(["user", "location", "service", "sender"]),
    q: z.string().trim().max(160),
    customerId: identifier.optional(),
  })
  .strict();
export async function lookupFoundation(context: AuthorizedPropertyContext, raw: unknown) {
  const input = lookupSchema.parse(raw);
  const capability =
    input.kind === "user"
      ? "employee.manage"
      : input.kind === "location"
        ? "customer.manage"
        : input.kind === "service"
          ? "property.service.manage"
          : "revenue.settings.manage";
  return withFoundation(context, capability, async (tx) => {
    const propertyId = context.property.id;
    const search = { contains: input.q, mode: "insensitive" as const };
    if (input.kind === "user") {
      const grants = await tx.propertyAccess.findMany({
        where: {
          propertyId,
          membership: {
            status: "ACTIVE",
            user: { status: "ACTIVE", OR: [{ displayName: search }, { email: search }] },
          },
        },
        take: 20,
        orderBy: { id: "asc" },
        select: {
          membership: {
            select: { user: { select: { id: true, displayName: true, email: true } } },
          },
        },
      });
      return grants.map(({ membership: { user } }) => ({
        value: user.id,
        label: user.displayName ?? user.email,
      }));
    }
    if (input.kind === "location") {
      if (!input.customerId) throw new FoundationError("VALIDATION", "Choose a customer first.");
      return (
        await tx.serviceLocation.findMany({
          where: { propertyId, customerId: input.customerId, isActive: true, name: search },
          take: 20,
          orderBy: [{ name: "asc" }, { id: "asc" }],
          select: { id: true, name: true },
        })
      ).map((row) => ({ value: row.id, label: row.name }));
    }
    if (input.kind === "service")
      return (
        await tx.propertyService.findMany({
          where: { propertyId, isActive: true, name: search },
          take: 20,
          orderBy: [{ name: "asc" }, { id: "asc" }],
          select: { id: true, name: true },
        })
      ).map((row) => ({ value: row.id, label: row.name }));
    return (
      await tx.sendingIdentity.findMany({
        where: { propertyId, mode: "BTLS_MANAGED", status: "ACTIVE", displayName: search },
        take: 20,
        orderBy: [{ displayName: "asc" }, { id: "asc" }],
        select: { id: true, displayName: true },
      })
    ).map((row) => ({ value: row.id, label: row.displayName }));
  });
}
