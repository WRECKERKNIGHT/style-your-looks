# Security Policy

ZERVEY runs all image analysis on-device and is designed so photos never leave
the browser. We still take security reports seriously and appreciate
responsible disclosure.

## Reporting a vulnerability

Please report vulnerabilities **privately** using GitHub's private security
advisory feature, not through a public issue:

> Security → **Report a vulnerability** at
> https://github.com/WRECKERKNIGHT/style-your-looks/security/advisories

Please include:

- The affected endpoint, component, or file
- Steps to reproduce
- Expected vs. actual behavior
- Any proof of concept or logs

## Response timeline

- **Acknowledgment:** within 2–3 business days.
- **Triage and fix:** as soon as a fix is ready. Critical issues (e.g. secrets
  exposure, auth bypass, XSS that bypasses CSP) are prioritized.
- **Disclosure:** coordinated with the reporter before a public release.

## Scope

In-scope areas include the Next.js application, API routes under `app/api/`,
Supabase auth/RLS policies in `supabase/migrations/`, and the build/deploy
pipeline. Out-of-scope are third-party services (Vercel, Supabase, Google OAuth
console) themselves.

## Known safe handling notes

- The Supabase **service role key must never** be referenced in client code —
  it is server-only. Keep it out of `.env.local` commits and the browser bundle.
- Sensitive server-only API internals are blocked by `middleware.ts` before they
  reach route handlers.

## Disclosure

We ask that you wait for a released fix before publicly disclosing a
vulnerability, and we will credit you (if you wish) once it is resolved.
