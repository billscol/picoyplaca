# SEO Action Plan — Pico y Placa Global

Items marked **✅ Done** were implemented and verified. Two sessions are recorded here: Session 1 (initial audit + fixes, backend down throughout) and Session 2 (Docker/backend restarted, real 16-city/9-country dataset available, deeper fixes + new features shipped and verified live).

## Phase 0 — Pre-launch blockers (do before the first deploy)

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real production domain in the production environment. Every canonical, hreflang, OG/Twitter URL, JSON-LD `url`/`item`, sitemap `<loc>`, and the `robots.txt` `Sitemap:` line derive from this — left as `localhost:3000` it will submit garbage URLs to Search Console on day one.
- [ ] Update the placeholder `https://picoyplaca.example.com` URLs in `public/llms.txt` to the real domain.
- [x] **✅ Done (Session 2)** — Docker/backend restarted and fully diagnosed. Root cause of the persistent 500s wasn't Docker itself: a pending migration (`005_legal_info.sql`) added a `legal_info` column the DB didn't have yet. Ran `php bin/migrate.php --seed` inside the container — applied the migration plus 6 new seed files that were sitting unapplied (Ecuador, Costa Rica, Brazil, USA, Mexico, Spain). Live dataset is now **16 cities across 9 countries** (previously assumed 7 across 2), with real per-city `legal_info` (fines/penalties) populated.
- [x] **✅ Done (Session 2)** — Re-verified live with the real backend: model-aware titles confirmed correct on Bogotá (`plate_digit_day`), Madrid (`emission_label_zone`), **and New York (`congestion_charge` — the model's first real city)**.
- [ ] Re-run `npx next build && npx next start` + Lighthouse for real LCP/INP/CLS numbers now that the backend is healthy (not done this session — focus was correctness/coverage, not lab performance metrics).

## Phase 1 — Critical/High technical fixes

- [x] **✅ Done** — `AbortSignal.timeout()` + try/catch on all `fetch()` calls (`lib/pico-placa.ts`, `precios/page.tsx`). Verified live both with the backend down (graceful degradation) and back up (no regressions).
- [x] **✅ Done** — Model-aware meta title/description (`lib/city-seo.ts`). Verified live on all 3 restriction models with real data.
- [x] **✅ Done** — Sitemap data-completeness gate, real `lastModified`, `x-default` hreflang, error resilience.
- [x] **✅ Done** — Parallelized city-page fetches (`Promise.all`).
- [x] **✅ Done** — Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) + `poweredByHeader: false`.
- [x] **✅ Done (Session 2)** — CSP shipped as `Content-Security-Policy-Report-Only` in `next.config.ts`, scoped to the app's real needs (`connect-src` includes the actual `NEXT_PUBLIC_API_URL` origin, `style-src`/`script-src` allow `unsafe-inline` for the inline `style={{ animationDelay }}` pattern used throughout). Not yet promoted to enforcing — collect violation reports first.
- [ ] **HSTS** — add only once production HTTPS is confirmed end-to-end; do not ship while any HTTP path exists.
- [x] **✅ Done (Session 2)** — `not-found.tsx` + `error.tsx` added under `ciudades/[slug]/`, branded and translated. Learned in the process: this Next.js version renamed the error-boundary `reset` prop to `unstable_retry`.
- [x] **✅ Done (Session 2)** — IndexNow key file (`public/22ef66b07336b4ca5ea29e6a70414ad6.txt`) + a `lib/indexnow.ts` submission helper, ready to call from wherever city rules get published (that pipeline lives in `api/`, not wired to auto-call yet — see note in the file).
- [x] **✅ Done (Session 2)** — Diacritics fixed at the source: updated `api/database/seeds/001_test_cities.sql` and `002_colombia_cities.sql`, plus ran direct `UPDATE`s against the live DB for every affected value across the full 16-city set (Bogotá, Medellín, España, San José, São Paulo, Ciudad de México, Perú, México — seed-runner re-execution doesn't overwrite already-applied migrations, so the live-DB update was necessary in addition to fixing the seed files for future re-seeds).

## Phase 2 — Schema & structured data

- [x] **✅ Done** — `Service`/`OfferCatalog` JSON-LD on `/precios`; `numberOfItems` + `BreadcrumbList` on `/ciudades`.
- [x] **✅ Done (Session 2)** — Stable logo asset resolved. Root cause found: `next-intl`'s middleware matcher didn't exclude `/apple-icon` (no dot in the URL, unlike `favicon.ico`/`robots.txt`/etc.), so it was being rewritten to a locale-prefixed path that doesn't exist and 404ing — **this meant `apple-touch-icon` had been broken for iOS users the whole time**, independent of the JSON-LD goal. Fixed the matcher in `proxy.ts`. Also captured the icon's PNG bytes as a real static `public/logo.png` for a guaranteed-stable JSON-LD `logo` URL (the file-convention route's hash suffix isn't safe to hardcode).
- [x] **✅ Done (Session 2)** — `dateModified` added to city-page `FAQPage` JSON-LD (from `rule.last_verified`, falling back to `effective_from`).
- [x] **✅ Done (Session 2)** — `FAQPage` JSON-LD added to `/precios` for the new developer FAQ section (see Phase 6).
- [ ] Add `sameAs` to the `Organization` block once official social profiles exist (none found currently — don't fabricate).

## Phase 3 — Content quality

- [x] **✅ Done (Session 2)** — Fine/penalty FAQ added (`lib/city-seo.ts` `legal_faq`), driven entirely by the real `city.legal_info` data now populated per city (e.g. São Paulo: "R$ 130,16 + 4 puntos en la licencia"). No fabrication — renders only when the API actually has the data.
- [x] **✅ Done (Session 2)** — "How we verify data" methodology now echoed per-city as a new `freshness` FAQ (`lib/city-seo.ts`), using the real `effective_from` date instead of just the homepage-only copy.
- [x] **✅ Done (Session 2)** — Literal date-based mini-calendar shipped (`components/marketing/upcoming-days-strip.tsx` + `lib/schedule-format.ts` `buildUpcomingDays`) — next 7 real calendar dates with restricted digits, for every `plate_digit_day` city with an active schedule. This was the single most-requested competitive gap in the SXO audit; verified live and via screenshot on Bogotá.
- [ ] Audit the `_none` thin-content fallback state across the full 16-city set (only Barranquilla was confirmed in Session 1).
- [ ] Verify `effective_from` dates reflect real history, not seed-data recency — needs real research per city, not something to fix blind.
- [ ] Add a brief About/Methodology page — still not done; would need real organizational copy, which wasn't fabricated.
- [ ] For `emission_label_zone`/`congestion_charge` cities: add a "how do I get my label" section and a static zone map — still open, needs real procedural content per country.
- Note: `note`/`sub_rules` per-category data turned out to **already be visible** in `PlateZoneSchedule`/`CategoryCard` (only the free-text `note` field, not `sub_rules`, is behind a `<details>`) — the original audit's premise here was slightly off; no change needed.

## Phase 4 — GEO / AI search readiness

- [x] **✅ Done** — `public/llms.txt` created; heading hierarchy fixed (schedule cards now real `<h3>`s, lookup widget promoted to `<h2>`, hidden section `<h2>` added). **Session 2 note:** a concurrent edit to `plate-zone-schedule.tsx` (unrelated feature work happening in parallel) reverted the `<h3>` fix on the "active schedule" `CardTitle` — re-applied it; worth double-checking after any future edit to that file.
- [x] **✅ Done (Session 2)** — `dateModified` added to structured data (see Phase 2).
- [ ] Lengthen the thinnest FAQ answers toward 134-167 words — partially addressed by the two new FAQs (freshness, fine) which are longer and richer, but the original short digit/holiday FAQs weren't individually rewritten.

## Phase 5 — Visual / mobile polish

- [x] **✅ Done** — Functional mobile nav menu.
- [x] **✅ Done** — Fixed clipped "Más popular" pricing badge.
- [x] **✅ Done** — `fill-mode-both` on the two entrance-animation elements missing it.
- [x] **✅ Done (Session 2)** — Confirmed via a real production build + screenshot that the floating dev-mode "N" indicator does **not** ship in production — false alarm, standard Next.js behavior, no fix needed.
- [ ] Bump tap targets under 44px — not revisited this session.
- [ ] Today/lookup banner distinction — not revisited this session (low priority, cosmetic).

## Phase 6 — Content architecture / strategic

- [x] **✅ Done (Session 2), and bigger than planned** — Built a **generic, data-driven country hub** at `/ciudades/pais/[country]` (routes to `/cities/country/[country]` in English) instead of a one-off Colombia page, since the real dataset turned out to have 16 cities across 9 countries, not 7 across 2. Auto-qualifies any country with 2+ cities (currently **Colombia: 6 cities, España: 2 cities** — Madrid + Barcelona, which shipped in the same seed batch that unblocked this). Each hub has its own title/description/canonical/hreflang, `BreadcrumbList` + `ItemList` + `FAQPage` JSON-LD, and lists real per-city data (no fabricated content). Wired into the sitemap, the `/ciudades` listing page (quick-link badges), and each city page's region section (`CityRegionSection` now links to the hub when the country qualifies).
- [x] **✅ Done (Session 2)** — Fixed a real bug found while building the hub: `CityRegionSection`'s "other cities in this region" module was silently empty on **every single city** because `region` is unique per city in the real data (department/province) — added a same-country fallback so the section (and now the hub link) actually renders.
- [x] **✅ Done (Session 2), lean version** — Added a developer-focused FAQ section to `/precios` (not new spoke pages) grounded in the real API routes (`GET /pico-placa/cities`, `/pico-placa/rules/{slug}`, `/pico-placa/check` — read directly from `api/routes/v1/picoplaca.php`, not guessed) plus `FAQPage` JSON-LD. Deliberately scoped down from the original "3 new spoke pages" plan — that would need real marketing copy this session didn't have justification to invent at that volume.
- [ ] Dedicated `/precios/api-pico-y-placa`-style spoke pages targeting Verifik/PlacApi competitor keywords — still open if the commercial content push needs to go further than the FAQ section.
- [ ] National explainer spokes (exceptions, fines) as **separate pages** — partially superseded: the fine data is now surfaced per-city via the Phase 3 FAQ instead, which may be sufficient; revisit only if templated-boilerplate duplication across the now-larger 6-city CO set becomes a real issue.

## Phase 7 — Off-page / data

- [x] **✅ Done (Session 2)** — Moz API credential configured (`~/.config/claude-seo/backlinks-api.json`), `requests` Python package installed, verified working (`backlinks_auth.py --check moz` → OK). Not run against a live domain yet since the site isn't publicly deployed — backlink analysis has nothing to measure pre-launch, but the tooling is ready for the moment it is.
- [ ] Fix DataForSEO MCP credentials (still `401 Unauthorized`, not touched this session) and re-run keyword/SERP research — now much more valuable given the real 9-country dataset.
- [ ] GSC/GA4/CrUX analysis still blocked on public deployment.

---

## Files in this audit

- `FULL-AUDIT-REPORT.md` — Session 1 summary and score breakdown
- `findings/technical.md`, `content.md`, `schema.md`, `performance.md`, `visual.md`, `geo.md`, `sxo.md`, `sitemap.md`, `cluster.md` — full per-specialist reports (Session 1; based on a partial/assumed dataset since the backend was down for most of that session — treat city/country counts in these as historical, not current)
- `screenshots/` — desktop + mobile captures from Session 1 (home, ciudades, city detail, precios)
- DataForSEO audit did not produce a file in Session 1 (credential failure, reported inline instead of fabricating data) — still unresolved
