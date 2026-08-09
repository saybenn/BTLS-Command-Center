import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireSupabaseServiceRoleEnvironment } from "@/server/env";

export function createSupabaseAdminClient() {
  const { serviceRoleKey, url } = requireSupabaseServiceRoleEnvironment();

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}
