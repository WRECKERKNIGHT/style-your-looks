# AURAYA — AI Style Intelligence

AURAYA (formerly AuraStyle) is a privacy-first style analysis platform. It performs
47-point facial analysis, body typing, color-season detection, and outfit
recommendations — entirely **on-device** via MediaPipe. Photos never leave the
browser.

## Stack

- **Next.js 14 (App Router)** + React 18 + TypeScript
- **Tailwind CSS** with a cosmic nexus/aurum design system
- **Supabase** — auth and community features
- **MediaPipe Tasks Vision** — on-device face/body/skin analysis
- **Zustand** — client state · **Framer Motion / GSAP / Lenis** — motion
- **PWA** — offline support via service worker

## Getting started

```bash
# Node 20 is required (see .nvmrc)
nvm install
nvm use

npm install
npm run dev
```

Create `.env.local` from `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> The app runs without Supabase — auth and community fall back to demo mode.

## Scripts

| Command        | Purpose                          |
| -------------- | -------------------------------- |
| `npm run dev`  | Start the dev server             |
| `npm run lint` | Run ESLint                       |
| `npm run build`| Production build                 |
| `npm start`    | Serve a production build         |

## Database

Migrations live in `supabase/migrations/`. Apply in order:

- `001_initial.sql` / `001_community_tables.sql` — core + community schema
- `002_hardening.sql` — RLS, triggers, indexes, rating recalculation

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full Vercel + Supabase guide,
including Docker self-hosting and security checklists.
