"use client";

import { createBrowserClient } from "@supabase/ssr";
import { z } from "zod";

const browserEnvironmentSchema = z.object({
  publishableKey: z.string().min(1),
  url: z.string().url(),
});

function requireBrowserSupabaseEnvironment() {
  const parsed = browserEnvironmentSchema.safeParse({
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  if (!parsed.success) {
    throw new Error("Supabase browser configuration is unavailable.");
  }

  return parsed.data;
}

export function createSupabaseBrowserClient() {
  const { publishableKey, url } = requireBrowserSupabaseEnvironment();

  return createBrowserClient(url, publishableKey, {
    auth: {
      detectSessionInUrl: false,
    },
  });
}
