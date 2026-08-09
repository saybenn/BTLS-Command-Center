import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth/supabase-server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { exchangeCodeForSession },
  }),
}));

import { GET } from "@/app/auth/callback/route";

describe("Feature 04 auth callback", () => {
  beforeEach(() => {
    process.env.BTLS_APP_URL = "http://127.0.0.1:3000";
    exchangeCodeForSession.mockReset();
    exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("redirects only to fixed BTLS destinations after exchanging a code", async () => {
    const response = await GET(
      new NextRequest(
        "https://untrusted.example/auth/callback?code=code&next=https://attacker.test",
      ),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("code");
    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/dashboard");
  });

  it("sends missing or invalid codes to the fixed sign-in route", async () => {
    const missingCode = await GET(new NextRequest("https://untrusted.example/auth/callback"));
    expect(missingCode.headers.get("location")).toBe("http://127.0.0.1:3000/sign-in");

    exchangeCodeForSession.mockResolvedValue({ error: new Error("invalid code") });
    const invalidCode = await GET(
      new NextRequest("https://untrusted.example/auth/callback?code=code"),
    );
    expect(invalidCode.headers.get("location")).toBe("http://127.0.0.1:3000/sign-in");
  });
});
