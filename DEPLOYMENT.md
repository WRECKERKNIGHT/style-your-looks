# NEXARI — Deployment Guide

Target platform is **Vercel** (edge-adjacent Next.js hosting, free tier, built-in
CDN, service worker support) with **Supabase** for auth + community data.

## Prerequisites

- Node **20.x** (pinned in `.nvmrc`). Vercel detects and honors `.nvmrc`.
- Git remote for the repository.
- A Supabase project (free tier is fine).

## 1. Database setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run migrations in order from the SQL editor (or `supabase db push`):
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/001_community_tables.sql`
   - `supabase/migrations/002_hardening.sql`

   `002_hardening.sql` creates the `handle_new_user` profile trigger on signup,
   adds `updated_at` triggers, RLS policies, performance indexes, and the
   `recalculate_rating_average` trigger.

3. If you enabled email confirmation, users must confirm before posting.
   Tune **Auth → Providers → Email** (disable "Confirm email" for instant signup,
   or leave enabled for stricter flow).

## 2. Env vars

Add to the Vercel project (Settings → Environment Variables) **and** to `.env.local`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional. Used for admin operations only. Never expose this to the browser — keep it server-only. |

## 3. Deploy to Vercel

### Option A — Git import (recommended)

1. `vercel` — or import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected). Build command `npm run build`, output dir default.
3. Add the env vars above.
4. Deploy. The `next.config.mjs` headers (CSP, HSTS, COOP) and the service worker
   are applied automatically.

### Option B — CI/CD

The repo ships `.github/workflows/ci.yml` (lint + build on PR) and a
`.github/workflows/deploy.yml` template. Uncomment the deploy workflow and set the
`VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` secrets.

### Option C — Docker self-host

`output: "standalone"` is enabled, so you can run anywhere:

```bash
docker build -t nexari .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  nexari
```

## 4. Post-deploy checks

- [ ] `curl -I https://nexari.app` returns `strict-transport-security`,
      `content-security-policy`, `cross-origin-opener-policy`.
- [ ] `/manifest.json` serves `Cache-Control: public, max-age=0, must-revalidate`.
- [ ] `/sw.js` serves `Cache-Control: no-cache` and `Service-Worker-Allowed: /`.
- [ ] Lighthouse PWA + performance pass ≥ 90 on mobile.
- [ ] Sign up → profile created automatically (trigger), community feed loads.

## 5. Security checklist

- The **service role key must never** be referenced in client components
  (only server-only files under `app/api/` or `lib/`).
- CSP in `next.config.mjs` only allows `self`, inline styles, and the known
  CDNs (jsdelivr for MediaPipe WASM, fonts.googleapis.com). If you change a CDN,
  update the CSP `script-src` / `connect-src` accordingly.
- Rate limits on `/api/community/*` and `/api/analyze` are per-IP, in-memory —
  fine for a single instance. On horizontal scaling, swap `lib/rate-limit.ts`
  for an Upstash/Redis limiter.
- `middleware.ts` blocks sensitive paths (e.g. server-only API internals) with a
  404 before they reach handlers.

## 6. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Build crash / SIGBUS on macOS | Use Node 20 (`nvm use`). Reinstall deps: delete `node_modules` + `package-lock.json`, `npm ci` from a complete lockfile. |
| Community shows DEMO FEED | Check Supabase env vars and that migrations ran; the feed endpoint returns real posts when the table exists. |
| Photos not analyzing | MediaPipe WASM loads from jsdelivr — confirm `https://cdn.jsdelivr.net` is reachable and allowed by CSP. |
| Service worker not updating | `/sw.js` is cached with `no-cache`; a new deploy bumps the cache version automatically. |
