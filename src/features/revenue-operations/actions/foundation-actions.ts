"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logger } from "@/server/observability/logger";
import { requireAuthorizedPropertyContext } from "@/server/properties/property-context";
import { FoundationError } from "@/server/properties/foundation-authorization";
import { savePropertyService } from "@/server/properties/property-services";
import { createCustomer, updateCustomer } from "../services/customers";
import {
  saveContact,
  saveLocation,
  saveAsset,
  saveTag,
  assignTag,
} from "../services/customer-context";
import {
  saveEmployee,
  saveRevenueSettings,
  lookupFoundation,
} from "../services/workforce-settings";

const operations = {
  createCustomer,
  updateCustomer,
  saveContact,
  saveLocation,
  saveAsset,
  saveTag,
  assignTag,
  saveEmployee,
  saveRevenueSettings,
  savePropertyService,
};
export type FoundationOperation = keyof typeof operations;
export type FoundationActionResult =
  | { ok: true; id: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
      candidates?: Array<{ id: string; displayName: string; reason: string }>;
      reviewToken?: string;
    };
export async function foundationAction(
  propertyId: string,
  operation: FoundationOperation,
  input: unknown,
): Promise<FoundationActionResult> {
  try {
    const context = await requireAuthorizedPropertyContext(propertyId);
    if (!Object.hasOwn(operations, operation))
      return { ok: false, message: "This action is unavailable." };
    const result = await operations[operation](context, input);
    if ("candidates" in result)
      return {
        ok: false,
        message:
          "Possible duplicates found. Review these customers, or confirm this is a separate record.",
        ...result,
      };
    // There is no property layout route. Invalidate real directories and refresh
    // the current dynamic detail page as part of this action response.
    for (const path of [
      "revenue-operations/customers",
      "revenue-operations/employees",
      "settings/revenue-operations",
      "settings/services",
    ])
      revalidatePath(`/${context.property.id}/${path}`);
    revalidatePath("/[propertyId]/revenue-operations/customers/[customerId]", "page");
    revalidatePath("/[propertyId]/revenue-operations/employees/[employeeId]", "page");
    return { ok: true, id: result.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const key = String(issue.path[0] ?? "form");
        (fieldErrors[key] ??= []).push(issue.message);
      }
      return { ok: false, message: "Check the highlighted fields.", fieldErrors };
    }
    if (error instanceof FoundationError) return { ok: false, message: error.message };
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return {
        ok: false,
        message:
          "A record with this service name, tag name, or linked user already exists. Reload and review the directory.",
      };
    logger.error(
      { operation, category: "REVENUE_FOUNDATION_MUTATION_FAILED" },
      "Revenue foundation mutation failed",
    );
    return { ok: false, message: "The change could not be saved. Reload and try again." };
  }
}
export async function foundationLookupAction(propertyId: string, input: unknown) {
  try {
    return {
      ok: true as const,
      options: await lookupFoundation(await requireAuthorizedPropertyContext(propertyId), input),
    };
  } catch {
    return { ok: false as const, options: [], message: "Options could not be loaded. Try again." };
  }
}
