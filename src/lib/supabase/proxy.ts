import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { requireSupabaseBrowserEnvironment } from "@/server/env";

const protectedPath = "/dashboard";

export function isProtectedAuthRoute(pathname: string) {
  return pathname === protectedPath || pathname.startsWith(`${protectedPath}/`);
}

export async function updateAuthSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { publishableKey, url } = requireSupabaseBrowserEnvironment();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, options, value }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();

  if (isProtectedAuthRoute(request.nextUrl.pathname) && (error || !data?.claims?.sub)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.search = request.cookies.getAll().length > 0 ? "?reason=session-expired" : "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
