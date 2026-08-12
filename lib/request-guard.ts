import { NextResponse } from "next/server";
import { siteOrigin } from "@/lib/site-url";

// Same-origin check for state-changing requests. All our APIs accept JSON
// bodies, so cross-origin form posts can't match anyway — this is defense in
// depth against a browser sending a forged fetch with a matching Content-Type.
export function assertSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Non-browser clients (curl, server-to-server) omit both headers entirely.
  if (!origin && !referer) return null;

  const allowed = origin ?? new URL(referer as string).origin;
  const site = siteOrigin();

  if (allowed !== site) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  return null;
}
