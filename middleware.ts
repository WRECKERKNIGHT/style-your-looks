import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SENSITIVE_PATTERNS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.svn/i,
  /\.php$/i,
  /^\/config\./i,
  /^\/database\./i,
  /^\/\.aws/i,
  /^\/wp-admin/i,
  /^\/server-status/i,
  /^\/\.pem$/i,
];

const AUTH_PATHS = ["/dashboard", "/login", "/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(path))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isAuthPath = AUTH_PATHS.some((route) => path.startsWith(route));

  // The app's core analysis runs on-device, so a Supabase outage (or an
  // unconfigured project) should NOT present as a logout. Fail soft: let
  // dashboard requests through — every server API still enforces its own
  // auth and availability checks, so nothing protected is exposed.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAuthPath) {
      return NextResponse.next({ request });
    }
    return NextResponse.next({ request });
  }

  if (!isAuthPath) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user: { id: string } | null = null;
  let unreachable = false;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
    // A network failure resolves with an error and a null user rather than
    // throwing — that is the outage case we must not treat as logged out.
    unreachable = !result.data.user && Boolean(result.error);
  } catch {
    unreachable = true;
  }

  if (path.startsWith("/dashboard") && !user) {
    if (unreachable) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
