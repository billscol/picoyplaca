# Search Experience (SXO) — Findings

**SXO Gap Score: 55 / 100** (measured on the `plate_digit_day` city template, represented by `/ciudades/bogota` — the site's strongest template; the `emission_label_zone` / `congestion_charge` templates score materially lower, see Finding 1)

> This score is separate from the SEO Health Score. It measures how well the page's format, depth, and structure match what Google is actually rewarding in the SERP for these queries — not crawlability/technical SEO.

## Method

- Fetched and read `app/[locale]/(marketing)/ciudades/[slug]/page.tsx`, `lib/city-seo.ts`, `lib/pico-placa.ts`, `components/marketing/today-status-card.tsx`, `plate-digit-lookup.tsx`, `restriction-schedule.tsx`, `emission-zone-card.tsx`.
- Rendered the live local pages: `http://localhost:3000/ciudades/bogota` (200, ~683 words incl. nav/footer chrome, ~630 unique body words) and `http://localhost:3000/ciudades/madrid` (200, only ~163 words incl. chrome, ~115 unique body words).
- Ran 4 representative Google searches via WebSearch and fetched the top competing pages: `pico y placa bogota hoy`, `pico y placa medellin hoy`, `zona de bajas emisiones madrid`, `low emission zone barcelona`.

## What Works

- **Page type is correct for the Colombian queries.** For "pico y placa bogota hoy" and "pico y placa medellin hoy", the SERP is dominated by the *exact same page type* our site produces: independent city-specific "restriction lookup" directory pages (not government pages, not news). 4/8 Bogotá results and 5/7 Medellín results are third-party lookup tools: [pyphoy.com/bogota](https://www.pyphoy.com/bogota), [pyphoy.com/bogota/particulares](https://www.pyphoy.com/bogota/particulares), [picoyplacaya.com.co/bogota](https://picoyplacaya.com.co/bogota), [calendariodecolombia.com/pico-y-placa/bogota](https://www.calendariodecolombia.com/pico-y-placa/bogota), [grupor5.com/pico-y-placa/bogota](https://www.grupor5.com/pico-y-placa/bogota), [pikoyplaka.com/medellin](https://pikoyplaka.com/medellin), [picoyplacahoycolombia.com/medellin](https://www.picoyplacahoycolombia.com/medellin). This is not a page-type mismatch — it's ALIGNED.
- **The above-the-fold today's-status pattern matches what wins.** Every competing lookup tool leads with an immediate restricted/free status headline before anything else (e.g. picoyplacaya.com.co shows "Fin de semana libre" instantly). `TodayStatus`/`RestrictionBanner` on our Bogotá page does the same thing — a today-status banner appears in the hero, above the plate-digit lookup, before any explanatory text.
- **The interactive plate-digit selector (`PlateDigitLookup`) matches the format competitors use to win.** picoyplacaya.com.co's "¿Tu placa tiene Pico y Placa hoy?" widget and our 0–9 digit-selector grid serve the identical job-to-be-done.
- **FAQPage + BreadcrumbList JSON-LD is implemented correctly** and matches the FAQ-rich format seen on pyphoy (8 topics) and picoyplacaya (8 topics) — a real structural strength, confirmed present in the rendered HTML (`"@type":"FAQPage"`, 7 Question/Answer pairs on the Bogotá page).
- **Freshness signals are genuinely good**: "Vigente desde 24 de julio de 2026 · Última verificación: 25 de julio de 2026" is visible directly under the H1, one day before render — this mirrors the daily-freshness cues used by [infobae.com's daily pico y placa article](https://www.infobae.com/colombia/2026/07/23/tenga-en-cuenta-este-es-el-pico-y-placa-en-medellin-para-hoy-23-de-julio-de-2026/) and government pages.

## Findings

### Finding 1 — CRITICAL: Meta title/description are hardcoded to "pico y placa" copy and are factually wrong for non-Colombian restriction models (Madrid, Barcelona, and any congestion-charge city)

`lib/city-seo.ts` → `buildCitySeo()` pulls the page `<title>` and meta description from two global i18n keys — `meta.title_active` / `meta.description_active` in `messages/es.json` (lines 73–76) — **regardless of `city.restriction_model`**:

```
"title_active": "Pico y placa en {city} hoy: días, dígitos y horario",
"description_active": "¿Qué días no puede circular tu carro en {city}? Consulta los dígitos restringidos, el horario y las excepciones vigentes."
```

Confirmed on the live rendered Madrid page (`emission_label_zone` model — a low-emission zone, not a plate-rotation scheme):

- `<title>Pico y placa en Madrid hoy: días, dígitos y horario</title>`
- meta description: "¿Qué días no puede circular tu carro en Madrid? Consulta los dígitos restringidos, el horario y las excepciones vigentes."

"Pico y placa" and "dígitos restringidos" (restricted digits) are Latin-American terms that **do not exist for Madrid's ZBE** — Madrid restricts by environmental *label* (etiqueta), not by plate digit or day. Every Google result actually ranking for "zona de bajas emisiones madrid" ([madrid.es](https://www.madrid.es/portales/munimadrid/es/Inicio/Movilidad-y-transportes/Zonas-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones-ZBE-/), [comunidad.madrid](https://www.comunidad.madrid/medio-ambiente/zonas-bajas-emisiones-zbe), [race.es](https://www.race.es/zonas-de-bajas-emisiones/mapa-zbe-madrid), [carwow.es](https://www.carwow.es/zona-bajas-emisiones/madrid)) uses "zona de bajas emisiones", "etiqueta ambiental", "distintivo" — none use "pico y placa" or "dígito". This is both a relevance problem (title/description don't contain the actual query terms a Madrid searcher uses) and a trust/CTR problem (a searcher who does click will see a snippet that looks like it's about the wrong country's traffic system, and will likely bounce). This will affect **every** `emission_label_zone` and `congestion_charge` city in the catalog (i.e. every Spanish/European/US congestion-pricing city), not just Madrid.

**Recommendation:** Make `meta.title_active`/`description_active` (and the `_none` variants) model-aware — branch by `city.restriction_model` the same way `RestrictionStrategy` already branches `intro()` and `faqs()` in `city-seo.ts`. Minimum viable fix: add `emission_label_zone` and `congestion_charge` variants of the title/description strings ("Zona de bajas emisiones en {city}: etiquetas restringidas y horario" / "Peaje urbano en {city}: tarifa y horario"), keyed off the same `RestrictionStrategy` pattern already used for FAQs.

### Finding 2 — HIGH: Content depth is roughly 1/3 to 1/4 of what's actually ranking, and the gap is far worse on non-Colombian city templates

Actual body word counts (nav/footer chrome excluded) vs. ranking competitors:

| Page | Model | Unique body words | Ranking competitor word counts observed |
|---|---|---|---|
| `/ciudades/bogota` | plate_digit_day | ~630 | pyphoy.com/bogota ~2,400–2,600; picoyplacaya.com.co/bogota ~2,400–2,600; calendariodecolombia.com/bogota ~1,200+; medellin.gov.co (Medellín SERP) ~substantial, multi-section |
| `/ciudades/madrid` | emission_label_zone | ~115 | madrid.es / race.es / carwow.es — all multi-section explainer pages with maps and vehicle-eligibility detail |

The Madrid page is essentially a single card (zone name, a handful of label badges, one hours string) plus 3 FAQ questions. It has no explanation of *why* the zone exists, no mention of the special-protection sub-zones (ZBEDEP "Centro"/"Plaza Elíptica" that [madrid.es](https://www.madrid.es/portales/munimadrid/es/Inicio/Movilidad-y-transportes/Zonas-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones-ZBE-/) covers), and critically no guidance on **how a foreign-plated or newly-purchased car gets an environmental label** — the single highest-intent question for this query cluster (see Persona 4/5 below). Competing content wins with format elements our template doesn't have at all: real weekly/monthly calendar tables with literal dates (not just abstract "digit ends in 1 or 2" text), maps of the restricted zone, and step-by-step "what do I do" guidance.

**Recommendation:** For `plate_digit_day` cities, add a literal date-based mini-calendar (next 5–7 days with actual dates, not just abstract digit rules) — this is the single most consistent differentiator across every ranking Bogotá/Medellín competitor. For `emission_label_zone`/`congestion_charge` cities, add: (a) a short "how do I get my label/sticker" or "how do foreign/rental vehicles register" block, (b) sub-zone detail where applicable, (c) a static map image or embed.

### Finding 3 — MEDIUM: Zero media on any city page

`grep` for `<img` and raster media across the rendered Bogotá and Madrid HTML returned zero matches — only inline `<svg>` UI icons (Lucide glyphs). Ranking competitors ([medellin.gov.co](https://www.medellin.gov.co/es/secretaria-de-movilidad/pico-y-placa-medellin-hoy/), [picoyplacaya.com.co](https://picoyplacaya.com.co/bogota), [race.es](https://www.race.es/zonas-de-bajas-emisiones/mapa-zbe-madrid)) all use maps, infographics, or rotation-calendar images. This is a Media/UX signal gap Google's SERP feature selection (image pack, map pack proximity) can penalize indirectly, and it's a genuine trust/comprehension gap for users trying to visualize a restricted zone boundary (relevant for both `emission_label_zone` and the `regional`/zone-based sub-rules already present in the Bogotá payload, e.g. "Solo dentro de La Candelaria").

**Recommendation:** Add a lightweight static zone map for `emission_label_zone`/`congestion_charge` cities at minimum (highest ROI — that's where a boundary genuinely needs to be visualized); a rotation-calendar graphic for `plate_digit_day` cities is a lower-priority nice-to-have since the interactive digit-selector partially substitutes.

### Finding 4 — HIGH: Page-type ceiling risk differs sharply by market — Spanish-language ZBE queries may not be independently rankable at all

The SERP composition is fundamentally different across the two markets tested:

- **Colombian "hoy" queries (Bogotá, Medellín):** independent third-party directory/lookup tools make up the *majority* of results (see "What Works" above) — this is a realistically winnable SERP.
- **"zona de bajas emisiones madrid" (Spanish):** 5 of 7 results are official/institutional domains ([geoportal.madrid.es](https://geoportal.madrid.es/IDEAM_WBGEOPORTAL/dataset.iam?id=7e9120c8-881e-11ed-8764-34298f78123d), [madrid.es](https://www.madrid.es/portales/munimadrid/es/Inicio/Movilidad-y-transportes/Zonas-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones-ZBE-/), [comunidad.madrid](https://www.comunidad.madrid/medio-ambiente/zonas-bajas-emisiones-zbe), [madrid360.es](https://www.madrid360.es/medio-ambiente/zonas-de-bajas-emisiones/), [esmadrid.com](https://www.esmadrid.com/madrid-360-zonas-bajas-emisiones)), plus one auto-association reference site ([race.es](https://www.race.es/zonas-de-bajas-emisiones/mapa-zbe-madrid)) and one commercial car-buying site ([carwow.es](https://www.carwow.es/zona-bajas-emisiones/madrid)). **Zero independent third-party aggregator/directory sites rank in the results we observed.**
- **"low emission zone barcelona" (English):** by contrast, two genuine multi-city LEZ directory/aggregator sites *do* rank — [urbanaccessregulations.eu](https://urbanaccessregulations.eu/countries-mainmenu-147/spain/barcelona) and [green-zones.eu](https://www.green-zones.eu/en/low-emission-zones/spain/barcelona) — structurally the closest real-world analog to what this site is trying to be, alongside official sites ([ajuntament.barcelona.cat](https://ajuntament.barcelona.cat/qualitataire/en/low-emission-zone/what-barcelona-ring-roads-low-emission-zone), [zbe.barcelona](https://www.zbe.barcelona/en/zones-baixes-emissions/la-zbe.html), [amb.cat](https://www.amb.cat/en/web/mobilitat/mobilitat-sostenible/zbe/zones-baixes-emissions/vehicles-afectats)) and tourist-guide commercial content ([barcelona-tourist-guide.com](https://www.barcelona-tourist-guide.com/en/transport/low-emission-zones/low-emission-zones-in-barcelona.html), [barcelona.com](https://www.barcelona.com/transportation/zbe-barcelona)).

This means the ranking ceiling for Spanish-language ZBE city pages is structurally lower than for Colombian pico y placa pages, independent of content quality — combined with Finding 1's title bug and Finding 2's thin content, Madrid/Spain city pages are currently the weakest link in the catalog and may need a different strategy (e.g. targeting English-language international-driver queries, where aggregator format precedent exists, rather than competing head-on with Spanish government domains).

**Recommendation:** Prioritize fixing Finding 1 and 2 for `emission_label_zone` cities and consider modeling the English-locale versions of these pages on `urbanaccessregulations.eu`/`green-zones.eu` (multi-city comparison framing, foreign-driver registration guidance) rather than the Colombian `plate_digit_day` template, since that's the format actually proven to rank for this query type.

## User Stories / Persona Fit

| # | Persona | SERP signal it's derived from | Does the page satisfy it? |
|---|---|---|---|
| 1 | Driver checking if they can drive **today** before leaving the house (Bogotá/Medellín) | picoyplacaya.com.co leads with "Fin de semana libre"; infobae publishes a fresh dated article daily; medellin.gov.co shows today's status via infographic near the top | **Yes.** `TodayStatus` banner is in the hero, above the fold, before the plate lookup. This is the page's strongest persona fit. |
| 2 | Someone planning the **whole week** ahead, not just today | calendariodecolombia.com and picoyplacaya.com.co both show full weekly tables with literal dates; medellin.gov.co shows the whole semester rotation infographic | **Partially.** `PlateDigitLookup` shows which *day-of-week* a digit is restricted, but never shows literal upcoming dates — user has to mentally map "Tue/Thu" onto a calendar themselves. No competitor-equivalent weekly date table exists on our page. |
| 3 | New car owner who doesn't know their category/exemptions | pyphoy and picoyplacaya FAQs explicitly cover motorcycle exemptions, category identification, electric/hybrid exemptions | **Yes, well covered.** Category cards (Particulares/Motos/Taxis/Carga/etc.) plus FAQ ("¿Qué vehículos están exceptuados...") directly answer this. |
| 4 | Foreign tourist/rental driver about to drive into a European low-emission zone | barcelona-tourist-guide.com explicitly targets this ("Driving to Barcelona as a Tourist? ... Green Certificate ... fine"); esmadrid.com is the city's own tourism board page | **No — this is the weakest persona fit on the whole site.** The Madrid `EmissionZoneCard` shows only restricted/allowed label badges and hours; there is no guidance on what a "sin etiqueta" label means, how to obtain a label, or that foreign vehicles typically need separate registration. Combined with Finding 1's wrong title, this persona is effectively unserved today. |
| 5 | Car buyer/owner deciding what to buy given ZBE eligibility | carwow.es ranks with "qué coches pueden entrar" (which cars can enter) framing | **No.** The page shows label *categories* (B, C, ECO, 0) but never maps them to real vehicle types/fuel/age, so a user can't self-classify without leaving the page. |

## Single Biggest Risk

**Finding 1 (title/description hardcoded to Colombian "pico y placa" copy across all restriction models) is the single biggest concrete fix.** It is a one-file, low-effort change (`lib/city-seo.ts` + i18n message keys) that currently guarantees every non-Colombian city page — Madrid, Barcelona, and any future congestion-charge city — ships a title and meta description that don't match the query language or intent at all, undermining both relevance matching and click-through before any other gap (content depth, media, personas) even gets a chance to matter.

## Limitations

- The backend API (`NEXT_PUBLIC_API_URL=http://localhost:8000/v1`) was intermittently unreachable during this audit; city data availability may be cached/stale for some slugs. Bogotá and Madrid were successfully rendered live; Barcelona and other cities were not individually verified.
- No backlink/domain-authority data is available for this pre-launch site (not yet publicly deployed), nor for the competitor domains cited — authority scoring in the Gap Score reflects structural signals only (visible bylines, citations, outbound sourcing), not actual measured domain authority.
- SERP results reflect a single WebSearch snapshot (2026-07-26/27) and may shift with Google's AI Overview rollout or local personalization; no AI Overview presence/absence was independently confirmed beyond what WebSearch surfaced.
- This audit did not evaluate Core Web Vitals, crawlability, or indexability — those belong to the Technical SEO category, not SXO.
- English-locale (`/en/ciudades/...`) versions of pages were not separately rendered/audited; findings assume the Spanish-locale template structure applies equivalently.

Cross-skill references: the label-eligibility/registration gap in Finding 4 (`emission_label_zone` cities) is an E-E-A-T/content-depth issue best addressed via a content-focused pass; the missing title/description branching in Finding 1 also warrants a schema review to confirm `FAQPage` answers stay accurate once model-specific copy is added.
