import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const inviteUserByEmail = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth/supabase-admin", () => ({
  createSupabaseAdminClient: () => ({ auth: { admin: { inviteUserByEmail } } }),
}));

import {
  createInMemoryProductAnalytics,
  recordProductAnalyticsEvent,
  setProductAnalyticsAdapterForTests,
} from "@/server/analytics/product-analytics";
import { createInvitation } from "@/server/auth/invitations";

describe("Feature 04 Slice 4 primitives", () => {
  afterEach(() => {
    setProductAnalyticsAdapterForTests(undefined);
    inviteUserByEmail.mockReset();
  });

  it("records typed auth events to an explicit test sink", async () => {
    const sink = createInMemoryProductAnalytics();
    setProductAnalyticsAdapterForTests(sink);

    await recordProductAnalyticsEvent({ name: "auth.sign_in_succeeded" });
    await recordProductAnalyticsEvent({
      category: "invalid_credentials",
      name: "auth.sign_in_failed",
    });
    await recordProductAnalyticsEvent({ name: "auth.invitation_accepted" });

    expect(sink.events).toEqual([
      { name: "auth.sign_in_succeeded" },
      { category: "invalid_credentials", name: "auth.sign_in_failed" },
      { name: "auth.invitation_accepted" },
    ]);
  });

  it("creates an Auth invitation with the fixed invite redirect and no access input", async () => {
    process.env.BTLS_APP_URL = "http://127.0.0.1:3000";
    inviteUserByEmail.mockResolvedValue({
      data: { user: { email: "invited@example.com", id: "user-id" } },
      error: null,
    });

    await expect(createInvitation({ email: "invited@example.com" })).resolves.toEqual({
      email: "invited@example.com",
      userId: "user-id",
    });
    expect(inviteUserByEmail).toHaveBeenCalledWith("invited@example.com", {
      redirectTo: "http://127.0.0.1:3000/invite",
    });
  });

  it("keeps the service-role credential out of browser-importable modules", () => {
    const browserSource = readFileSync(
      path.join(process.cwd(), "src", "lib", "supabase", "browser.ts"),
      "utf8",
    );

    expect(browserSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(browserSource).not.toContain("createSupabaseAdminClient");
  });

  it("keeps local Auth invite-only, password-hardened, and redirect-restricted", () => {
    const config = readFileSync(path.join(process.cwd(), "supabase", "config.toml"), "utf8");

    expect(config).toContain("minimum_password_length = 12");
    expect(config).toContain("enable_signup = false");
    expect(config).toContain(
      'additional_redirect_urls = ["http://127.0.0.1:3000", "http://127.0.0.1:3100"]',
    );
  });
});
