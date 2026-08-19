import "server-only";

import { z } from "zod";

import type { AppUser, ClientPropertyStatus, PlatformRole } from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";

import { requirePlatformCapability } from "../auth/permissions";

const propertyIdSchema = z.string().uuid();
const pageSize = 20;

export const propertyDirectoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().trim().max(100).default(""),
  status: z.enum(["ALL", "ACTIVE", "SUSPENDED"]).default("ALL"),
});

const domainSchema = z
  .string()
  .trim()
  .max(253, "Domain must be 253 characters or fewer.")
  .transform((value) => value.toLowerCase())
  .refine(
    (value) =>
      value.length === 0 || /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(value),
    "Enter a valid domain, such as example.com.",
  )
  .transform((value) => value || null);

export const accountPropertyOnboardingSchema = z.object({
  accountName: z.string().trim().min(2, "Account name must be at least 2 characters.").max(120),
  domain: domainSchema,
  propertyName: z.string().trim().min(2, "Property name must be at least 2 characters.").max(120),
});

export const propertyStatusChangeSchema = z.object({
  propertyId: propertyIdSchema,
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const accountStatusChangeSchema = z.object({
  accountId: propertyIdSchema,
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export type PropertyDirectoryQuery = z.infer<typeof propertyDirectoryQuerySchema>;
export type AccountPropertyOnboardingInput = z.infer<typeof accountPropertyOnboardingSchema>;
export type PropertyDirectoryResult = {
  items: Array<{
    account: { id: string; name: string; status: ClientPropertyStatus };
    domain: string | null;
    id: string;
    name: string;
    status: ClientPropertyStatus;
  }>;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type PlatformActor = Pick<AppUser, "id" | "platformRole">;
type DirectoryDatabase = Pick<typeof prisma, "clientProperty">;
type OnboardingDatabase = Pick<typeof prisma, "$transaction">;

function requirePropertyDirectoryRead(actor: PlatformActor): void {
  requirePlatformCapability(
    actor as { platformRole: PlatformRole | null },
    "platform.property.read",
  );
}

function requirePropertyManagement(actor: PlatformActor): void {
  requirePlatformCapability(
    actor as { platformRole: PlatformRole | null },
    "platform.property.manage",
  );
}

export function parsePropertyDirectoryQuery(input: unknown): PropertyDirectoryQuery {
  return propertyDirectoryQuerySchema.parse(input);
}

export async function listAdminProperties(
  actor: PlatformActor,
  input: unknown,
  database: DirectoryDatabase = prisma,
): Promise<PropertyDirectoryResult> {
  requirePropertyDirectoryRead(actor);
  const query = parsePropertyDirectoryQuery(input);
  const where = {
    ...(query.status === "ALL" ? {} : { status: query.status }),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { domain: { contains: query.search, mode: "insensitive" as const } },
            { account: { name: { contains: query.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const total = await database.clientProperty.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page, totalPages);
  const properties = await database.clientProperty.findMany({
    where,
    include: { account: true },
    orderBy: [{ account: { name: "asc" } }, { name: "asc" }, { id: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    items: properties.map((property) => ({
      id: property.id,
      name: property.name,
      domain: property.domain,
      status: property.status,
      account: {
        id: property.account.id,
        name: property.account.name,
        status: property.account.status,
      },
    })),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function onboardAccountProperty(
  actor: PlatformActor,
  input: unknown,
  database: OnboardingDatabase = prisma,
) {
  requirePropertyManagement(actor);
  const data = accountPropertyOnboardingSchema.parse(input);

  return database.$transaction(async (transaction) => {
    // Active status is explicit onboarding default. No future settings model is fabricated here.
    const account = await transaction.clientAccount.create({
      data: { name: data.accountName, status: "ACTIVE" },
    });
    const property = await transaction.clientProperty.create({
      data: {
        accountId: account.id,
        name: data.propertyName,
        domain: data.domain,
        status: "ACTIVE",
      },
    });
    await transaction.auditEvent.createMany({
      data: [
        {
          actorId: actor.id,
          accountId: account.id,
          propertyId: null,
          action: "account.created",
          subjectType: "ClientAccount",
          subjectId: account.id,
        },
        {
          actorId: actor.id,
          accountId: account.id,
          propertyId: property.id,
          action: "property.created",
          subjectType: "ClientProperty",
          subjectId: property.id,
        },
      ],
    });

    return { account, property };
  });
}

export async function changePropertyStatus(
  actor: PlatformActor,
  input: unknown,
  database: OnboardingDatabase = prisma,
) {
  requirePropertyManagement(actor);
  const data = propertyStatusChangeSchema.parse(input);

  return database.$transaction(async (transaction) => {
    const property = await transaction.clientProperty.update({
      where: { id: data.propertyId },
      data: { status: data.status },
    });
    await transaction.auditEvent.create({
      data: {
        actorId: actor.id,
        accountId: property.accountId,
        propertyId: property.id,
        action: `property.status_${data.status.toLowerCase()}`,
        subjectType: "ClientProperty",
        subjectId: property.id,
      },
    });
    return property;
  });
}

export async function changeAccountStatus(
  actor: PlatformActor,
  input: unknown,
  database: OnboardingDatabase = prisma,
) {
  requirePropertyManagement(actor);
  const data = accountStatusChangeSchema.parse(input);

  return database.$transaction(async (transaction) => {
    const account = await transaction.clientAccount.update({
      where: { id: data.accountId },
      data: { status: data.status },
    });
    await transaction.auditEvent.create({
      data: {
        actorId: actor.id,
        accountId: account.id,
        propertyId: null,
        action: `account.status_${data.status.toLowerCase()}`,
        subjectType: "ClientAccount",
        subjectId: account.id,
      },
    });
    return account;
  });
}
