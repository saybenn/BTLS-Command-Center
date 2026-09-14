import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNotificationDependencies } from "@/server/notifications/notifications";

const database = vi.hoisted(() => ({
  appUser: { findUnique: vi.fn() },
  clientProperty: { findUnique: vi.fn() },
}));
vi.mock("@/server/database/prisma", () => ({ prisma: database }));
const propertyId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const property = {
  id: propertyId,
  status: "ACTIVE",
  name: "Proof property",
  domain: null,
  account: { id: "account", name: "Account", status: "ACTIVE" },
  propertyAccesses: [],
};

describe("notification recipient authorization", () => {
  beforeEach(() => {
    database.appUser.findUnique.mockResolvedValue({
      id: userId,
      status: "ACTIVE",
      platformRole: "BTLS_OPERATOR",
    });
    database.clientProperty.findUnique.mockResolvedValue(property);
  });
  it("denies ordinary operators without explicit property access", async () => {
    await expect(
      createNotificationDependencies().resolveRecipientContext(propertyId, userId),
    ).resolves.toBeNull();
  });
  it("allows an active explicit operator grant but denies its suspended membership", async () => {
    const access = {
      id: "access",
      roleOverride: null,
      membership: { id: "membership", role: "CLIENT_VIEWER", status: "ACTIVE" },
    };
    database.clientProperty.findUnique.mockResolvedValue({
      ...property,
      propertyAccesses: [access],
    });
    await expect(
      createNotificationDependencies().resolveRecipientContext(propertyId, userId),
    ).resolves.toMatchObject({ property: { id: propertyId }, user: { id: userId } });
    database.clientProperty.findUnique.mockResolvedValue({
      ...property,
      propertyAccesses: [{ ...access, membership: { ...access.membership, status: "SUSPENDED" } }],
    });
    await expect(
      createNotificationDependencies().resolveRecipientContext(propertyId, userId),
    ).resolves.toBeNull();
  });
  it("allows an active administrator while respecting suspended properties and disabled users", async () => {
    database.appUser.findUnique.mockResolvedValue({
      id: userId,
      status: "ACTIVE",
      platformRole: "BTLS_ADMIN",
    });
    await expect(
      createNotificationDependencies().resolveRecipientContext(propertyId, userId),
    ).resolves.toMatchObject({ property: { id: propertyId } });
    database.clientProperty.findUnique.mockResolvedValue({ ...property, status: "SUSPENDED" });
    await expect(
      createNotificationDependencies().resolveRecipientContext(propertyId, userId),
    ).resolves.toBeNull();
    database.appUser.findUnique.mockResolvedValue({
      id: userId,
      status: "DISABLED",
      platformRole: "BTLS_ADMIN",
    });
    await expect(
      createNotificationDependencies().resolveRecipientContext(propertyId, userId),
    ).resolves.toBeNull();
  });
});
