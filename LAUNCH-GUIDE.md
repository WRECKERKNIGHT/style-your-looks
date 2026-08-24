# ZERVEY — Launch & Discovery Guide

Everything needed to take the deployed app from "live at zervey.app" to "findable, talked about, and growing". Work through it in order; Phase 1 is mandatory before any promotion.

---

## Phase 0 — Pre-Flight Checklist (do this today)

Before telling a single human, verify the deployed build is the fixed one:

1. **Deploy latest `main`.** Every engine fix (WebAssembly CSP, self-heal engines, honest fallbacks) must be in the deployment.
2. **Verify the CSP fix is live** — visit zervey.app → DevTools → Network → click the document request → Response Headers → `Content-Security-Policy` must contain `'wasm-unsafe-eval'`. If not, the deployment is stale.
3. **Run one real analysis on the deployed site** (phone Chrome + desktop Chrome): upload a photo, confirm Face IQ completes without "engine failed".
4. **Lighthouse audit** (DevTools → Lighthouse) on `/`: aim ≥90 Performance, ≥95 Accessibility/Best Practices/SEO. Fix anything red before launching — reviewers notice.
5. **Check `https://zervey.app/sitemap.xml` and `/robots.txt` return valid XML/text.**
6. **Test OG previews**: paste zervey.app into https://www.opengraph.xyz or the Twitter/X card validator — the branded card image should render.
7. **Mobile PWA check**: open on Android Chrome → "Install app" prompt works; iOS Safari → Add to Home Screen works.

---

## Phase 1 — Get Into Search (Week 1)

This is how strangers find you without any social media.

### Google Search Console (non-negotiable)
1. Go to https://search.google.com/search-console → add property `zervey.app` (Domain property preferred).
2. Verify via DNS TXT record (your registrar/host dashboard).
3. Submit `https://zervey.app/sitemap.xml` under **Sitemaps**.
4. Use **URL Inspection** → paste `https://zervey.app` → **Request Indexing**. Do the same for `/about`, `/privacy`, `/terms`.
5. Repeat inspection for the landing page after every major content update to trigger re-crawling.

### Bing Webmaster Tools
1. https://www.bing.com/webmasters → import site from Search Console (one click).
2. Submit the same sitemap. Bing powers DuckDuckGo/Yahoo results too — cheap extra coverage.

### What's already shipped for SEO (maintain, don't redo)
- Metadata: title template, description, keywords, canonical, OpenGraph + Twitter cards
- `sitemap.xml` + `robots.ts` (app pages intentionally excluded — they're behind auth)
- `WebApplication` JSON-LD schema (free app offer) + **FAQPage rich-result schema**
- Mobile viewport, theme-color, PWA manifest, installable

### Keyword strategy (the queries to win)
ZERVEY's wedge is **privacy-first, on-device analysis**. Target long-tails like:
- "face symmetry test online free"
- "what is my face shape analyzer"
- "golden ratio face test"
- "virtual try on clothes free no upload"
- "skin tone analysis online"
- "beard style simulator photo"
- "body type calculator men/women"
- "AI style recommendations private"

Actions:
- Ensure landing copy naturally contains 3–5 of these phrases (headings beat paragraphs).
- Each FAQ answer already targets an intent cluster — extend FAQs monthly with new Q&As (+ matching JSON-LD).
- Publish 2–3 short **guide posts** (e.g. `/guides/how-face-shape-affects-your-style`) — content pages are what actually rank; the tool converts them. One post per week beats ten at once.

### Indexing timeline expectations
- First crawl: days. Meaningful impressions: 2–6 weeks. Stable rankings for long-tails: 2–4 months. Promote during that window via Phase 3 so traffic/data signals activity to search engines.

---

## Phase 2 — Measure Everything (Week 1, parallel)

You can't grow what you can't see:

1. **Privacy-friendly analytics**: Plausible or Vercel Analytics (fits the on-device brand better than GA4; if using GA4, disclose it in /privacy).
2. **Error tracking**: add Sentry (free tier) — client errors like WebGL failures surface here first.
3. **Uptime**: BetterStack/UptimeRobot free monitor on `https://zervey.app`.
4. **Define 3 KPIs**: scans started, scans completed (engine success rate!), signups. The scan completion rate is your product-health metric — regressions in ML loading show up there instantly.

---

## Phase 3 — Introduce ZERVEY to the World (Weeks 2–4)

Order matters: warm audiences first, big stages last.

### Soft launch (days 1–7)
- Personal network: WhatsApp/Discord/Telegram groups, personal X/LinkedIn. Ask for one thing: *complete one scan and report anything broken*.
- Fix whatever breaks within 24h — early users forgive bugs they saw fixed.

### Communities (weeks 1–2)
Pick where your user lives — men's grooming & fashion:
- Reddit: r/malefashionadvice, r/femalefashionadvice (read rules! many require text posts — share a genuine story: "I built a privacy-first face analysis tool, all on-device, AMA"), r/beards, r/SkincareAddiction discussion threads.
- Discord fashion/grooming servers.
- Rule of thumb: **participate first, share second.** Link-dump accounts get banned and screenshots of bans kill launches.

### Big stage (week 3–4, when the product is smooth)
- **Product Hunt**: prepare 2 weeks ahead — gallery images, 30-sec demo video, first-comment from maker (your story: why on-device matters), line up 10–20 supporters for launch day, launch Tue–Thu 00:01 PT.
- **Show HN** (news.ycombinator.com): title like "Show HN: ZERVEY – on-device face/style analysis, no uploads" — the technical MediaPipe/WASM/CPU-fallback engineering story plays well here. Post 8–10 AM ET weekdays.
- **X/Twitter build-in-public thread**: thread the journey (CSP bug war stories included — devs love those), tag @browser-based-AI communities.

### Short-form video (ongoing, highest ceiling)
TikTok/Reels/Shorts — this product category is *made* for it:
- Screen-record real analyses of celebrities/archetypes (use public domain or your own photos).
- "What's YOUR face shape? Link in bio" hooks.
- Before/after grooming-studio renders.
- 3–5 videos/week for 8 weeks; expect most to flop, one to pop.

### Directories (one afternoon)
Submit to: Product Hunt (permanent listing), AlternativeTo, SaaSHub, There's An AI For That, Futurepedia, ToolFinder, BetaList (pre-launch credit), StartupBase, Peerlist.

---

## Phase 4 — Compounding Growth (Month 2+)

1. **Weekly cadence**: 1 guide post + 3 short videos + 1 community participation block + review every KPI Monday.
2. **Community flywheel**: verified-rating feature is unique — showcase top-rated looks on social weekly (with permission) → creators share their own posts → loop.
3. **Share cards are viral loops**: every download/share card should carry the URL. Audit that they look good — they're your organic distribution.
4. **Collect testimonials** from early users into landing social proof.
5. **Email capture** (even a simple "get my analysis history backup" hook) — owned audience beats rented algorithms.
6. **Iterate from data**: biggest drop-off in the scan funnel = next fix priority. Ship visibly and tell users ("you asked, we fixed").

---

## Messaging Cheat-Sheet

| Channel | Lead with |
|---|---|
| Fashion/grooming communities | "See your face objectively — shape, symmetry, what actually suits you" |
| Developer/HN | "MediaPipe WASM, 478 landmarks, homography try-on — 100% client-side, zero uploads" |
| Privacy-minded | "Your photos never leave your device. We literally can't see them." |
| General social | "Free AI style analysis. No signup. No uploads." |

**The one-line pitch:** *"ZERVEY analyzes your face, skin, and body entirely on your device — then tells you exactly what suits you."*

---

## Emergency Rollbacks

If a deployed release breaks scanning:
1. Redeploy previous git tag (host rollback button).
2. Bump `CACHE` version in `public/sw.js` so clients purge cached bundles.
3. Post status note wherever users reported it — silence compounds damage.

---

*Last updated: August 2026. Keep this file updated as channels change.*
