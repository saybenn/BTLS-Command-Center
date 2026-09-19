import "server-only";
import { beginFoundationCreate } from "@/server/properties/creation-replay";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import { FoundationError } from "@/server/properties/foundation-authorization";
import {
  withFoundation,
  auditFoundation,
  requireChanged,
} from "@/server/properties/foundation-database";
import {
  contactSchema,
  locationSchema,
  assetSchema,
  tagSchema,
  tagAssignmentSchema,
  normalizeName,
} from "../schemas/foundation";
import { lockCustomerChanges, requireCustomer, reviewMatches, type SaveResult } from "./customers";
import { z } from "zod";

const reviewedContactSchema = contactSchema.extend({
  confirmSeparate: z.boolean().optional(),
  reviewToken: z.string().optional(),
});
export async function saveContact(
  context: AuthorizedPropertyContext,
  raw: unknown,
): Promise<SaveResult> {
  const input = reviewedContactSchema.parse(raw);
  return withFoundation(context, "customer.manage", async (tx) => {
    await lockCustomerChanges(tx, context.property.id);
    const creation = !input.id
      ? await beginFoundationCreate(tx, context, "contact.saved", input)
      : null;
    if (creation?.previousId) return { id: creation.previousId };
    await requireCustomer(tx, context.property.id, input.customerId);
    const where = { propertyId: context.property.id, customerId: input.customerId };
    const previous = input.id
      ? await tx.contact.findFirst({ where: { ...where, id: input.id } })
      : null;
    if (input.id && !previous)
      throw new FoundationError("NOT_FOUND", "This contact is unavailable.");
    if (previous && previous.revision !== input.revision)
      throw new FoundationError("CONFLICT", "This contact changed. Reload before saving.");
    const email = input.email?.toLowerCase() ?? null;
    if (
      !previous ||
      previous.normalizedEmail !== email ||
      previous.phoneE164 !== input.phone.phoneE164
    ) {
      const review = await reviewMatches(
        tx,
        context.property.id,
        { email, phoneE164: input.phone.phoneE164 },
        input.id ?? undefined,
      );
      if (
        review.candidates.length &&
        (!input.confirmSeparate || input.reviewToken !== review.reviewToken)
      )
        return review;
    }
    if (input.isPrimary && !input.isActive)
      throw new FoundationError("VALIDATION", "An inactive contact cannot be primary.");
    if (previous?.isPrimary && !input.isPrimary && input.isActive)
      throw new FoundationError("VALIDATION", "Choose another primary contact instead.");
    const data = {
      personName: input.personName,
      email: input.email,
      normalizedEmail: email,
      ...input.phone,
      isActive: input.isActive,
      isPrimary: input.isPrimary,
    };
    if (input.isPrimary)
      await tx.contact.updateMany({
        where: { ...where, isPrimary: true, ...(input.id ? { id: { not: input.id } } : {}) },
        data: { isPrimary: false, revision: { increment: 1 } },
      });
    let id = input.id;
    if (id)
      requireChanged(
        (
          await tx.contact.updateMany({
            where: { ...where, id, revision: input.revision },
            data: { ...data, revision: { increment: 1 } },
          })
        ).count,
      );
    else id = (await tx.contact.create({ data: { ...where, ...data } })).id;
    if (!(await tx.contact.count({ where: { ...where, isActive: true, isPrimary: true } }))) {
      const replacement = await tx.contact.findFirst({
        where: { ...where, isActive: true },
        orderBy: { createdAt: "asc" },
      });
      if (!replacement)
        throw new FoundationError(
          "VALIDATION",
          "Keep at least one active person contact for this customer.",
        );
      await tx.contact.update({
        where: {
          id: replacement.id,
          propertyId: context.property.id,
          customerId: input.customerId,
        },
        data: { isPrimary: true, revision: { increment: 1 } },
      });
    }
    await tx.customer.update({
      where: { id: input.customerId, propertyId: context.property.id },
      data: { revision: { increment: 1 } },
    });
    await auditFoundation(
      tx,
      context,
      "contact.saved",
      "Contact",
      id,
      {
        customerId: input.customerId,
        duplicateReviewed: input.confirmSeparate === true,
      },
      creation?.command,
    );
    return { id };
  });
}
export async function saveLocation(context: AuthorizedPropertyContext, raw: unknown) {
  const input = locationSchema.parse(raw);
  return withFoundation(context, "customer.manage", async (tx) => {
    await lockCustomerChanges(tx, context.property.id);
    const creation = !input.id
      ? await beginFoundationCreate(tx, context, "service_location.saved", input)
      : null;
    if (creation?.previousId) return { id: creation.previousId };
    await requireCustomer(tx, context.property.id, input.customerId);
    const where = { propertyId: context.property.id, customerId: input.customerId };
    if (input.isDefault && !input.isActive)
      throw new FoundationError("VALIDATION", "An inactive location cannot be the default.");
    if (
      input.id &&
      !input.isActive &&
      (await tx.serviceAsset.count({
        where: { ...where, serviceLocationId: input.id, isActive: true },
      }))
    )
      throw new FoundationError(
        "CONFLICT",
        "Move or deactivate this location's active equipment first.",
      );
    if (input.isDefault)
      await tx.serviceLocation.updateMany({
        where: { ...where, isDefault: true, ...(input.id ? { id: { not: input.id } } : {}) },
        data: { isDefault: false, revision: { increment: 1 } },
      });
    const {
      id: inputId,
      revision: _revision,
      requestId: _requestId,
      customerId: _customer,
      ...data
    } = input;
    void _revision;
    void _requestId;
    void _customer;
    let id = inputId;
    if (id)
      requireChanged(
        (
          await tx.serviceLocation.updateMany({
            where: { ...where, id, revision: input.revision },
            data: { ...data, revision: { increment: 1 } },
          })
        ).count,
      );
    else id = (await tx.serviceLocation.create({ data: { ...where, ...data } })).id;
    await auditFoundation(
      tx,
      context,
      "service_location.saved",
      "ServiceLocation",
      id,
      {
        customerId: input.customerId,
      },
      creation?.command,
    );
    return { id };
  });
}
export async function saveAsset(context: AuthorizedPropertyContext, raw: unknown) {
  const input = assetSchema.parse(raw);
  return withFoundation(context, "customer.manage", async (tx) => {
    await lockCustomerChanges(tx, context.property.id);
    const creation = !input.id
      ? await beginFoundationCreate(tx, context, "service_asset.saved", input)
      : null;
    if (creation?.previousId) return { id: creation.previousId };
    await requireCustomer(tx, context.property.id, input.customerId);
    const where = { propertyId: context.property.id, customerId: input.customerId };
    if (
      input.serviceLocationId &&
      !(await tx.serviceLocation.findFirst({
        where: { ...where, id: input.serviceLocationId, isActive: true },
      }))
    )
      throw new FoundationError(
        "VALIDATION",
        "Choose an active location belonging to this customer.",
      );
    const {
      id: inputId,
      revision: _revision,
      requestId: _requestId,
      customerId: _customer,
      ...data
    } = input;
    void _revision;
    void _requestId;
    void _customer;
    let id = inputId;
    if (id)
      requireChanged(
        (
          await tx.serviceAsset.updateMany({
            where: { ...where, id, revision: input.revision },
            data: { ...data, revision: { increment: 1 } },
          })
        ).count,
      );
    else id = (await tx.serviceAsset.create({ data: { ...where, ...data } })).id;
    await auditFoundation(
      tx,
      context,
      "service_asset.saved",
      "ServiceAsset",
      id,
      {
        customerId: input.customerId,
      },
      creation?.command,
    );
    return { id };
  });
}
export async function saveTag(context: AuthorizedPropertyContext, raw: unknown) {
  const input = tagSchema.parse(raw);
  return withFoundation(context, "customer.manage", async (tx) => {
    const creation = !input.id
      ? await beginFoundationCreate(tx, context, "tag.saved", input)
      : null;
    if (creation?.previousId) return { id: creation.previousId };
    const data = {
      name: input.name,
      normalizedName: normalizeName(input.name),
      isActive: input.isActive,
    };
    let id = input.id;
    if (id)
      requireChanged(
        (
          await tx.tag.updateMany({
            where: { id, propertyId: context.property.id, revision: input.revision },
            data: { ...data, revision: { increment: 1 } },
          })
        ).count,
      );
    else id = (await tx.tag.create({ data: { ...data, propertyId: context.property.id } })).id;
    await auditFoundation(tx, context, "tag.saved", "Tag", id, {}, creation?.command);
    return { id };
  });
}
export async function assignTag(context: AuthorizedPropertyContext, raw: unknown) {
  const input = tagAssignmentSchema.parse(raw);
  return withFoundation(context, "customer.manage", async (tx) => {
    await requireCustomer(tx, context.property.id, input.customerId);
    const tag = await tx.tag.findFirst({
      where: { id: input.tagId, propertyId: context.property.id },
    });
    if (!tag || (input.assigned && !tag.isActive))
      throw new FoundationError("VALIDATION", "Choose an active tag in this property.");
    const key = {
      propertyId: context.property.id,
      customerId: input.customerId,
      tagId: input.tagId,
    };
    if (input.assigned)
      await tx.customerTag.upsert({
        where: { propertyId_customerId_tagId: key },
        create: key,
        update: {},
      });
    else await tx.customerTag.deleteMany({ where: key });
    await auditFoundation(
      tx,
      context,
      input.assigned ? "customer.tag_assigned" : "customer.tag_removed",
      "Customer",
      input.customerId,
      { tagId: input.tagId },
    );
    return { id: input.customerId };
  });
}
