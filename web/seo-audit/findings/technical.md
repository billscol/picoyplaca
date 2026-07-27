# Technical SEO Audit — Pico y Placa Global

**Scope:** Crawlability, indexability, security headers, URL structure/redirects, mobile-friendliness (HTML/CSS), structured data, JS rendering, hreflang/canonical correctness, IndexNow. Core Web Vitals lab testing excluded (covered by another agent).

**Audited against:** live dev server `http://localhost:3000` (es, default/no prefix) and `http://localhost:3000/en` (en, prefixed), `next-intl` `localePrefix: "as-needed"`, `web/next.config.ts`, `web/app/robots.ts`, `web/app/sitemap.ts`, `web/app/[locale]/layout.tsx`, `web/app/[locale]/(marketing)/ciudades/[slug]/page.tsx`, `web/lib/pico-placa.ts`.

**Score: 60 / 100**

---

## What Works

- **Canonical tags** are correct, absolute, and self-referencing on every page checked: `/` → `http://localhost:3000`, `/en` → `http://localhost:3000/en`, `/ciudades` → `.../ciudades`, `/en/cities` → `.../en/cities`, `/precios` → `.../precios`, `/ciudades/bogota` → `.../ciudades/bogota`, `/ciudades/madrid` → `.../ciudades/madrid`. No relative or mismatched canonicals found.
- **Reciprocal hreflang pairs resolve to real, reachable URLs** (all verified 200 OK): `/ciudades` ↔ `/en/cities`, `/precios` ↔ `/en/pricing` (note the localized `pathnames` mapping is honored correctly — `precios`→`pricing`, `ciudades`→`cities`), `/ciudades/bogota` ↔ `/en/cities/bogota`, `/ciudades/madrid` ↔ `/en/cities/madrid`. No dangling/404 alternates.
- **robots.txt** (`http://localhost:3000/robots.txt`, 200 OK) is well-formed, allows `/`, correctly disallows all private/auth routes for both locale variants (`/login`, `/registro`, `/register`, `/dashboard`, `/api-keys`, `/planes`, and the `/en/*` equivalents), and correctly declares `Sitemap: http://localhost:3000/sitemap.xml`.
- **`<meta name="robots">`** is `index, follow` (with `googleBot: max-image-preview:large, max-snippet:-1`) on all public pages checked, and correctly flips to `noindex` on the not-found rendering path.
- **JSON-LD is valid and well-formed** on every page sampled: `Organization` + `WebSite` (root layout, all pages), `FAQPage` + `BreadcrumbList` (city pages, e.g. Bogotá — 7 well-formed Q&A pairs, 3-level breadcrumb), `ItemList` (`/ciudades`, 7 cities with position/name/url). No schema errors, all `@context`/`@type` correct.
- **Mobile viewport** meta is correct and not restrictive: `<meta name="viewport" content="width=device-width, initial-scale=1"/>` — no `user-scalable=no` / `maximum-scale` lockout.
- **Trailing-slash normalization** works: `/ciudades/` → `308` → `/ciudades` (single-hop, no chain).
- **Locale negotiation** (`/es` explicit → `307` → `/` with `NEXT_LOCALE` cookie set) is a single redirect hop, no chains observed anywhere.
- OpenGraph/Twitter metadata, manifest, apple-icon (all previously implemented) are present and served without errors.

---

## Findings

### Critical

**1. `sitemap.xml` returns HTTP 500 — the sole declared sitemap is currently broken**
- Evidence: `curl -o /dev/null -w "%{http_code}" http://localhost:3000/sitemap.xml` → `500` (reproduced 3×, `SIZE:0`). robots.txt still correctly points crawlers at this URL.
- Root cause (`web/app/sitemap.ts`): calls `getCities()` then `Promise.all(cities.map(city => getCityRule(city.slug)))` with **no try/catch**. Both `getCities()` and `getCityRule()` in `web/lib/pico-placa.ts` do `await fetch(...)` against `NEXT_PUBLIC_API_URL` (`http://localhost:8000/v1`) and only guard against a non-OK HTTP response (`if (!res.ok) return null/[]`) — they do **not** guard against the `fetch()` promise itself rejecting (connection refused / DNS failure / timeout). In this environment the backend API on port 8000 is unreachable (`curl http://localhost:8000/v1` → connection failure, status `000`), so `fetch()` throws `TypeError: fetch failed`, which propagates uncaught and Next.js returns a 500.
- Impact: if the backend has any outage, blip, or slow cold-start in production, the sitemap — the primary URL-discovery mechanism referenced in robots.txt — goes completely dark. Search Console will log this as a sitemap fetch error and Google may stop trusting/re-fetching it for a period.
- Recommendation: wrap the `fetch()` calls in `lib/pico-placa.ts` in try/catch and return `[]`/`null` on any error (not just non-OK responses); in `sitemap.ts`, catch failures from `getCities`/`getCityRule` and fall back to at minimum the static paths (`/`, `/ciudades`, `/precios`) rather than throwing, so a partial sitemap is always served instead of a 500.

**2. Unknown/invalid city slugs return HTTP 500, not 404**
- Evidence: `curl -o /dev/null -w "%{http_code}" http://localhost:3000/ciudades/not-a-real-city` → `500` (also reproduced for `/en/cities/not-a-real-city` → `500`). The response body *does* contain the correct not-found markers (`<meta name="next-error" content="not-found"/>`, `<meta name="robots" content="noindex"/>`), and the RSC payload shows the actual thrown error: `{"digest":"3227098399","name":"TypeError","message":"fetch failed", ...}` — i.e. `notFound()` is being called correctly inside `CityDetailPage`, but the *status code* Next.js emits is 500 because the triggering condition is an unhandled fetch rejection, not a clean `!data` branch.
- Root cause: same as #1 — `web/app/[locale]/(marketing)/ciudades/[slug]/page.tsx` calls `getCityRule(slug)` in both `generateMetadata` and the page body with no try/catch, and `getCityRule` only translates `!res.ok` into `null`, not network-level fetch failures, into `null`.
- Impact: this is worse for SEO than a clean 404 — Google Search Console will surface this as a **server error (5xx)**, not a normal not-found, which affects crawl-health signals and (if it happens broadly) can throttle crawl rate. Since this is currently reproducible for *every* not-yet-ISR-cached URL (any slug, valid or invalid) whenever the backend is unreachable, it is not a narrow edge case.
- Note: pages already cached from build/dev-start time (`bogota`, `madrid`, etc. — all serving `x-nextjs-cache: HIT`) return 200 fine right now; this only surfaces on cache-miss paths, but that is exactly the situation that matters for genuinely-new/mistyped/deep-linked URLs and for the sitemap route (which is dynamic, not cached).
- Recommendation: same fix as #1 (catch network errors in `lib/pico-placa.ts`) — once `getCityRule` reliably returns `null` on any failure (HTTP or network), the existing `if (!data) notFound()` logic will correctly produce a real `404`.

### High

**3. No security headers configured anywhere**
- Evidence: `web/next.config.ts` has zero `headers()` config — confirmed by reading the file (only `env` key is set) — and confirmed empirically: response headers from `/`, `/en`, `/ciudades`, `/precios`, `/ciudades/bogota`, `/en/cities/madrid` contain none of: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`.
- Recommendation — add to `next.config.ts`:
```ts
const nextConfig: NextConfig = {
  poweredByHeader: false, // also fixes finding #4
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // CSP: start in Report-Only, this app loads next/og images, Google Fonts (Plus Jakarta Sans / Geist Mono via next/font — self-hosted, no external font host needed), and calls NEXT_PUBLIC_API_URL from the client for the plate lookup — audit actual connect-src/img-src needs before enforcing.
          { key: "Content-Security-Policy-Report-Only",
            value: "default-src 'self'; img-src 'self' data:; connect-src 'self' " + "${NEXT_PUBLIC_API_URL_ORIGIN}" + "; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
  env: { /* ...existing... */ },
};
```
  HSTS should only be sent once the production deployment is confirmed HTTPS-only end-to-end (do not ship HSTS while testing on plain HTTP).

### Medium

**4. hreflang `x-default` is inconsistent across the three signal channels**
- Evidence: the raw HTTP `Link` response header (auto-emitted by next-intl's middleware) **does** include `x-default` on every page, e.g. for `/ciudades/bogota`:
  `link: <http://localhost:3000/ciudades/bogota>; rel="alternate"; hreflang="es", <http://localhost:3000/en/cities/bogota>; rel="alternate"; hreflang="en", <http://localhost:3000/ciudades/bogota>; rel="alternate"; hreflang="x-default"`
  But the in-`<head>` `<link rel="alternate">` tags generated by the page's own `generateMetadata()` (via `getPathname`/`routing.locales`) only ever emit `es` and `en` — **no `x-default` tag exists in the HTML** on any page checked (home, `/ciudades`, `/precios`, `/ciudades/bogota`, `/ciudades/madrid`).
- Also confirmed in `web/app/sitemap.ts`: the `alternates.languages` map is built by iterating `routing.locales` only (`for (const locale of routing.locales)`), so the XML sitemap's hreflang annotations likewise never include `x-default`.
- Impact: not a hard failure (x-default is optional and the HTTP header does carry it), but it is an inconsistent signal across HTML/HTTP-header/sitemap that some crawlers/auditing tools only check one of. Since `es` is the default locale with no prefix, `x-default` should point at `es` (the root URL) everywhere for consistency.
- Recommendation: add an `"x-default"` key (pointing at the `es`/no-prefix URL) to the `languages` object built in `generateMetadata` (root layout is fine as-is via the middleware header, but the per-page `alternates.languages` in `app/[locale]/layout.tsx` descendants and in `app/sitemap.ts` should both add it explicitly) so all three channels agree.

**5. `X-Powered-By: Next.js` header exposed**
- Evidence: present on every response sampled (`/`, `/ciudades`, `/precios`, `/ciudades/bogota`, `/en/cities/madrid`).
- Recommendation: set `poweredByHeader: false` in `next.config.ts` (bundled into the snippet above).

**6. No custom `not-found.tsx` / `error.tsx`**
- Evidence: `Glob web/app/**/not-found.tsx` and `web/app/**/error.tsx` both return no matches anywhere in the app tree. The site relies entirely on Next.js's default not-found boundary.
- Impact: low on its own, but it compounds finding #2 — there's no application-level safety net that would keep a data-fetch failure from bubbling up as a raw 500. A route-level `error.tsx` under `app/[locale]/(marketing)/ciudades/[slug]/` that renders a branded 404-style UI would at least contain the blast radius, and a global `not-found.tsx` would give a branded (rather than default Next.js) 404 page.

### Low

**7. `Cache-Control: no-cache, must-revalidate` on all HTML responses**
- Evidence: consistent across every page fetched in this dev-server audit, alongside `x-nextjs-cache: HIT` / `x-nextjs-prerender: 1` (i.e. Next is serving prerendered/ISR content but still telling the client/CDN not to cache it).
- Note: this is very likely standard Next.js **dev-mode** behavior (dev server disables HTTP caching by design) rather than a production defect — could not be verified against a production build in this environment. Flagging so the production build's cache headers are checked explicitly before launch (an ISR page serving `no-cache` in prod would be a real CDN/edge-caching miss).

**8. IndexNow protocol not implemented**
- Evidence: no `indexnow` key file under `web/public/`, no reference to IndexNow/Bing/Yandex submission anywhere in the searched app tree.
- Recommendation: low-cost addition — generate a GUID key file at `public/<key>.txt`, and call the IndexNow API (Bing/Yandex/Naver share the endpoint) on publish/update of city rule pages via `indexnow_submit.py`-equivalent logic, to accelerate discovery of the ~dozens of city pages outside of Google's own crawl schedule.

**9. Minor structured-data content-quality gap (diacritics)**
- Evidence: JSON-LD text pulled directly from the API renders city/country names without their correct diacritics in multiple places — `"Bogota, Colombia"` (should be "Bogotá"), `"Medellin, Colombia"` (should be "Medellín"), `"Madrid, Espana"` (should be "España") in the `/ciudades` `ItemList`; the Bogotá `FAQPage`/`BreadcrumbList` also consistently render "Bogota" without the accent even though other Spanish accented characters in the same JSON blocks render correctly (e.g. "¿Qué días", "vehículos"). This indicates the source `city_name`/`country_name` fields themselves are missing diacritics, not a template/encoding bug.
- Impact: minor — affects the polish of rich-result snippets and FAQ answers; primarily a content-data fix (backend `city_name`/`country_name` values), flagged here because it surfaces in structured data. Recommend cross-checking with the content-quality audit.

---

## Untested / Blocked Items

- Because `sitemap.xml` currently 500s (finding #1), its `Content-Type` (`application/xml`), entry count, and per-URL `<xhtml:link>` alternates could not be verified end-to-end — re-test once the fetch-resilience fix ships.
- Production build cache-header behavior (see finding #7) could not be tested since only the dev server (`next dev`) was available.
- Could not verify how `getCityRule`'s `!res.ok` branch behaves for a slug the *backend itself* returns 404 for (as opposed to full backend unreachability) — the backend API on port 8000 was down for the entire audit window. Re-run the invalid-slug test with the backend up once available to confirm whether *any* residual crash path remains after the recommended try/catch fix.
