import "server-only";
import { beginFoundationCreate } from "./creation-replay";
import { z } from "zod";
import type { AuthorizedPropertyContext } from "./property-context";
import { auditFoundation, requireChanged, withFoundation } from "./foundation-database";
import { FoundationError } from "./foundation-authorization";

const id = z.string().uuid();
export const propertyServiceSchema = z
  .object({
    id: z.union([id, z.literal("")]).optional(),
    requestId: id.optional(),
    revision: z.coerce.number().int().min(0),
    name: z.string().trim().min(1).max(160),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
    parentServiceId: z.union([id, z.literal("")]).optional(),
    isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  })
  .strict();
export async function listPropertyServices(
  context: AuthorizedPropertyContext,
  query: string = "",
  page = 1,
) {
  const q = z.string().trim().max(160).parse(query);
  const pageNumber = z.number().int().min(1).max(10000).parse(page);
  return withFoundation(context, "property.service.view", async (tx) => {
    const where = {
      propertyId: context.property.id,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    };
    const [records, total] = await Promise.all([
      tx.propertyService.findMany({
        where,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (pageNumber - 1) * 25,
        take: 25,
      }),
      tx.propertyService.count({ where }),
    ]);
    return { records, total, page: pageNumber };
  });
}
export async function getPropertyService(context: AuthorizedPropertyContext, rawId: string) {
  const serviceId = id.parse(rawId);
  return withFoundation(context, "property.service.view", (tx) =>
    tx.propertyService.findFirst({ where: { id: serviceId, propertyId: context.property.id } }),
  );
}
export async function savePropertyService(context: AuthorizedPropertyContext, raw: unknown) {
  const input = propertyServiceSchema.parse(raw);
  return withFoundation(context, "property.service.manage", async (tx) => {
    // Serialize hierarchy edits so concurrent parent changes cannot introduce a cycle.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${context.property.id + ":services"}, 0))`;
    const creation = !input.id
      ? await beginFoundationCreate(tx, context, "property_service.saved", input)
      : null;
    if (creation?.previousId) return { id: creation.previousId };
    const parentServiceId = input.parentServiceId || null;
    let ancestorId = parentServiceId;
    const visited = new Set<string>(input.id ? [input.id] : []);
    while (ancestorId) {
      if (visited.has(ancestorId))
        throw new FoundationError("VALIDATION", "A service cannot be its own ancestor.");
      visited.add(ancestorId);
      const parent = await tx.propertyService.findFirst({
        where: { id: ancestorId, propertyId: context.property.id, isActive: true },
      });
      if (!parent)
        throw new FoundationError("VALIDATION", "Choose an active service from this property.");
      ancestorId = parent.parentServiceId;
    }
    const data = {
      name: input.name,
      normalizedName: input.name.normalize("NFKC").replace(/\s+/g, " ").toLocaleLowerCase("en-US"),
      slug: input.slug,
      parentServiceId,
      isActive: input.isActive,
    };
    let savedId = input.id;
    if (savedId) {
      if (
        !input.isActive &&
        (await tx.propertyService.count({
          where: { propertyId: context.property.id, parentServiceId: savedId, isActive: true },
        }))
      )
        throw new FoundationError("CONFLICT", "Deactivate or move active child services first.");
      requireChanged(
        (
          await tx.propertyService.updateMany({
            where: { id: savedId, propertyId: context.property.id, revision: input.revision },
            data: { ...data, revision: { increment: 1 } },
          })
        ).count,
      );
    } else
      savedId = (
        await tx.propertyService.create({ data: { ...data, propertyId: context.property.id } })
      ).id;
    await auditFoundation(
      tx,
      context,
      "property_service.saved",
      "PropertyService",
      savedId,
      {},
      creation?.command,
    );
    return { id: savedId };
  });
}
