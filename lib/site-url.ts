// Canonical site origin, resolved once in order of preference:
//   1. NEXT_PUBLIC_SITE_URL (authoritative, e.g. https://zervey.vercel.app)
//   2. VERCEL_URL (only host, e.g. zervey.vercel.app)
//   3. Local dev default
// Keeps metadata, sitemap, robots and origin checks from drifting apart.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

export function siteOrigin(): string {
  return new URL(siteUrl()).origin;
}
