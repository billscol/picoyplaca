# Sitemap Architecture Audit — Pico y Placa Global

**Score: 70/100**

**Audit method note:** The backend API (`http://localhost:8000`) was unresponsive for the entire audit window — `netstat` shows multiple connections to `127.0.0.1:8000` stuck in `CLOSE_WAIT`/`ESTABLISHED` with no response, and repeated `curl` attempts to `http://localhost:3000/sitemap.xml` (up to 150s timeout) and directly to the API never returned a body. Since `app/sitemap.ts` and `getCities()`/`getCityRule()` (`web/lib/pico-placa.ts`) both depend on that API, **I could not render or validate the live `sitemap.xml` output**. All findings below are derived from static code review of `web/app/sitemap.ts`, `web/app/robots.ts`, `web/i18n/routing.ts`, `web/navigation.ts`, `web/lib/pico-placa.ts`, and the route tree under `web/app/[locale]/`. Recommend re-running a live fetch once the API backend is healthy.

---

## What Works

- **Uses Next.js native `MetadataRoute.Sitemap`** (`web/app/sitemap.ts`) — this guarantees structurally valid XML (`urlset` namespace, escaping, etc.) and native `xhtml:link` alternate generation; no hand-rolled XML string building to get wrong.
- **Absolute, correct `<loc>` URLs**: every entry is built as `${siteUrl}${getPathname(...)}`, using the shared `getPathname` from `next-intl`'s `createNavigation(routing)` — the same source of truth used by page-level canonical/hreflang metadata, so sitemap URLs can't drift from actual route paths.
- **No private/gated routes leak into the sitemap.** Cross-checked `web/app/robots.ts` disallow list (`/login`, `/registro`/`/register`, `/dashboard`, `/api-keys`, `/planes` + `/en/*` equivalents) against `app/sitemap.ts`'s `staticPaths` (`/`, `/ciudades`, `/precios`) plus per-city entries — confirmed by walking every `page.tsx` in the app tree, there are exactly 4 public route templates (`/`, `/ciudades`, `/ciudades/[slug]`, `/precios`) and they are exactly what's in the sitemap. No orphans, no leaks in either direction.
- **hreflang alternates are correctly reciprocal and self-referencing.** Each sitemap entry builds `languages` by iterating `routing.locales` (`es`, `en`) through the same `getPathname`, so the `es` alternate always points back to itself and the `en` alternate is generated from `i18n/routing.ts`'s `pathnames` map — verified `/precios` ↔ `/en/pricing` and `/ciudades` ↔ `/en/cities`, `/ciudades/[slug]` ↔ `/en/cities/[slug]` match exactly. No mismatched or dead alternate paths.
- **City pages are data-driven, not pure "city-name-swapped" doorway pages.** `web/lib/city-seo.ts` and `app/[locale]/(marketing)/ciudades/[slug]/page.tsx` pull real per-city facts (restriction digits, days, hours, exceptions, region, contact channels, source URL, FAQ) into the template, so content genuinely differs by the underlying data even though sentence structure is shared. This is a reasonable starting position for the location-page quality gates (see Findings below for the caveat).
- **`generateStaticParams` in both `sitemap.ts`-adjacent pages and `[slug]/page.tsx` share the same `getCities()` source**, so sitemap membership and static generation are at least sourced consistently (though see the data-completeness gap below).
- `priority`/`changefreq` relative ordering is directionally sensible (home 1.0 > city 0.9 > static 0.7) even though both fields are ignored by Google.

---

## Findings

### 1. No data-completeness gate before adding a city to the sitemap — risk of shipping 404 URLs to Search Console
**Severity: High**

In `web/app/sitemap.ts`:
```ts
const cityRules = await Promise.all(cities.map((city) => getCityRule(city.slug)));
cities.forEach((city, index) => {
  ...
  const lastVerified = cityRules[index]?.rule.last_verified;
  entries.push({ ... lastModified: lastVerified ? new Date(lastVerified) : buildDate, ... });
});
```
Every city returned by `getCities()` is added to the sitemap unconditionally — the `cityRules[index]` null-check is only used to pick a fallback `lastModified`, never to skip the entry. But `app/[locale]/(marketing)/ciudades/[slug]/page.tsx` calls `notFound()` whenever `getCityRule(slug)` returns `null`. If a city exists in the cities list but its rule hasn't been published/verified yet (or the rules endpoint errors for that one slug), the sitemap will list a URL that **404s when Googlebot fetches it**. This is exactly the "extra pages: 404 or redirected" failure mode.

**Recommendation:** Filter `cities` to only those where `cityRules[index]` is non-null before pushing an entry:
```ts
cities.forEach((city, index) => {
  const rule = cityRules[index];
  if (!rule) return; // don't list cities without a verified rule
  ...
});
```
This is also the natural place to apply the "exclude sparse/unverified city data" safeguard requested for programmatic growth (see Finding 6).

### 2. `lastmod` for static pages is generation-time, not content-change time
**Severity: Medium-High**

```ts
const buildDate = new Date();
...
entries.push({ url: ..., lastModified: buildDate, ... }); // for "/", "/ciudades", "/precios"
```
`buildDate` is computed fresh every time `sitemap()` executes, not tied to when `/`, `/ciudades`, or `/precios` actually last changed meaningfully. Depending on the ISR/cache behavior of the special `sitemap.ts` route (no `export const revalidate` is set in this file, so its own regeneration cadence is implicit/undefined beyond the inner `fetch(..., { next: { revalidate: 3600 } })` calls), this value could update on every crawl. Google explicitly discounts `lastmod` values it deems inaccurate ("reflects the last significant change, not boilerplate/request time") — a `lastmod` that's always "now" is the textbook version of that problem and can cause Google to stop trusting `lastmod` from this sitemap entirely.

The same fallback-to-`buildDate` also applies to city pages when `last_verified` is missing (in addition to Finding 1, if you choose to keep the entry rather than exclude it).

**Recommendation:**
- Add `export const revalidate = 3600;` (or similar) to `web/app/sitemap.ts` so the whole route has a predictable, explicit regeneration cadence rather than relying on implicit behavior of the inner fetches.
- For static pages, use a real "last meaningfully changed" date tracked in code/CMS (e.g. a constant updated on deploy only when copy actually changes) instead of `new Date()` at request/build time.
- For city pages, only use `rule.last_verified` — if it's missing, that's itself a signal the page shouldn't be in the sitemap yet (see Finding 1) rather than a case for a synthetic fallback date.

### 3. `NEXT_PUBLIC_SITE_URL` still defaults to `localhost:3000`
**Severity: High (pre-launch blocker)**

`.env.local` has:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
and both `app/sitemap.ts` and `app/robots.ts` fall back to `"http://localhost:3000"` if the env var is unset. Since every `<loc>`, hreflang alternate, canonical, OG/Twitter URL, and the `Sitemap:` directive in `robots.txt` are derived from `siteUrl`, **if this is deployed as-is, the production sitemap will submit `http://localhost:3000/...` URLs to Google Search Console** — which will either be rejected outright or, worse, get indexed and immediately deindexed once Google can't crawl `localhost`. This must be set to the real production domain (e.g. `https://picoyplaca.example.com`) in the production environment before the first deploy, and should be verified via `curl https://<prod-domain>/sitemap.xml` post-deploy that URLs use the real domain.

### 4. Missing `x-default` hreflang alternate
**Severity: Low**

The `languages` map on each entry only contains keys for `routing.locales` (`es`, `en`) — there is no `x-default` entry. Since the default locale (`es`) is unprefixed and effectively serves as the fallback for unmatched locales/regions, Google recommends (not requires) an `x-default` alternate pointing at it. Currently a Japanese or French user with no `es`/`en` match has no explicit "default" signal in the sitemap (browser/Accept-Language negotiation via the `as-needed` prefix middleware still works at runtime, but the sitemap's hreflang block doesn't document it).

**Recommendation:** In the `languages` record construction in `app/sitemap.ts`, add an `"x-default"` key pointing to the same URL as the `es` (default locale) version.

### 5. Sitemap lists only the default-locale URL as `<loc>`; English pages exist solely as alternates, not as their own entries
**Severity: Low / Info**

Google's own worked example for hreflang-via-sitemap (developers.google.com/search/docs/specialty/international/localized-versions) shows **each language version getting its own full `<url>` block** (each with the same reciprocal, self-referencing alternate set), not one primary entry per page-group with the other locale only appearing inside `<xhtml:link>`. The current implementation only pushes one `entries.push(...)` per route, using `getPathname({ locale: routing.defaultLocale, ... })` as the sole `<loc>` — so `/en/cities`, `/en/pricing`, `/en/cities/[slug]`, and `/en` never appear as a `<loc>` value anywhere in the sitemap, only inside `hreflang="en"` links.

This is not invalid (hreflang reciprocity + self-reference, which is present, is the functional requirement Google actually enforces), and John Mueller has stated single-entry-with-alternates is acceptable. But it does mean English pages have zero independent sitemap "vote" and rely entirely on being discovered via crawl (nav/footer links) plus the alternate annotation. Given this is a bilingual site actively trying to rank in both markets, consider emitting a `<url>` entry per locale (both `es` and `en` as primary, each carrying the full reciprocal alternate set) to match Google's documented pattern exactly and give the English URLs their own sitemap presence.

### 6. Growth safeguard for programmatic city pages: content is data-driven but sentence templates are shared
**Severity: Medium (monitor as city count grows)**

Per Finding 1, there is currently no gate excluding sparse/unverified cities from the sitemap. Separately, on content quality: `lib/city-seo.ts`'s FAQ/intro generation plugs real per-city facts (digits, days, hours, exceptions) into a small set of shared i18n string templates (`plate_digit_day.intro_active`, `faq_none_question`, etc.) — the underlying prose skeleton is identical across every city, only the substituted facts differ. This is meaningfully better than a pure "city name swap" doorway page (facts genuinely vary, schedule tables and source citations are real and unique per city), but it is still a templated-prose pattern that Google's doorway-page heuristics specifically target once the page count is large.

**I could not determine the current number of cities** in the sitemap because the API backend was unreachable during this audit — this should be re-checked once the backend is healthy.

**Recommendation:**
- Re-run this audit's live fetch once `getCities()` responds, and count city pages against the thresholds: ⚠️ warn at 30+ pages (require 60%+ unique content per page — the templated-with-real-data pattern likely qualifies but should be spot-checked), 🛑 hard stop at 50+ (require explicit justification/sign-off before continuing to add cities without additional unique content, e.g. local news/context, images, or user-submitted corrections).
- Implement Finding 1's data-completeness filter now, before city count scales further, so unverified/sparse cities never reach either the sitemap or (implicitly, since it's the same `getCities()` source) `generateStaticParams`.

### 7. `robots.txt` has a dead disallow rule that doesn't match any real path
**Severity: Low (cleanup)**

`app/robots.ts` disallows `/register` (no locale prefix). But per `i18n/routing.ts`'s `pathnames` map, `"/register": { es: "/registro", en: "/register" }` combined with `localePrefix: "as-needed"` means the real URLs are `/registro` (es, already separately disallowed — correct) and `/en/register` (en, already separately disallowed — correct). The bare `/register` entry in the disallow list matches nothing that Next actually serves and is dead weight. Not harmful (a no-op rule), but worth removing for clarity/correctness, since a future person could mistake it for meaning something is being protected that isn't.

### 8. `changeFrequency: "daily"` on `/ciudades` and `/precios` overstates real freshness
**Severity: Low / Info**

Both are ignored by Google (per this audit's own checklist — `priority`/`changefreq` are Google-ignored signals), so this has no material SEO impact today, but if kept for other crawlers (e.g. Bing, which gives changefreq some weight) `"daily"` for a pricing page and a city-index listing page overstates how often those pages actually change relative to `"weekly"` used on the city detail pages themselves (which are the pages actually tied to changeable restriction schedules).

**Recommendation:** Either remove `priority`/`changefreq` entirely (they add bytes for zero benefit on Google, which is the majority of organic traffic for most sites), or if keeping them for other engines, set `/ciudades` and `/precios` to `"weekly"`/`"monthly"` respectively rather than `"daily"`.

---

## Sitemap Protocol Structural Check (from code, pending live re-validation)

| Check | Result |
|---|---|
| Valid XML output | Pass (Next.js native `MetadataRoute.Sitemap` serialization) — **not live-verified**, see method note |
| `<loc>` absolute & correct | Pass — all built from shared `getPathname` + `siteUrl` |
| `<lastmod>` ISO8601 format | Pass (format) / **Fail (semantics)** — see Finding 2 |
| `priority`/`changefreq` present | Present, Google-ignores both; ordering reasonable, `daily` value on 2 pages overstated — see Finding 8 |
| ≤50,000 URLs / ≤50MB | Pass — currently home + 2 static + N cities, nowhere near the cap; no index-sitemap splitting needed yet |
| Disallowed (robots.txt) URLs excluded from sitemap | Pass — verified no overlap |
| All real public pages present (no orphans) | Pass — verified against every `page.tsx` under `app/[locale]/` |
| Extra/404/redirected URLs in sitemap | **Cannot rule out** — see Finding 1 (no completeness gate) and method note (couldn't live-crawl to confirm) |
| hreflang reciprocity (es ↔ en) | Pass (reciprocal + self-referencing) — see Findings 4 & 5 for refinements |
| `NEXT_PUBLIC_SITE_URL` production-ready | **Fail** — still `localhost:3000`, see Finding 3 |

---

## Files Reviewed
- `C:\Users\xBills\Desktop\picoyplaca\web\app\sitemap.ts`
- `C:\Users\xBills\Desktop\picoyplaca\web\app\robots.ts`
- `C:\Users\xBills\Desktop\picoyplaca\web\i18n\routing.ts`
- `C:\Users\xBills\Desktop\picoyplaca\web\navigation.ts`
- `C:\Users\xBills\Desktop\picoyplaca\web\lib\pico-placa.ts`
- `C:\Users\xBills\Desktop\picoyplaca\web\lib\city-seo.ts`
- `C:\Users\xBills\Desktop\picoyplaca\web\app\[locale]\layout.tsx`
- `C:\Users\xBills\Desktop\picoyplaca\web\app\[locale]\(marketing)\ciudades\[slug]\page.tsx`
- `C:\Users\xBills\Desktop\picoyplaca\web\proxy.ts` (Next.js 16's renamed `middleware.ts`)
- `C:\Users\xBills\Desktop\picoyplaca\web\.env.local`
- `C:\Users\xBills\Desktop\picoyplaca\web\next.config.ts`
