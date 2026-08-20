import { describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());
const requireAuthenticatedAppUser = vi.hoisted(() => vi.fn());
const onboardAccountProperty = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/database/prisma", () => ({ prisma: {} }));
vi.mock("@/server/auth/session", () => ({ requireAuthenticatedAppUser }));
vi.mock("@/server/properties/admin-properties", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/server/properties/admin-properties")>();
  return { ...original, onboardAccountProperty };
});

import { createAccountPropertyAction } from "@/app/admin/properties/actions";

describe("Feature 05 Slice 3 account/property onboarding action", () => {
  it("returns field validation before attempting a creation", async () => {
    await expect(createAccountPropertyAction(undefined, new FormData())).resolves.toMatchObject({
      status: "error",
      fieldErrors: {
        accountName: "Account name must be at least 2 characters.",
        propertyName: "Property name must be at least 2 characters.",
      },
    });
    expect(onboardAccountProperty).not.toHaveBeenCalled();
  });

  it("creates through the authenticated capability service and revalidates the directory", async () => {
    requireAuthenticatedAppUser.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000001",
      platformRole: "BTLS_ADMIN",
    });
    onboardAccountProperty.mockResolvedValue({ property: { id: "property-id", name: "Oak HVAC" } });
    const formData = new FormData();
    formData.set("accountName", "Oak Services");
    formData.set("propertyName", "Oak HVAC");
    formData.set("domain", "oak.example");

    await expect(createAccountPropertyAction(undefined, formData)).resolves.toMatchObject({
      status: "success",
      propertyId: "property-id",
    });
    expect(onboardAccountProperty).toHaveBeenCalledWith(
      expect.objectContaining({ platformRole: "BTLS_ADMIN" }),
      { accountName: "Oak Services", propertyName: "Oak HVAC", domain: "oak.example" },
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/properties");
  });
});
