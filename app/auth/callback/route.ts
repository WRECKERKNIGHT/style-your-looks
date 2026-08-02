import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set([
  "email",
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
  "sms",
]);

function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "email";

  const supabase = await createClient();

  // Supabase auth error params (e.g. Google denied, confirmation failed)
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  if (errorParam || errorDescription) {
    const message = encodeURIComponent(
      errorDescription ?? "Authentication failed. Please try again."
    );
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  // Email verification / magic link / recovery links arrive with token_hash + type.
  if (token_hash && ALLOWED_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message ?? "Verification failed")}`
    );
  }

  // OAuth / PKCE flow.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message ?? "Authentication failed")}`
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Missing authentication code.")}`
  );
}
