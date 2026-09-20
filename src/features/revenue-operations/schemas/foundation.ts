import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

export const identifier = z.string().uuid();
export const nameSchema = z.string().trim().min(1, "Enter a name.").max(160);
export const optionalText = z
  .string()
  .trim()
  .max(240)
  .nullish()
  .transform((value) => value || null);
export const booleanInput = z.union([
  z.boolean(),
  z.enum(["true", "false"]).transform((value) => value === "true"),
]);
export const revisionInput = z.coerce.number().int().min(0);
export const optionalId = z
  .union([identifier, z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);
export const normalizeName = (value: string) =>
  value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");

const emailSchema = z
  .union([
    z.string().trim().email("Enter a valid email address.").max(254),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => value || null);
const phoneSchema = z
  .string()
  .trim()
  .max(80)
  .optional()
  .default("")
  .transform((value, ctx) => {
    if (!value) return { phoneE164: null, phoneDisplay: null };
    // Country-code input is explicit: do not silently assume the customer's country.
    const phone = parsePhoneNumberFromString(value, { extract: false });
    if (!value.startsWith("+") || !phone?.isValid() || phone.ext) {
      ctx.addIssue({
        code: "custom",
        message:
          "Enter a valid phone with country code, such as +1 212 555 0123, without an extension.",
      });
      return z.NEVER;
    }
    return { phoneE164: phone.number, phoneDisplay: phone.formatInternational() };
  });
export const contactFields = z.object({
  personName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});
export const createCustomerSchema = contactFields
  .extend({
    displayName: nameSchema,
    requestId: identifier,
    reviewToken: z.string().max(100).optional(),
    confirmSeparate: booleanInput.optional().default(false),
  })
  .strict();
export const customerUpdateSchema = z
  .object({
    id: identifier,
    revision: revisionInput,
    displayName: nameSchema,
    relationshipState: z.enum(["PROSPECT", "CURRENT", "INACTIVE"]),
  })
  .strict();
export const contactSchema = contactFields
  .extend({
    id: optionalId,
    requestId: identifier.optional(),
    customerId: identifier,
    revision: revisionInput,
    isPrimary: booleanInput,
    isActive: booleanInput,
  })
  .strict();
export const locationSchema = z
  .object({
    id: optionalId,
    requestId: identifier.optional(),
    customerId: identifier,
    revision: revisionInput,
    name: nameSchema,
    addressLine1: z.string().trim().min(1).max(240),
    addressLine2: optionalText,
    locality: z.string().trim().min(1).max(120),
    region: optionalText,
    postalCode: optionalText,
    countryCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, "Use a two-letter country code.")
      .transform((value) => value.toUpperCase()),
    isDefault: booleanInput,
    isActive: booleanInput,
  })
  .strict();
export const assetSchema = z
  .object({
    id: optionalId,
    requestId: identifier.optional(),
    customerId: identifier,
    revision: revisionInput,
    name: nameSchema,
    serviceLocationId: optionalId,
    manufacturer: optionalText,
    modelName: optionalText,
    serialNumber: optionalText,
    isActive: booleanInput,
  })
  .strict();
export const tagSchema = z
  .object({
    id: optionalId,
    requestId: identifier.optional(),
    revision: revisionInput,
    name: nameSchema,
    isActive: booleanInput,
  })
  .strict();
export const tagAssignmentSchema = z
  .object({ customerId: identifier, tagId: identifier, assigned: booleanInput })
  .strict();
export const employeeSchema = z
  .object({
    id: optionalId,
    requestId: identifier.optional(),
    revision: revisionInput,
    displayName: nameSchema,
    jobTitle: optionalText,
    appUserId: optionalId,
    isActive: booleanInput,
  })
  .strict();
export const settingsSchema = z
  .object({
    revision: revisionInput,
    defaultSendingIdentityId: optionalId,
    reviewRequestDelayDays: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      z.coerce.number().int().min(0).max(365).nullable(),
    ),
  })
  .strict();
export const listSchema = z
  .object({
    q: z.string().trim().max(160).optional().default(""),
    page: z.coerce.number().int().min(1).max(10000).optional().default(1),
    status: z
      .enum(["all", "active", "inactive", "PROSPECT", "CURRENT", "INACTIVE"])
      .optional()
      .default("all"),
  })
  .strict();
