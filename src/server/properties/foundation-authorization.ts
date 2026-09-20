import "server-only";
import type { AuthorizedPropertyContext } from "./property-context";
export const foundationCapabilities = [
  "customer.view",
  "customer.manage",
  "employee.view",
  "employee.manage",
  "revenue.settings.view",
  "revenue.settings.manage",
  "property.service.view",
  "property.service.manage",
] as const;
export type FoundationCapability = (typeof foundationCapabilities)[number];
export class FoundationError extends Error {
  constructor(
    readonly code: "DENIED" | "NOT_FOUND" | "CONFLICT" | "VALIDATION",
    message: string,
  ) {
    super(message);
    this.name = "FoundationError";
  }
}
export function canUseFoundation(
  context: AuthorizedPropertyContext,
  capability: FoundationCapability,
) {
  return (
    context.capabilities.property.includes(capability) ||
    context.capabilities.platform.includes(`platform.${capability}`)
  );
}
export function requireFoundation(
  context: AuthorizedPropertyContext,
  capability: FoundationCapability,
) {
  if (!canUseFoundation(context, capability))
    throw new FoundationError("DENIED", "You do not have permission to access this area.");
}
