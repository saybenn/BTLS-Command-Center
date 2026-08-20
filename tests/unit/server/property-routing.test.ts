import { describe, expect, it } from "vitest";

import { resolvePropertyLandingDestination } from "@/server/properties/property-routing";

const propertyOne = {
  account: { id: "account-one", name: "Oak Services" },
  effectiveRole: "CLIENT_VIEWER" as const,
  property: { id: "property-one", name: "Oak HVAC", domain: "oak.example" },
};
const propertyTwo = {
  account: { id: "account-two", name: "Pine Services" },
  effectiveRole: "CLIENT_MANAGER" as const,
  property: { id: "property-two", name: "Pine Plumbing", domain: "pine.example" },
};

describe("Feature 05 Slice 4 property landing routing", () => {
  it("sends platform readers to the shared directory", () => {
    expect(
      resolvePropertyLandingDestination(
        { platformRole: "BTLS_OPERATOR" },
        { status: "no-properties" },
      ),
    ).toBe("/admin/properties");
  });

  it("sends a client with one explicit property to its overview", () => {
    expect(
      resolvePropertyLandingDestination(
        { platformRole: null },
        { status: "authorized", properties: [propertyOne] },
      ),
    ).toBe("/property-one/overview");
  });

  it("requires intentional selection for a client with multiple properties", () => {
    expect(
      resolvePropertyLandingDestination(
        { platformRole: null },
        { status: "authorized", properties: [propertyOne, propertyTwo] },
      ),
    ).toBe("/select-property");
  });

  it("sends a client without an active explicit grant to no access", () => {
    expect(
      resolvePropertyLandingDestination({ platformRole: null }, { status: "no-properties" }),
    ).toBe("/no-access");
  });
});
