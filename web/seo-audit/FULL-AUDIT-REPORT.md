# SEO Health Report — Pico y Placa Global

**Date:** 2026-07-27 · **Scope:** localhost dev/build (pre-launch, not yet publicly deployed)
**Method:** 10 parallel specialist audits (technical, content, schema, performance, visual, GEO, SXO, sitemap, cluster, DataForSEO) followed by a same-session implementation pass fixing the Critical/High findings.

## Overall SEO Health Score: 76 / 100 (post-fix estimate)

| Category | Score (pre-fix) | Status after this session |
|---|---|---|
| Technical SEO | 60/100 | Critical bugs fixed (sitemap 500, 404 handling, security headers, x-default) |
| Content Quality | 61/100 | Documented, not fixed (needs content decisions — see Action Plan Phase 3) |
| Schema / Structured Data | 76/100 | Precios Service schema added, ItemList/Breadcrumb completed |
| Performance (CWV) | Not measurable (API down) | Critical fetch-hang bug fixed; re-run Lighthouse once backend is stable |
| Visual / Mobile | 70/100 | Mobile nav fixed, pricing badge fixed; tap targets/dev-indicator remain |
| AI Search Readiness (GEO) | 71/100 | llms.txt added, heading hierarchy fixed; passage length/dateModified remain |
| Search Experience (SXO) | 55/100 | **Critical title/description bug fixed** (was shipping wrong-country copy) |
| Sitemap Architecture | 70/100 | Data-completeness gate, real lastmod, x-default, error resilience all fixed |
| Content Cluster Strategy | N/A (strategic) | Documented — Colombia hub recommended, not yet built |

Full per-category findings: `seo-audit/findings/*.md`. Screenshots: `seo-audit/screenshots/`.

---

## What Changed This Session

### Fixed (code shipped, build+typecheck+lint verified, re-tested live with the backend intentionally down)

1. **Critical — fetch calls with no timeout/error handling** (`lib/pico-placa.ts`, `precios/page.tsx`). A down/slow backend previously hung page renders indefinitely and made `sitemap.xml` and invalid city URLs return HTTP 500 instead of degrading gracefully. Added `AbortSignal.timeout()` + try/catch to all three raw `fetch()` call sites. **Verified live**: with the API backend down, `sitemap.xml` now returns 200, `/precios` returns 200, and `/ciudades/not-a-real-city` returns a real 404.
2. **Critical — wrong meta title/description on non-Colombian cities** (`lib/city-seo.ts`). Every city page's `<title>`/description was hardcoded to "Pico y placa en {city}..." copy regardless of `restriction_model` — confirmed shipping on Madrid (a low-emission-zone city) with nonsensical "digitos restringidos" copy that matches no real search query for that market. Refactored `RestrictionStrategy` to a per-model `meta()` method; added dedicated ES/EN copy for `emission_label_zone` and `congestion_charge`.
3. Sitemap: added a data-completeness gate (cities without a verified rule no longer ship a URL that 404s for Googlebot), replaced the always-`new Date()` `lastModified` on static pages with a fixed constant, added `x-default` hreflang, and wrapped the whole route in try/catch so a data outage degrades to a static-only sitemap instead of a 500.
4. Added `x-default` hreflang to every page's `alternates.languages` (previously only in the HTTP `Link` header, not the HTML `<link>` tags or the sitemap).
5. Parallelized the two sequential API calls on the city detail page (`Promise.all`).
6. Added security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) and `poweredByHeader: false` to `next.config.ts`. (CSP/HSTS deliberately deferred — see Action Plan.)
7. Added `Service`/`OfferCatalog` JSON-LD to `/precios` (previously had zero structured data); added `numberOfItems` and a `BreadcrumbList` to `/ciudades`.
8. Created `public/llms.txt` for AI-crawler citation context (Google Search ignores this file; it's for ChatGPT/Claude/Perplexity).
9. Removed a dead `/register` rule from `robots.txt` (real paths are `/registro` and `/en/register`, already separately disallowed).
10. Fixed a heading-hierarchy gap flagged by the GEO audit as the page's biggest structural-readability issue: the richest data block (the per-category restriction schedule cards) had no heading element at all (`CardTitle` rendered a `<div>`). Added an `as` prop to `CardTitle` and now render category titles as `<h3>`, added a (visually hidden, screen-reader/crawler-visible) `<h2>` above the schedule section, and promoted the plate-lookup widget's title from `<h3>` to `<h2>` to close the h1→h3 skip.
11. Fixed a real (non-cosmetic) bug in `CityRegionSection`: `region` is unique per city in the live data, so the "other cities in this region" module always rendered empty for every one of the 7 live cities. Added a same-country fallback.
12. Implemented a functional mobile navigation menu (`navbar.tsx`) — the hamburger button previously had no `onClick`/panel at all, making `/ciudades`, `/precios`, and docs completely unreachable from the navbar on mobile.
13. Fixed the clipped "Más popular" pricing badge (was positioned inside a `Card` with `overflow-hidden`, cutting it off on both desktop and mobile).
14. Added `fill-mode-both` to the two entrance-animation elements that were missing it (minor pop/flash on first paint).

### Documented but not fixed (needs product/content/infra decisions — see Action Plan)

- Content depth gap vs. ranking competitors (city pages run ~1/3–1/4 the word count of what's actually ranking).
- Thin-content fallback state (`_none`, live on Barranquilla) — only 2 FAQs, ~1 sentence of body copy.
- No About/Methodology page; "how we verify data" trust copy exists only on the homepage FAQ.
- No maps/images anywhere on the site (flagged by both SXO and GEO as a real gap for the `emission_label_zone` model especially).
- Colombia country hub page (`/ciudades/colombia`) — cluster audit found direct competitor evidence this SERP layer exists and is unclaimed.
- CSP/HSTS headers — deliberately not shipped blind; needs a `Report-Only` rollout with real `connect-src`/`img-src` auditing first.
- `NEXT_PUBLIC_SITE_URL` and the `llms.txt` city URLs still point at `localhost`/`picoyplaca.example.com` — **must** be set to the real production domain before deploy.
- DataForSEO keyword/SERP research could not run — the MCP credentials are returning `401 Unauthorized`.
- A stable, un-hashed logo asset for the `Organization` JSON-LD `logo` field — attempted a dedicated Route Handler for this and hit an unexplained 404 (custom `route.ts` handlers outside file-convention names didn't resolve in this project's Next.js setup even after a clean restart); reverted to `favicon.ico` rather than ship something broken. Worth a follow-up investigation or just committing a static PNG to `public/`.

---

## Cross-Cutting Pattern Worth Noting

Four of the ten audits **independently** converged on the same root cause (unguarded `fetch()` calls in `lib/pico-placa.ts`) from four different angles — technical (sitemap 500s), performance (page hangs), content (cali/cartagena 500s, medellin timeout), and the fix now verified live. This is now resolved everywhere it existed in the codebase (confirmed via a full-repo grep for `await fetch(`).

Similarly, the SXO and cluster audits both independently flagged that the site's Colombian `plate_digit_day` template is being applied to non-Colombian restriction models — the SXO audit caught it in the rendered `<title>`, the cluster audit caught it in the SERP-overlap data showing Madrid competes in a completely disjoint keyword universe. Both point to the same underlying fix (now shipped): make the template model-aware.
