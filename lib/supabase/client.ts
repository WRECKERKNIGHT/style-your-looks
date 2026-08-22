import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns null when Supabase env vars are not configured instead of throwing.
 * Community/auth features degrade gracefully (treated as signed-out) while all
 * on-device analysis keeps working without any configuration.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}

/** True when Supabase is configured and auth/community features can be used. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
