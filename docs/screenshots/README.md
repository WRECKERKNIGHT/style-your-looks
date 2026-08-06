# Screenshots

Live captures of ZERVEY screens. Refreshed with headless Chrome against the local
dev server:

```bash
npm run dev &
"Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,900 --virtual-time-budget=8000 \
  --screenshot="docs/screenshots/landing.png" http://localhost:3000
```

Authenticated routes need a logged-in session (demo auth or real OAuth). Screenshot
any dashboard route the same way, then update `docs/screenshots/landing.png`-style
slots referenced from the root README.

> Analysis screenshots should be captured from **demo runs** (they are clearly
> badged as sample data and are never persisted to history).
