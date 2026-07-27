# Performance Audit — Pico y Placa Global

## Score: Not measurable in this session — see Limitations. Code-level review only.

**IMPORTANT LIMITATION:** No Lighthouse / PSI / CrUX lab or field numbers could be captured this session.
The backend API (`NEXT_PUBLIC_API_URL=http://localhost:8000/v1`, Laravel app under `picoyplaca/api`, run via
Docker) is unreachable: `docker ps` fails with `Error response from daemon: Docker Desktop is unable to
start`, and `com.docker.service` is `Stopped` (no permission to start it from this session). TCP connect to
`127.0.0.1:8000` succeeds (Docker's backend proxy accepts the socket) but the HTTP request never returns —
confirmed hung for 30s+ with 0 bytes received. Because the homepage, `/ciudades`, and `/ciudades/[slug]` all
`await` API calls with **no timeout**, every page in scope hangs indefinitely and `next build` (SSG/`generateStaticParams`
calling `getCities()`) cannot complete either — a production build/start could not be produced to run Lighthouse
against. All findings below are from static code inspection of the Next.js 16 app (`web/`), which is still able
to identify concrete, high-confidence issues (including the fetch-hang bug itself, which is a real production
risk, not just a local environment problem). Treat this report as a prioritized code review; re-run Lighthouse/PSI
once the API is reachable to confirm/quantify actual LCP/INP/CLS numbers.

---

## What Works

- **Fonts (next/font/google):** `Plus_Jakarta_Sans` and `Geist_Mono` are loaded via `next/font/google` in
  `web/app/[locale]/layout.tsx` (lines 2, 11-12). This self-hosts the font files at build time and inlines
  `@font-face` with a generated `font-display` (next/font defaults to `swap`) — there is **no** external
  request to `fonts.googleapis.com`/`fonts.gstatic.com`, so no extra render-blocking origin connection and
  no FOIT. Only the site's own origin is used to fetch font files, which can be preloaded/cached with the page.
  This is correctly configured and is not expected to be a meaningful LCP or CLS contributor.
- **No raster images / no next/image gap:** Confirmed via repo search — `public/` only contains the default
  Next.js placeholder SVGs, and every icon in `components/` is an inline `lucide-react` SVG component (tree-shaken,
  no network request, no intrinsic-size guessing needed). There is no hero photograph or content image anywhere
  in the marketing pages. The absence of `next/image` usage is therefore a non-issue here — there is no raster
  image to optimize, and it correctly avoids CLS from missing `width`/`height` on images.
- **Entrance animations are compositor-safe (low CLS risk):** `web/node_modules/tw-animate-css` confirms
  `animate-in`/`fade-in`/`slide-in-from-bottom-*`/`zoom-in` only ever animate `opacity`, `transform`
  (`translate3d`/`scale3d`/`rotate`) and `filter: blur()` — never `top`/`margin`/`height`/`width`. These
  properties are handled on the compositor thread and do not trigger layout or affect the position/size of
  sibling elements, so the widespread staggered `animate-in fade-in slide-in-from-bottom-4` usage across
  `page.tsx` and `ciudades/[slug]/page.tsx` should not register as CLS, and (since nothing runs on user
  interaction) it has no direct INP cost either.
- **Client component surface is small and well-scoped:** Only `navbar.tsx` and `city-filter-grid.tsx` (plus a
  handful of small marketing widgets) are `"use client"`. Both are small, self-contained, and use minimal
  state (`useState` for a filter toggle) — no heavy client-side libraries, no large hydration payloads
  expected from these specifically.
- **Revalidation strategy is reasonable in principle:** `getCities()`/`getCityRule()` use
  `fetch(..., { next: { revalidate: 3600 } })`, i.e. ISR-style caching at the data layer, which is the right
  primitive for content that changes rarely — *when the upstream is healthy* (see Critical finding below for
  the failure mode).

---

## Findings

### CRITICAL — API fetches have no timeout/abort and no error handling beyond `res.ok`; a slow/down upstream hangs the entire page render
**Severity: Critical (LCP/TTFB — page never paints)**

`web/lib/pico-placa.ts`:
```ts
export async function getCities(): Promise<City[]> {
  const res = await fetch(`${API_BASE}/pico-placa/cities`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export async function getCityRule(slug: string): Promise<CityRuleResponse | null> {
  const res = await fetch(`${API_BASE}/pico-placa/rules/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}
```
Neither call passes `signal: AbortSignal.timeout(...)`, and there is no `try/catch` around a network-level
failure (only an HTTP-status check via `res.ok`, which never runs if the socket just hangs). Node's built-in
`fetch` (undici) has **no default timeout**. This was reproduced live in this environment: the upstream API
container is unresponsive but still accepts TCP connections, and `curl` to it hangs 30+ seconds with 0 bytes
back. Every page in scope (`/`, `/ciudades`, `/ciudades/[slug]`) calls one of these functions synchronously in
the Server Component body (`await getCities()` / `await getCityRule()`) with no `Suspense` boundary around
them, so:
- TTFB/LCP for every page is fully coupled to upstream API latency, uncapped.
- `generateStaticParams` in `ciudades/[slug]/page.tsx` also calls `getCities()` — a slow/down API blocks
  `next build` itself (confirmed: the build could not complete in this session for this reason).
- There is no fallback UI, cached-stale-while-revalidate escape hatch, or user-visible error state — the
  request simply never resolves (in a serverless/edge deployment this would eventually hit a platform
  execution-time limit and 504; self-hosted Node has no such cap and will hold the connection/worker open
  indefinitely).

**Recommendation:**
1. Add a hard timeout to both calls, e.g. `fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(3000) })`, and wrap in `try/catch` returning the existing safe fallback (`[]` / `null`) on any thrown error (timeout, DNS, connection reset), not just non-OK HTTP status.
2. Wrap the sections that depend on `getCities()`/`getCityRule()` in `<Suspense>` with a lightweight skeleton fallback so static shell (hero copy, nav, footer) can stream/paint immediately instead of blocking on the fetch — this is the single highest-impact change available for LCP given the current "await entire API in the page body" pattern.
3. Consider `staleTimes`/`unstable_cache` with a short `revalidate` plus `stale-while-revalidate` semantics, or serving last-known-good cached data on fetch failure, so an upstream outage degrades to "stale but functional" instead of "page never loads."

### HIGH — City detail page issues two sequential (not parallel) API requests
**Severity: High (TTFB/LCP)**

`web/app/[locale]/(marketing)/ciudades/[slug]/page.tsx`, lines 80 and 89:
```ts
const data = await getCityRule(slug);   // request 1
...
const allCities = await getCities();    // request 2, only starts after request 1 resolves
```
`getCities()` (used only for the "related cities in region" section further down the page) does not depend
on `getCityRule()`'s result, so these two round-trips to the same API are serialized for no reason, roughly
doubling network-bound wait time before the page can render.

**Recommendation:** Fire both requests concurrently and await together:
```ts
const [data, allCities] = await Promise.all([getCityRule(slug), getCities()]);
if (!data) notFound();
```
(`getCities()` is also cached for 1h via `revalidate`, so in steady state this mostly matters on cold cache /
first hit per revalidation window, but it's a free, zero-risk fix.)

### MEDIUM — No confirmed dedupe of duplicate `getCityRule`/`getCities` calls per request
**Severity: Medium (TTFB, extra upstream load)**

`generateMetadata` in `ciudades/[slug]/page.tsx` calls `getCityRule(slug)` (line 46), and the page component
calls it again (line 80) — same for `getCities()` being called from the homepage, the `/ciudades` listing
page, and inside the city detail page. Next.js's `fetch` cache with `next: { revalidate }` should dedupe
*identical* `fetch()` calls within the same request/render pass (via the Next.js Data Cache), so this is
likely already deduplicated automatically by the framework rather than firing 2x network round trips — but
this depends on the exact fetch options matching and the Data Cache being enabled/warm. Worth confirming this
is actually being deduplicated in practice (e.g. via server logs/timing once the API is reachable), since if
it isn't, `generateMetadata` + the page body would double every request unnecessarily.

**Recommendation:** Verify de-duplication with real request timing once the API is up; if it's not deduped,
switch to React `cache()`-wrapped fetchers or `unstable_cache` keyed by slug/locale to guarantee single-flight
per request.

### LOW — A handful of entrance-animation elements omit `fill-mode-both`, causing a possible one-frame "flash" (not CLS, but a visual defect)
**Severity: Low (visual polish, not a Core Web Vitals failure)**

`tw-animate-css`'s `--animate-in` variable defaults `animation-fill-mode` to `none` unless a `fill-mode-*`
utility is also applied (confirmed in `node_modules/tw-animate-css/dist/tw-animate.css`). Most usages in this
codebase correctly add `fill-mode-both` (e.g. `page.tsx` line 62: `animate-in fade-in slide-in-from-bottom-4
fill-mode-both ...`), but a few do not, e.g.:
- `web/app/[locale]/(marketing)/page.tsx` line 58 (hero eyebrow badge): `animate-in fade-in zoom-in ... duration-500` — no `fill-mode-both`.
- `web/app/[locale]/(marketing)/ciudades/[slug]/page.tsx` line 160 (city icon badge): `animate-in zoom-in fade-in items-center ... duration-500` — no `fill-mode-both`.

Without `fill-mode-both`/`backwards`, the element renders at its normal (post-animation) opacity/scale for a
frame before the `enter` keyframe's "from" state is applied, which can produce a slight pop/flash rather than
a clean fade-in. Because the animated properties are still only `opacity`/`transform`, this does **not**
affect CLS (no layout is touched) — it's a minor visual-consistency nit, not a Core Web Vitals problem.

**Recommendation:** Add `fill-mode-both` to these two elements for visual consistency with the rest of the
codebase. Not performance-blocking.

### INFO — Heavy simultaneous entrance-animation count on first paint (INP/main-thread, likely negligible but worth spot-checking)
**Severity: Info**

The homepage alone triggers roughly a dozen separate `animate-in` elements on load (hero eyebrow, h1,
subtitle, CTA row, stats row, 3 "how it works" cards, up to 8 city cards, FAQ card, final CTA), each a
CSS `@keyframes` animation on the compositor thread. This is unlikely to cause a measurable INP regression
since these are declarative CSS animations (no JS `requestAnimationFrame` loop, no long tasks), but a large
number of concurrent compositor animations can still contribute a small amount of main-thread work for style
invalidation on a low-end device. Not expected to be a Core Web Vitals failure; flagged for awareness only,
recommend spot-checking Total Blocking Time / INP on a throttled device once real Lighthouse runs are
possible.

### INFO — Dynamic OG image routes are isolated and should not affect page TTFB
**Severity: Info (unconfirmed — could not verify live due to API outage)**

`app/[locale]/opengraph-image.tsx` and `app/[locale]/(marketing)/ciudades/[slug]/opengraph-image.tsx` use
`next/og`'s `ImageResponse`. These are separate Next.js routes (`/opengraph-image` etc.) resolved only when a
crawler/social scraper fetches the OG image URL, not as part of the HTML document request — so by
construction they run on a different request path than the page itself and should not add latency to the
page's own TTFB/LCP. This could not be empirically confirmed with a live server this session; recommend a
quick check (`curl -w "%{time_total}"` against the page URL vs. the `/opengraph-image` URL) once the API/build
is available, just to rule out any shared blocking resource (e.g. if `opengraph-image.tsx` itself calls
`getCityRule`, which — if slow — would only slow the OG image response, not the page, but is worth confirming
it doesn't also lack a timeout).

---

## Recommendations Priority Order

1. **Critical:** Add `AbortSignal.timeout()` + `try/catch` to `getCities()`/`getCityRule()` in `lib/pico-placa.ts`; wrap data-dependent sections in `<Suspense>` so pages can stream instead of fully blocking on the API. This is a correctness issue today (build/pages hang) and a latent LCP/TTFB risk in production the moment the API is slow, not just fully down.
2. **High:** Parallelize `getCityRule(slug)` and `getCities()` in `ciudades/[slug]/page.tsx` with `Promise.all`.
3. **Medium:** Confirm Next.js Data Cache is actually deduplicating repeated `getCities()`/`getCityRule()` calls across `generateMetadata` and the page body/other pages within a render; if not, add `cache()`/`unstable_cache`.
4. **Low:** Add `fill-mode-both` to the two entrance-animation elements missing it (hero eyebrow badge, city icon badge) for visual consistency.
5. **Info:** Once the API/build is reachable, run `npx next build && npx next start -p 3098` and `npx lighthouse http://localhost:3098/ --output json --chrome-flags="--headless"` (repeat for `/ciudades` and `/ciudades/bogota` or a real slug from `GET /v1/pico-placa/cities`) to get actual LCP/INP(TBT)/CLS/FCP/Speed Index numbers and confirm/refute the "Info" items above against real data. Also pull CrUX field data via `pagespeed_check.py`/`crux_history.py` if the site has public traffic.

---

## Environment Notes (why no live metrics)

- `docker ps -a` → `Error response from daemon: Docker Desktop is unable to start`.
- `Get-Service com.docker.service` → `Stopped`; `Start-Service` failed with `OpenError` (insufficient permission from this session).
- `netstat -ano` shows `com.docker.backend.exe` listening on `0.0.0.0:8000`/`[::1]:8000` with dozens of established connections, but any HTTP request against it (via `curl`, IPv4 or IPv6) hangs indefinitely with 0 bytes returned — the container behind Docker's proxy is not actually servicing requests.
- No local PHP/Composer available to run the Laravel API (`picoyplaca/api`) outside Docker as a fallback.
- Consequently `next build` (which needs `getCities()` for `generateStaticParams`) could not complete, so no production server, no Lighthouse run, and no PSI/CrUX check was possible this session.
- Re-run this audit's tooling steps (`pagespeed_check.py`, `render_page.py`, `npx lighthouse`) once Docker/the API backend is confirmed healthy.
