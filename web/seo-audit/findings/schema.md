# Structured Data / Schema.org Audit — Pico y Placa Global

**Score: 76/100**

Method: fetched live HTML directly from the running dev server (`curl` against `http://localhost:3000/`, `/ciudades`, `/ciudades/bogota`, `/ciudades/madrid`, `/precios`, `/en`), extracted every `<script type="application/ld+json">` block, parsed/validated each against the Schema.org spec and Google's Rich Results requirements, and cross-checked against the source (`app/[locale]/layout.tsx`, `.../ciudades/[slug]/page.tsx`, `.../ciudades/page.tsx`, `.../precios/page.tsx`, `lib/pico-placa.ts`, `lib/city-seo.ts`).

## What Works

- **JSON-LD only** — no Microdata/RDFa mixed in. Correct format per Google's preference.
- **`@context": "https://schema.org"`** (https, not http) used consistently across all four blocks types found.
- **All JSON-LD blocks are syntactically valid** — every block parsed cleanly with `json.loads`, no trailing commas, no malformed nesting. This would pass Google's Rich Results Test's structural checks.
- **FAQPage content genuinely matches visible content 1:1.** Verified in `app/[locale]/(marketing)/ciudades/[slug]/page.tsx`: the `faqJsonLd` block and the on-page `<Accordion>` both render from the *same* `seo.faqs` array (built once by `buildCitySeo()` in `lib/city-seo.ts`, lines 96–104 and 250–258). This is a single-source-of-truth pattern, not just an accidental match — it structurally guarantees markup/visible-content parity for every city and every restriction model (`plate_digit_day`, `emission_label_zone`, `congestion_charge`), confirmed by inspecting rendered output for both `/ciudades/bogota` (plate_digit_day) and `/ciudades/madrid` (emission_label_zone).
- **BreadcrumbList on city pages** (`/ciudades/[slug]`) is correctly structured: `ListItem` array, sequential `position` starting at 1, absolute `item` URLs, matches the visible breadcrumb nav in the page header.
- **ItemList on `/ciudades`** correctly enumerates every city returned by `getCities()` with sequential positions and absolute URLs — matches the visible city grid.
- **Organization/WebSite present on every locale** (verified on both `/` and `/en`), with `inLanguage` correctly set per-locale.

## Findings

### 1. [Medium] Organization `logo` points to `favicon.ico` — likely to fail Google's Logo requirements
**Location:** `app/[locale]/layout.tsx` line 82: `logo: \`${siteUrl}/favicon.ico\``

Google's Logo structured data guidelines require the image to be at least **112×112px**, square-ish, and in a browser-safe raster format (PNG/JPEG/GIF/WebP are reliably supported; `.ico` — especially a multi-resolution favicon that commonly bundles 16/32/48px frames — is not a guaranteed-parseable format for the Logo extraction pipeline, and even the largest embedded frame is often below the minimum). This block will likely validate structurally in the Rich Results Test but risks being silently ignored or flagged for the Logo feature specifically.

The codebase already generates a proper 180×180 PNG at `app/apple-icon.tsx` (via `next/og` `ImageResponse`) — this is a much better fit and requires no new asset.

**Recommendation:** point `logo` at the generated icon route instead of the raw favicon.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pico y Placa Global",
  "url": "https://picoyplaca.example.com",
  "logo": "https://picoyplaca.example.com/apple-icon"
}
```
(Replace `apple-icon` with whatever square ≥112px PNG the team standardizes on; `apple-icon.tsx` already outputs 180×180 PNG so it satisfies the minimum today.)

### 2. [Info] `siteUrl` falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset
**Location:** `app/[locale]/layout.tsx` line 14, repeated in `.../ciudades/[slug]/page.tsx` line 91 and `.../ciudades/page.tsx` line 39.

Confirmed live: every JSON-LD block fetched in this audit contains `"url": "http://localhost:3000"` / `item: "http://localhost:3000/..."` because the env var isn't set in this dev environment. This is expected in dev and not a code defect, but it's worth a hard confirmation before each production deploy that `NEXT_PUBLIC_SITE_URL` is set to the real `https://` domain — if it's ever missing in production, every JSON-LD block site-wide silently ships with `localhost` URLs, which Google will not treat as valid identifiers for BreadcrumbList/ItemList/Organization. Flagging as Info since it's a deploy-config check, not a code bug — worth adding a build-time assertion (`if (!process.env.NEXT_PUBLIC_SITE_URL) throw ...` in a production build guard) if not already present elsewhere.

### 3. [Info] FAQPage — no more Google SERP benefit (policy change), downgrade priority
**Location:** `app/[locale]/(marketing)/ciudades/[slug]/page.tsx`

Google retired the FAQ rich result for all sites as of May 7, 2026 (this supersedes the Aug 2023 restriction to government/health sites only). The FAQPage block on every city page is structurally valid and its content matches the visible accordion 1:1 (see "What Works" above), but it no longer earns a SERP rich-result. There is no harm in keeping it (any AI/GEO-answer-engine benefit from having Q&A explicitly marked up is unconfirmed but plausible, and removing it is pure cost with no verified benefit), so this is **not** something to prioritize fixing or removing — just noting it's cosmetic from a Google Search standpoint going forward. No action required.

### 4. [Low] ItemList (`/ciudades`) missing `numberOfItems`; no rich-result payoff for this generic use
**Location:** `app/[locale]/(marketing)/ciudades/page.tsx` lines 40–49

`numberOfItems` is a recommended (not required) property on `ItemList` and costs nothing to add — cheap correctness win. Separately: a generic `ItemList` of directory links (cities) does not itself unlock a Google Carousel or other rich result — Google's ItemList carousel support is scoped to specific content types (recipes, courses, restaurants, etc.), not arbitrary link lists — so this block is best understood as an entity/crawl-hint aid rather than a rich-result driver. Keep it, just complete it.

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "numberOfItems": 7,
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Barranquilla, Colombia", "url": "https://picoyplaca.example.com/ciudades/barranquilla" }
  ]
}
```
(`numberOfItems` should be `cities.length` computed alongside the existing `itemListJsonLd` object.)

### 5. [Low] No BreadcrumbList on the `/ciudades` listing page itself
City detail pages have a 3-level breadcrumb (Home → Cities → City); the `/ciudades` listing page has no BreadcrumbList at all, only the client-rendered nav text. Cheap, consistent win:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://picoyplaca.example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Ciudades", "item": "https://picoyplaca.example.com/ciudades" }
  ]
}
```

### 6. [Medium] Missing opportunity: `/precios` (pricing page) has zero structured data
**Location:** `app/[locale]/(marketing)/precios/page.tsx` — confirmed via live fetch, no `<script type="application/ld+json">` present at all.

The page renders API subscription plans (`name`, `price_monthly_usd`, `requests_month_quota`, `burst_per_minute`) fetched from `${NEXT_PUBLIC_API_URL}/billing/plans`. This is a good fit for structured pricing markup, but the *type* matters:

- **Not `SoftwareApplication`** — that type is meant for installable/downloadable apps (with `operatingSystem`, install counts, etc.); a REST API product doesn't fit the schema semantics and Google's SoftwareApplication rich result expects app-store-style signals this page doesn't have. Don't force it.
- **`Product` + `Offer`** is workable (Schema.org's `Product` definition explicitly covers "any offered product **or service**"), and is the most widely-recognized shape for parsers/LLMs, but Google's *Product rich result* eligibility (price/availability snippet, Merchant Center feed) is oriented at physical/e-commerce goods and typically wants `gtin`/`brand`/reviews that don't apply here — so don't expect a Search Product snippet from this alone.
- **Best fit: `Service` with `hasOfferCatalog`** — accurately models "one API product, three pricing tiers," carries `priceSpecification` per tier, and doesn't misrepresent the product as physical software or (see below) a government service.

This won't unlock a distinct Google SERP rich result today (there is no dedicated "SaaS/API pricing table" rich result), but it is valid, low-cost, non-misleading structured data that helps entity/AI-answer-engine understanding of "what is this product and what does it cost" — worth adding given the page currently has nothing at all.

**Recommendation** — generate dynamically from the already-fetched `plans` array (do not hardcode plan data; the plans are fetched live from `/billing/plans` and change over time):

```tsx
// Insert in app/[locale]/(marketing)/precios/page.tsx, after `const plans = await getPlans();`
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const pricingJsonLd = plans.length > 0 ? {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Pico y Placa Global API",
  "serviceType": "Vehicle restriction data API",
  "provider": { "@type": "Organization", "name": "Pico y Placa Global", "url": siteUrl },
  "areaServed": ["CO", "ES"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "API plans",
    "itemListElement": plans.map((plan) => ({
      "@type": "Offer",
      "name": plan.name,
      "url": `${siteUrl}/precios`,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": plan.price_monthly_usd,
        "priceCurrency": "USD",
        "billingDuration": "P1M",
        "unitText": plan.requests_month_quota < 0 ? "unlimited requests/month" : `${plan.requests_month_quota} requests/month`,
      },
    })),
  },
} : null;

// In JSX, alongside the existing sections:
{pricingJsonLd && (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
)}
```

Note: in this dev environment `/billing/plans` returned no data (`plans` was empty because the backing API wasn't reachable), so the block correctly renders nothing rather than emitting empty/placeholder offers — the `plans.length > 0` guard is required to avoid publishing a `Service` with an empty `OfferCatalog`, which would be invalid markup.

### 7. [Info] `Place` / `GovernmentService` considered and deliberately not recommended
Evaluated per the actual data model (`lib/pico-placa.ts`: `City`, `Rule`, `RestrictionModel` = `plate_digit_day | emission_label_zone | congestion_charge`):

- **`GovernmentService`** does not fit: this site is a third-party data aggregator, not the government body that issues the restriction. Marking city pages as `GovernmentService` (whose `provider` should be a `GovernmentOrganization`) would misrepresent who is actually offering the "service," which risks a manual structured-data spam action if it reads as impersonating an official source. Skip it.
- **`Place`** (e.g., wrapping each city as a `Place`/`City` entity with an `additionalProperty` for the restriction) is schema-valid but adds no Google rich result and mostly duplicates what `BreadcrumbList`/`ItemList` already convey about the city entity. Low value for the effort — not recommended unless there's a specific Knowledge Graph/Maps integration goal.
- **`HowTo`** — per policy, never recommend; Google removed HowTo rich results in September 2023. The "how to check your restriction" flow (plate lookup on the city page) should stay as plain UI, not `HowTo` markup.

### 8. [Low] Organization missing `sameAs` (optional)
No social profile links were found in `components/marketing/footer.tsx` (checked via `grep`, no matches for twitter/facebook/instagram/linkedin/github URLs). If/when official social accounts exist, add `sameAs` to the `Organization` block for stronger entity disambiguation:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pico y Placa Global",
  "url": "https://picoyplaca.example.com",
  "logo": "https://picoyplaca.example.com/apple-icon",
  "sameAs": ["https://twitter.com/...", "https://www.linkedin.com/company/..."]
}
```
No action needed until those profiles exist — do not fabricate URLs.

## Detected Schema Inventory (live-fetched)

| Page | Blocks found | Types |
|---|---|---|
| `/` (es) | 2 | Organization, WebSite |
| `/en` | 2 | Organization, WebSite |
| `/ciudades/bogota` (`plate_digit_day`) | 4 | Organization, WebSite, FAQPage (7 Q&A), BreadcrumbList (3 levels) |
| `/ciudades/madrid` (`emission_label_zone`) | 4 | Organization, WebSite, FAQPage (3 Q&A), BreadcrumbList (3 levels) |
| `/ciudades` | 3 | Organization, WebSite, ItemList (7 items) |
| `/precios` | 2 | Organization, WebSite (no page-specific schema) |

All blocks passed JSON parsing and required-property checks for their respective types (`Question`/`Answer` pairs present in every FAQPage entity; `position`+`item`/`url` present in every `ListItem`). No `congestion_charge`-model city currently exists in the live data set to spot-check that FAQ strategy's rendered output, but its code path in `lib/city-seo.ts` (`congestionChargeStrategy`) follows the identical single-source-of-truth pattern as the other two models, so the same 1:1 markup/content guarantee applies once such a city is added.

## Priority Summary

1. **Medium** — Swap Organization `logo` from `favicon.ico` to `/apple-icon` (180×180 PNG already generated in-repo).
2. **Medium** — Add `Service`/`OfferCatalog` JSON-LD to `/precios`, generated dynamically from the `plans` fetch (currently zero structured data on this page).
3. **Low** — Add `numberOfItems` to the `/ciudades` ItemList; add a 2-level BreadcrumbList to `/ciudades`.
4. **Info** — Confirm `NEXT_PUBLIC_SITE_URL` is set in every production environment (dev fallback correctly produces `localhost` URLs, which would be invalid if it ever leaked to prod).
5. **Info** — FAQPage is valid and content-matched but no longer drives a Google SERP feature (policy change); no action needed, do not remove.
6. **Info** — `Place`, `GovernmentService`, `HowTo`, `SoftwareApplication` all evaluated against the actual data model and deliberately not recommended (see Finding 7 and Finding 6 rationale).
