import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { getPublicSupabaseEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith("/companion") || pathname.startsWith("/web");
  if (!isProtectedRoute) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"
  ]
};
