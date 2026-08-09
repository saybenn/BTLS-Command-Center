import { NextResponse, type NextRequest } from "next/server";

import { getFixedAuthUrl, isAllowedPostAuthPath } from "@/server/auth/redirects";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(getFixedAuthUrl("/sign-in"));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(getFixedAuthUrl("/sign-in"));
  }

  return NextResponse.redirect(getFixedAuthUrl(isAllowedPostAuthPath(next) ? next : "/dashboard"));
}
