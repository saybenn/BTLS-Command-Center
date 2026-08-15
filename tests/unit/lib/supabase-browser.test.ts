import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createBrowserClient = vi.hoisted(() => vi.fn());

vi.mock("@supabase/ssr", () => ({ createBrowserClient }));

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

describe("Supabase browser client", () => {
  beforeEach(() => {
    createBrowserClient.mockReset();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "browser-public-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://browser.supabase.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates a client from valid public configuration without automatic URL-session handling", () => {
    const client = { auth: {} };
    createBrowserClient.mockReturnValue(client);

    expect(createSupabaseBrowserClient()).toBe(client);
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://browser.supabase.test",
      "browser-public-key",
      {
        auth: {
          detectSessionInUrl: false,
        },
      },
    );
  });

  it.each([
    ["a missing public key", "", "https://browser.supabase.test"],
    ["an invalid public URL", "browser-public-key", "not-a-url"],
  ])("fails clearly for %s", (_description, publishableKey, url) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishableKey);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);

    expect(() => createSupabaseBrowserClient()).toThrow(
      "Supabase browser configuration is unavailable.",
    );
  });

  it("does not import server-only or service-role code", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src", "lib", "supabase", "browser.ts"),
      "utf8",
    );

    expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(source).not.toContain("server-only");
    expect(source).not.toContain("supabase-admin");
  });
});
