import { describe, it, expect } from "vitest";
import {
  createCustomerSchema,
  contactSchema,
  settingsSchema,
} from "@/features/revenue-operations/schemas/foundation";
import { hasPropertyCapability, hasPlatformCapability } from "@/server/auth/permissions";
const person = { personName: "Ada Jones", email: "Ada@example.test", phone: "+44 20 7946 0018" };
describe("Feature 08 contracts", () => {
  it("normalizes a valid international phone separately from its display", () => {
    const input = createCustomerSchema.parse({
      ...person,
      displayName: "Jones Household",
      requestId: "28e8ad62-b93f-4b8b-a809-97f58a397788",
    });
    expect(input.phone.phoneE164).toBe("+442079460018");
    expect(input.phone.phoneDisplay).toBe("+44 20 7946 0018");
  });
  it("requires explicit country code and never guesses from a local phone", () => {
    expect(() =>
      createCustomerSchema.parse({
        ...person,
        phone: "020 7946 0018",
        displayName: "Jones",
        requestId: "28e8ad62-b93f-4b8b-a809-97f58a397788",
      }),
    ).toThrow();
  });
  it("permits missing endpoints but requires a named person and rejects organization-only payloads", () => {
    const base = {
      id: "",
      customerId: "28e8ad62-b93f-4b8b-a809-97f58a397788",
      revision: 0,
      isPrimary: true,
      isActive: true,
    };
    expect(
      contactSchema.parse({ ...base, personName: "Ada", email: "", phone: "" }).phone.phoneE164,
    ).toBeNull();
    expect(() => contactSchema.parse({ ...base, organizationName: "Company" })).toThrow();
    expect(() => contactSchema.parse({ ...base, personName: " " })).toThrow();
  });
  it("settings reject credentials, verification, and downstream defaults", () => {
    for (const field of [
      "providerToken",
      "verified",
      "twilioNumber",
      "pricebookId",
      "mailboxOAuth",
    ]) {
      expect(() =>
        settingsSchema.parse({
          revision: 0,
          defaultSendingIdentityId: "",
          reviewRequestDelayDays: "",
          [field]: "value",
        }),
      ).toThrow();
    }
    expect(
      settingsSchema.parse({
        revision: 0,
        defaultSendingIdentityId: "",
        reviewRequestDelayDays: "",
      }).reviewRequestDelayDays,
    ).toBeNull();
  });
  it("uses the approved least-privilege bundles", () => {
    for (const role of ["CLIENT_STAFF", "CLIENT_VIEWER"] as const)
      for (const cap of [
        "customer.view",
        "employee.view",
        "revenue.settings.view",
        "property.service.view",
      ] as const)
        expect(hasPropertyCapability(role, cap)).toBe(false);
    expect(hasPropertyCapability("CLIENT_MANAGER", "revenue.settings.view")).toBe(true);
    expect(hasPropertyCapability("CLIENT_MANAGER", "revenue.settings.manage")).toBe(false);
    expect(hasPropertyCapability("CLIENT_OWNER", "revenue.settings.manage")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.customer.manage")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.employee.manage")).toBe(false);
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.employee.manage")).toBe(true);
  });
});
