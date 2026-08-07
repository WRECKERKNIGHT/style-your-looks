# Contributing to ZERVEY

Thanks for your interest in contributing to ZERVEY! Pull requests, bug reports,
and feature ideas are all welcome.

## Code of conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting started

1. **Fork** the repo and clone your fork:
   ```bash
   git clone git@github.com:<your-username>/style-your-looks.git
   cd style-your-looks
   ```
2. **Install Node 20** (pinned in `.nvmrc`):
   ```bash
   nvm install && nvm use
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up env vars** — copy `.env.local.example` to `.env.local` and fill in
   your Supabase values. The app runs without Supabase (auth + community fall
   back to demo mode), so a minimal env is enough for most UI work.
5. **Start the dev server:**
   ```bash
   npm run dev
   ```

## Development workflow

- Create a branch off `main`: `git checkout -b feat/your-feature`
  or `fix/your-fix`.
- Keep commits focused and follow conventional commit messages
  (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Match the existing code style — TypeScript strict, the project's Tailwind
  design tokens (see `tailwind.config.js`), and the patterns already in
  `components/` and `lib/`.
- Do not introduce new dependencies unless they are necessary; if you do,
  justify them in the PR description.

## Before you push

Run the same checks CI runs:

```bash
npm run lint
npm run build
```

Both must pass cleanly.

## Opening a pull request

- Push your branch and open a PR against `main`.
- Describe what you changed and why, and include any relevant screenshots.
- Reference any issue your PR closes (e.g. `Closes #12`).

## Project map

| Path | What's there |
| --- | --- |
| `app/` | Next.js App Router routes |
| `components/` | React components (landing, dashboard, shared, providers) |
| `lib/ml/` | On-device analysis engines (face, body, color, try-on) |
| `lib/three/` | Parametric 3D studio geometry |
| `store/` | Zustand client state |
| `supabase/migrations/` | SQL migrations (apply in order) |
| `.github/workflows/ci.yml` | Lint + build CI |

## Questions?

Open a [discussion](https://github.com/WRECKERKNIGHT/style-your-looks/discussions)
or reach out on the relevant PR/issue thread.
