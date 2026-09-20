import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
import { FoundationError } from "@/server/properties/foundation-authorization";
import {
  auditFoundation,
  requireChanged,
  withFoundation,
} from "@/server/properties/foundation-database";
import {
  createCustomerSchema,
  customerUpdateSchema,
  identifier,
  listSchema,
  normalizeName,
} from "../schemas/foundation";

export type MatchCandidate = { id: string; displayName: string; reason: string };
export type SaveResult = { id: string } | { candidates: MatchCandidate[]; reviewToken: string };
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export async function lockCustomerChanges(tx: Prisma.TransactionClient, propertyId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${propertyId + ":customers"},0))`;
}
export async function requireCustomer(
  tx: Prisma.TransactionClient,
  propertyId: string,
  customerId: string,
) {
  const record = await tx.customer.findFirst({ where: { id: customerId, propertyId } });
  if (!record) throw new FoundationError("NOT_FOUND", "This customer is unavailable.");
  return record;
}
export async function reviewMatches(
  tx: Prisma.TransactionClient,
  propertyId: string,
  input: { displayName?: string; email: string | null; phoneE164: string | null },
  excludeContactId?: string,
) {
  const endpoints: Prisma.ContactWhereInput[] = [];
  if (input.email) endpoints.push({ normalizedEmail: input.email.toLowerCase() });
  if (input.phoneE164) endpoints.push({ phoneE164: input.phoneE164 });
  const records = await tx.customer.findMany({
    where: {
      propertyId,
      OR: [
        ...(input.displayName ? [{ normalizedName: normalizeName(input.displayName) }] : []),
        ...(endpoints.length
          ? [
              {
                contacts: {
                  some: {
                    ...(excludeContactId ? { id: { not: excludeContactId } } : {}),
                    OR: endpoints,
                  },
                },
              },
            ]
          : []),
      ],
    },
    orderBy: { id: "asc" },
    take: 21,
    select: {
      id: true,
      displayName: true,
      normalizedName: true,
      revision: true,
      updatedAt: true,
      contacts: {
        where: { ...(excludeContactId ? { id: { not: excludeContactId } } : {}), OR: endpoints },
        take: 21,
        orderBy: { id: "asc" },
        select: { id: true, revision: true, normalizedEmail: true, phoneE164: true },
      },
    },
  });
  if (records.length > 20)
    throw new FoundationError(
      "CONFLICT",
      "Too many possible matches. Search the customer directory and refine the information before creating a record.",
    );
  return {
    candidates: records.map((record) => ({
      id: record.id,
      displayName: record.displayName,
      reason:
        [
          input.displayName && record.normalizedName === normalizeName(input.displayName)
            ? "Same customer name"
            : null,
          input.email &&
          record.contacts.some((contact) => contact.normalizedEmail === input.email?.toLowerCase())
            ? "Same email address"
            : null,
          input.phoneE164 &&
          record.contacts.some((contact) => contact.phoneE164 === input.phoneE164)
            ? "Same phone number"
            : null,
        ]
          .filter(Boolean)
          .join("; ") + ". Review identity before continuing.",
    })),
    reviewToken: hash({ input, records }),
  };
}
export async function createCustomer(
  context: AuthorizedPropertyContext,
  raw: unknown,
): Promise<SaveResult> {
  const input = createCustomerSchema.parse(raw);
  const fingerprint = hash({
    displayName: input.displayName,
    personName: input.personName,
    email: input.email,
    phone: input.phone,
  });
  return withFoundation(context, "customer.manage", async (tx) => {
    await lockCustomerChanges(tx, context.property.id);
    const previous = await tx.customer.findUnique({
      where: {
        propertyId_createActorId_createRequestId: {
          propertyId: context.property.id,
          createActorId: context.user.id,
          createRequestId: input.requestId,
        },
      },
    });
    if (previous) {
      if (previous.createFingerprint !== fingerprint)
        throw new FoundationError(
          "CONFLICT",
          "This request was already saved with different information. Reload before creating another customer.",
        );
      return { id: previous.id };
    }
    const review = await reviewMatches(tx, context.property.id, {
      displayName: input.displayName,
      email: input.email,
      phoneE164: input.phone.phoneE164,
    });
    if (
      review.candidates.length &&
      (!input.confirmSeparate || input.reviewToken !== review.reviewToken)
    )
      return review;
    const customer = await tx.customer.create({
      data: {
        propertyId: context.property.id,
        displayName: input.displayName,
        normalizedName: normalizeName(input.displayName),
        createActorId: context.user.id,
        createRequestId: input.requestId,
        createFingerprint: fingerprint,
      },
    });
    await tx.contact.create({
      data: {
        propertyId: context.property.id,
        customerId: customer.id,
        personName: input.personName,
        email: input.email,
        normalizedEmail: input.email?.toLowerCase() ?? null,
        ...input.phone,
        isPrimary: true,
      },
    });
    await auditFoundation(tx, context, "customer.created", "Customer", customer.id, {
      duplicateReviewed: review.candidates.length > 0,
      matchedCustomerIds: review.candidates.map((candidate) => candidate.id),
    });
    return { id: customer.id };
  });
}
export async function updateCustomer(context: AuthorizedPropertyContext, raw: unknown) {
  const input = customerUpdateSchema.parse(raw);
  return withFoundation(context, "customer.manage", async (tx) => {
    await lockCustomerChanges(tx, context.property.id);
    requireChanged(
      (
        await tx.customer.updateMany({
          where: { id: input.id, propertyId: context.property.id, revision: input.revision },
          data: {
            displayName: input.displayName,
            normalizedName: normalizeName(input.displayName),
            relationshipState: input.relationshipState,
            revision: { increment: 1 },
          },
        })
      ).count,
    );
    await auditFoundation(tx, context, "customer.updated", "Customer", input.id, {
      relationshipState: input.relationshipState,
    });
    return { id: input.id };
  });
}
export async function listCustomers(context: AuthorizedPropertyContext, raw: unknown = {}) {
  const input = listSchema.parse(raw);
  return withFoundation(context, "customer.view", async (tx) => {
    const where: Prisma.CustomerWhereInput = {
      propertyId: context.property.id,
      ...(["PROSPECT", "CURRENT", "INACTIVE"].includes(input.status)
        ? { relationshipState: input.status as "PROSPECT" | "CURRENT" | "INACTIVE" }
        : {}),
      ...(input.q
        ? {
            OR: [
              { displayName: { contains: input.q, mode: "insensitive" } },
              {
                contacts: {
                  some: {
                    OR: [
                      { personName: { contains: input.q, mode: "insensitive" } },
                      { normalizedEmail: { contains: input.q.toLowerCase() } },
                      { phoneE164: { contains: input.q } },
                      { phoneDisplay: { contains: input.q } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };
    const [records, total] = await Promise.all([
      tx.customer.findMany({
        where,
        orderBy: [{ displayName: "asc" }, { id: "asc" }],
        skip: (input.page - 1) * 25,
        take: 25,
        include: { contacts: { where: { isPrimary: true, isActive: true }, take: 1 } },
      }),
      tx.customer.count({ where }),
    ]);
    return {
      records: records.map(
        ({
          createActorId: _actor,
          createRequestId: _request,
          createFingerprint: _fingerprint,
          ...record
        }) => {
          void _actor;
          void _request;
          void _fingerprint;
          return record;
        },
      ),
      total,
      page: input.page,
    };
  });
}
export const detailSectionSchema = z.enum(["contacts", "locations", "assets", "tags"]);
export async function getCustomerDetail(
  context: AuthorizedPropertyContext,
  rawId: string,
  rawSection: string = "contacts",
  page = 1,
) {
  const id = identifier.parse(rawId);
  const section = detailSectionSchema.parse(rawSection);
  const pageNumber = z.number().int().min(1).max(10000).parse(page);
  return withFoundation(context, "customer.view", async (tx) => {
    const record = await requireCustomer(tx, context.property.id, id);
    const where = { propertyId: context.property.id, customerId: id };
    const paging = { skip: (pageNumber - 1) * 25, take: 25 };
    const [primaryContact, contacts, locations, assets, tags, total] = await Promise.all([
      tx.contact.findFirst({ where: { ...where, isActive: true, isPrimary: true } }),
      section === "contacts"
        ? tx.contact.findMany({ where, ...paging, orderBy: [{ personName: "asc" }, { id: "asc" }] })
        : [],
      section === "locations"
        ? tx.serviceLocation.findMany({
            where,
            ...paging,
            orderBy: [{ name: "asc" }, { id: "asc" }],
          })
        : [],
      section === "assets"
        ? tx.serviceAsset.findMany({
            where,
            ...paging,
            orderBy: [{ name: "asc" }, { id: "asc" }],
            include: { location: { select: { name: true } } },
          })
        : [],
      section === "tags"
        ? tx.tag.findMany({
            where: { propertyId: context.property.id },
            ...paging,
            orderBy: [{ name: "asc" }, { id: "asc" }],
            include: { assignments: { where: { customerId: id }, select: { customerId: true } } },
          })
        : [],
      section === "contacts"
        ? tx.contact.count({ where })
        : section === "locations"
          ? tx.serviceLocation.count({ where })
          : section === "assets"
            ? tx.serviceAsset.count({ where })
            : tx.tag.count({ where: { propertyId: context.property.id } }),
    ]);
    return {
      customer: {
        id: record.id,
        displayName: record.displayName,
        relationshipState: record.relationshipState,
        revision: record.revision,
      },
      primaryContact,
      contacts,
      locations,
      assets,
      tags,
      total,
      page: pageNumber,
      section,
    };
  });
}
