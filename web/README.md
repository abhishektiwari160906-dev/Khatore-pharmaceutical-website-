# Khatore Pharmaceuticals — website (Phase 1)

Next.js 14 (App Router) + TypeScript. Standard SSR/serverless deployment
(Vercel-shaped) — **not** static export, because the commercial event
layer needs a real API route (`/api/events`).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build && npm start
```

## What's here (Phase 1, verified — build + typecheck + smoke test all pass)

- **Information architecture**: `/`, `/heritage`, `/science`, `/products`,
  `/products/[slug]` (8 real products, statically generated), `/global-presence`,
  `/contact`. SEO foundation: per-page metadata, canonicals, `robots.ts`,
  `sitemap.ts`.
- **Commercial event layer** (`lib/events/`): one typed contract
  (`types.ts`), a swappable backend (`sink.ts` — console log always on,
  optional Google Sheet webhook via `KHATORE_EVENTS_SHEET_WEBHOOK_URL`),
  a single client entry point (`client.ts` — every component calls
  `trackEvent()`, nothing calls `/api/events` directly), and a server
  route (`app/api/events/route.ts`) that validates and rejects anything
  outside the 5 active Phase-1 events. Future events (`order_placed`,
  `payment_*`, `fulfillment_*`, `refund`, `repeat_purchase`) are typed
  but the server rejects them if sent — enforced, not just documented.
- **Cleared content**: `data/heritage.ts` (`HERITAGE_FOUNDING_YEAR = 1984`,
  from `lib/config.ts`), `data/science.ts` (the 4 cleared clinical
  trials, exact figures), `data/products.ts` (8 real products; 2 flagged
  `pending-description` rather than invented), `data/global.ts` (existing
  approved country list, its "to be confirmed" caveat carried forward).
- **Self-hosted real assets** — logo + 8 product photos, downloaded from
  the live Magento site, not hotlinked. See `../assets/MANIFEST.md` for
  the source URL of every file and a known limitation (295×295 only —
  no higher-res originals were reachable).
- **Redirect map** (`next.config.mjs`) from the live site's real
  31-URL sitemap — only the unambiguous ones; see the comment block
  there for what's deliberately left unmapped and why.
- **Video** (`data/videos.ts`, `components/{EditorialVideo,CinematicVideo,
  VideoPlaceholder,VideoBlock}.tsx`) — the 5-video manifest from the
  client's Drive pack, placed per the approved direction: Reel 1 (BTS) on
  `/heritage`, Reel 2/3 (Process/Promise) on `/products`, Reel 4 (Herb to
  Habit) and the Brand Video on `/`. Only Reel 1 has real self-hosted
  media (`public/assets/video/reel1-bts.mp4` + poster — trimmed to 26s to
  drop an unrelated tail shot, H.264/AAC, faststart, ~3.8MB); the other 4
  render as a labeled "final asset in production" placeholder — never a
  fake frame, never a `drive.google.com` URL — because their bytes are
  over the Drive connector's 10MB inspection cap and the files aren't
  link-shared (a tooling limit, not a missing deliverable — see git log
  for the inspection trail). Swap in real self-hosted files by adding a
  `src`/`poster` and flipping `status` to `'ready'` in `data/videos.ts`;
  nothing else needs to change. Fires `video_started`/`video_completed`
  through the same event layer as everything else. Editorial reels are
  muted/looped/IntersectionObserver-gated; the Brand Video is deliberate
  click-to-play, not an autoplay background; both fall back to the poster
  under `prefers-reduced-motion`.

## Explicitly NOT done yet (next steps, not oversights)

- **The Bhui Amla 3D growth experience isn't ported into this app.**
  The vanilla-JS/Three.js version in `../khatore-homepage-v6-1.html` is
  tuned and verified (sticky-scroll fix, camera framing fix, botanical
  shape refinement — see git history); porting it into an R3F component
  here is real work, not started.
- Science section doesn't have the "molecular structures" visual
  language yet — currently the same document-register style as the rest
  of the site, which is correct and on-brand, just not the fuller
  treatment described in the brief.
- No dedicated Testimonials page (3 cards on the old homepage are
  placeholder, `[Awaiting Khatore content approval]` — nothing to port
  until real testimonials are cleared).
- Fonts still load from Google Fonts CDN, not self-hosted (a performance
  task, tracked, not done in this pass).
- Deployment target not chosen/configured (Vercel is the natural fit
  given the API route requirement, but nothing's been provisioned).

## Do not

- Do not add a checkout, cart, or payment integration. `BuyButton`
  redirects to the live Magento product page — that's the only purchase
  path until Phase 5 is explicitly opened.
- Do not fire the future event names from any component — the API route
  rejects them, but don't rely on that; they're schema placeholders only.
- Do not put anything from the Business Growth Audit (revenue, order
  counts, GA4 numbers, pricing history) into any page, component, or
  commit message here.
