import { NextResponse } from "next/server";

// Same-origin check for state-changing requests. All our APIs accept JSON
// bodies, so cross-origin form posts can't match anyway — this is defense in
// depth against a browser sending a forged fetch with a matching Content-Type.
export function assertSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Non-browser clients (curl, server-to-server) omit both headers entirely.
  if (!origin && !referer) return null;

  const allowed =
    origin ?? new URL(referer as string).origin;

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : request.url
      ? new URL(request.url).origin
      : null;

  if (!siteOrigin || allowed !== siteOrigin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  return null;
}
