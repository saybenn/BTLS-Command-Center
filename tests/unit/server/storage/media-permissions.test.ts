import { describe, expect, it } from "vitest";

import { hasPlatformCapability, hasPropertyCapability } from "@/server/auth/permissions";

describe("Media capability baseline", () => {
  it("maps normal media view and manage capabilities to the approved client roles", () => {
    for (const role of [
      "CLIENT_OWNER",
      "CLIENT_MANAGER",
      "CLIENT_STAFF",
      "CLIENT_VIEWER",
    ] as const) {
      expect(hasPropertyCapability(role, "media.view")).toBe(true);
    }

    for (const role of ["CLIENT_OWNER", "CLIENT_MANAGER", "CLIENT_STAFF"] as const) {
      expect(hasPropertyCapability(role, "media.manage")).toBe(true);
    }
    expect(hasPropertyCapability("CLIENT_VIEWER", "media.manage")).toBe(false);
  });

  it("limits sensitive media reads to owners and managers", () => {
    expect(hasPropertyCapability("CLIENT_OWNER", "media.sensitive.view")).toBe(true);
    expect(hasPropertyCapability("CLIENT_MANAGER", "media.sensitive.view")).toBe(true);
    expect(hasPropertyCapability("CLIENT_STAFF", "media.sensitive.view")).toBe(false);
    expect(hasPropertyCapability("CLIENT_VIEWER", "media.sensitive.view")).toBe(false);
  });

  it("keeps platform property context separate from Media capabilities", () => {
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.property.read")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.property.read")).toBe(true);
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.media.view")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.media.view")).toBe(true);
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.media.manage")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.media.manage")).toBe(true);
    expect(hasPlatformCapability("BTLS_ADMIN", "platform.media.sensitive.view")).toBe(true);
    expect(hasPlatformCapability("BTLS_OPERATOR", "platform.media.sensitive.view")).toBe(false);
  });
});
