#!/usr/bin/env bash
#
# ZERVEY — one-command local setup
# Installs dependencies, prepares environment, and prints next steps.
#
set -euo pipefail

cd "$(dirname "$0")"

echo "── ZERVEY SETUP ──────────────────────────────────────────────"

# 1) Node version guard
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])" 2>/dev/null || echo "0")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✖ Node.js 18+ is required (found $(node -v 2>/dev/null || echo 'none'))."
  echo "  Install via https://nodejs.org or nvm, then re-run ./install.sh"
  exit 1
fi
echo "✓ Node $(node -v) detected"

# 2) Dependencies
echo "→ Installing dependencies (npm install)…"
npm install

# 3) Environment
if [ ! -f .env.local ]; then
  echo "→ Creating .env.local from .env.example (edit with your Supabase keys)"
  cp .env.example .env.local
else
  echo "→ .env.local already exists — leaving it untouched"
fi

# 4) Sanity checks
echo "→ Running typecheck…"
npx tsc --noEmit || { echo "✖ TypeScript errors — fix before running."; exit 1; }
echo "→ Running lint…"
npm run lint || echo "⚠  Lint reported issues (non-blocking)."

echo
echo "✔ SETUP COMPLETE"
echo
echo "  Next steps:"
echo "   1. Edit .env.local and paste your Supabase URL + anon key"
echo "      (project settings → API). Keep NEXT_PUBLIC_ prefix for the URL and key."
echo "   2. Apply the migrations in ./supabase/migrations (001 → 002 → 003) in"
echo "      your Supabase SQL editor or via the CLI: supabase db push"
echo "   3. Configure Google OAuth callback in Google Cloud Console:"
echo "      https://<project-ref>.supabase.co/auth/v1/callback"
echo "   4. Run the app:"
echo "        npm run dev     # local dev on http://localhost:3000"
echo "        npm run build && npm start   # production build"
echo
