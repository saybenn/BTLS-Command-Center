import { describe, expect, it } from "vitest";

import { isProtectedAuthRoute } from "@/lib/supabase/proxy";
import { getAuthRedirectUrl, isAllowedPostAuthPath } from "@/server/auth/redirects";
import { requireApplicationUrlEnvironment } from "@/server/env";

describe("Feature 04 Slice 1 auth contracts", () => {
  it("validates and normalizes the server-only application URL", () => {
    expect(requireApplicationUrlEnvironment({ BTLS_APP_URL: "https://app.btls.test/" })).toEqual({
      appUrl: "https://app.btls.test",
    });
    expect(() => requireApplicationUrlEnvironment({})).toThrow(
      "BTLS_APP_URL is unavailable or invalid.",
    );
  });

  it("allows only fixed BTLS post-auth destinations", () => {
    expect(isAllowedPostAuthPath("/dashboard")).toBe(true);
    process.env.BTLS_APP_URL = "http://127.0.0.1:3000";
    expect(isAllowedPostAuthPath("https://attacker.test")).toBe(false);
    expect(getAuthRedirectUrl("/invite")).toBe("http://127.0.0.1:3000/invite");
  });

  it("protects all authenticated workspace and property routes", () => {
    expect(isProtectedAuthRoute("/dashboard")).toBe(true);
    expect(isProtectedAuthRoute("/dashboard/settings")).toBe(true);
    expect(isProtectedAuthRoute("/admin/properties")).toBe(true);
    expect(isProtectedAuthRoute("/select-property")).toBe(true);
    expect(isProtectedAuthRoute("/00000000-0000-4000-8000-000000000001/overview")).toBe(true);
    expect(isProtectedAuthRoute("/invite")).toBe(false);
  });
});
