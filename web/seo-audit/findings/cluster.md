# Semantic Cluster & Hub-and-Spoke Architecture — Pico y Placa Global

Audit-only. No project files modified. Grounded in real inventory (API `getCities()` seed
data — the live `GET http://localhost:8000/v1/pico-placa/cities` endpoint hung/timed out
during this audit and never returned; ground truth was reconstructed from
`api/database/seeds/001_test_cities.sql`, `002_colombia_cities.sql`,
`003_categories_and_metadata.sql`, and migration `004_cities_metadata.sql`, cross-checked
against `lib/pico-placa.ts` types). **Flag for engineering**: the `/v1/pico-placa/cities`
endpoint appears to hang indefinitely (connection accepted, never responds, curl times out
at 10s+) — this is a functional bug independent of SEO, but it also means `generateStaticParams`,
the sitemap, and `/ciudades` itself will fail/time out in the same way in this environment;
worth a ticket.

## 0. Real inventory (ground truth used for this analysis)

| slug | city | country | region (dept.) | restriction_model | live restriction? |
|---|---|---|---|---|---|
| bogota | Bogotá | Colombia (CO) | Bogotá, D.C. | plate_digit_day | yes |
| medellin | Medellín | Colombia (CO) | Antioquia | plate_digit_day | yes |
| cali | Cali | Colombia (CO) | Valle del Cauca | plate_digit_day | yes |
| bucaramanga | Bucaramanga | Colombia (CO) | Santander | plate_digit_day | yes |
| cartagena | Cartagena | Colombia (CO) | Bolívar | plate_digit_day | yes |
| barranquilla | Barranquilla | Colombia (CO) | Atlántico | plate_digit_day | **no** (repealed, Decreto 0450/2025) |
| madrid | Madrid | España (ES) | Comunidad de Madrid | emission_label_zone | yes (Madrid Central) |

7 published cities, 2 countries, 2 of the 3 `RestrictionModel` values actually populated.
`congestion_charge` exists in the type system and in `RestrictionSchedule`/`MODEL_ICON` but
**no city uses it yet** — treated as a placeholder cluster, not built out with fabricated
keywords. `metro_area` is `NULL` on every seeded city (schema is ready for e.g. Valle de
Aburrá satellite towns around Medellín, but nothing is seeded).

**Important existing-code finding**: `region` is a *department/province*, and every seeded
city has a **unique** region value (Bogotá→"Bogotá, D.C.", Medellín→"Antioquia", Cali→"Valle
del Cauca", etc.). `components/marketing/city-region-section.tsx` filters siblings by
`c.region === city.region`, so with the current data **`siblings.length` is always `0` for
every single city** — the "related cities" card silently renders nothing (well, it early-returns
after the header/region label, no sibling chips) on all 7 live pages today. This is a real,
present-day internal-linking gap, not a hypothetical — see §4.

## 1. Keyword expansion (seed → variants, grounded in real cities)

Expanded via WebSearch (autosuggest/PAA/related-searches surfaced in results) across the
actual restriction types and cities present in the data, plus the commercial/API layer.
Navigational keywords (competitor brand names like "pyphoy", "grupor5", "picoyplacaya") were
excluded from clustering per methodology — they're logged in §2 only as SERP-overlap evidence.

### Geographic — plate_digit_day (Colombia), Informational
1. pico y placa bogota hoy
2. pico y placa medellin hoy
3. pico y placa cali hoy
4. pico y placa bucaramanga hoy
5. pico y placa cartagena hoy
6. pico y placa barranquilla vigente
7. pico y placa bogota domingo
8. pico y placa bogota fin de semana
9. pico y placa bogota festivos
10. pico y placa regional bogota
11. pico y placa medellin motos
12. pico y placa cali taxis
13. pico y placa cartagena horario
14. pico y placa bucaramanga sabado
15. calendario pico y placa [ciudad] 2026
16. horario pico y placa [ciudad]
17. digitos pico y placa hoy

### Geographic — national/cross-city, Informational (the "hub" queries)
18. pico y placa colombia
19. pico y placa colombia todas las ciudades
20. pico y placa hoy colombia
21. excepciones pico y placa vehiculos electricos hibridos
22. pico y placa vehiculos electricos colombia
23. multa por pico y placa colombia cuanto vale
24. sanciones pico y placa colombia
25. pico y placa carga colombia
26. pico y placa taxis colombia

### Geographic — emission_label_zone (Spain), Informational
27. zona de bajas emisiones madrid
28. madrid central zbe
29. etiqueta ambiental madrid
30. multa madrid central
31. zonas de bajas emisiones españa mapa (national/EN candidate, only 1 ES city live today)
32. zbe barcelona / zbe sevilla / zbe bilbao (**future-cluster candidates only — no city live**)

### Geographic — congestion_charge (**no live city — logged for future roadmap only**)
33. peaje de congestion [ciudad] (placeholder, do not build page yet)
34. congestion charge [city] (EN placeholder)

### Commercial / API layer, Commercial + Transactional
35. pico y placa api
36. api pico y placa colombia
37. consultar pico y placa por placa api
38. vehicle restriction api latin america
39. license plate restriction api colombia
40. api zonas de bajas emision españa
41. pico y placa api precio / pricing
42. integrar pico y placa en mi app

### Navigational (excluded from clustering)
- pyphoy, grupor5, picoyplacaya, calendariodecolombia, verifik, placapi (competitor brands)

## 2. SERP overlap findings (WebSearch sampling)

Full pairwise top-10 scraping for all 42 keywords isn't practical through WebSearch (it
returns a curated ~7-9 link sample per query, not raw SERP HTML), so overlap was measured on
the **domain set returned per query**, sampled across every live city plus the national and
commercial variants — sufficient to validate/invalidate the hub hypotheses this audit was
asked to test.

| Domain | bogota | medellin | cali | bucaramanga | cartagena | barranquilla | colombia (national) |
|---|---|---|---|---|---|---|---|
| pyphoy.com | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| grupor5.com | ✔ | – | ✔ | ✔ | ✔ | ✔ | ✔ |
| picoyplacaya.com.co | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| calendariodecolombia.com | ✔ | ✔ | – | ✔ | – | ✔ | – |
| pikoyplaka.com | – | ✔ | ✔ | – | – | – | – |
| picoyplacahoycolombia.com | – | ✔ | – | – | – | – | ✔ |
| consultarpyp.com.co | – | – | ✔ | – | – | – | ✔ |
| [city].gov.co (official) | ✔ | ✔ | – | ✔ | ✔ | ✔ | – |

**Estimated same-country cross-city overlap: 3–4 shared aggregator domains per city pair**
in the visible sample (pyphoy.com + picoyplacaya.com.co + grupor5.com/calendariodecolombia.com
recur on almost every city), which on a full top-10 pull would plausibly land in the
**4–6 "same cluster" band** per the scoring thresholds. Every one of these recurring domains
runs the exact hub+spoke pattern this audit was asked to evaluate: one country-level page
(`pyphoy.com/`, `grupor5.com/pico-y-placa`) linking out to per-city subpages
(`pyphoy.com/bogota`, `grupor5.com/pico-y-placa/bogota`, etc.), and the country-level pages
themselves rank for "pico y placa colombia" / "pico y placa colombia todas las ciudades".
**This is direct, current evidence that a Colombia country hub is justified** — competitors
already own that SERP layer and the site has nothing there today.

**Madrid vs. every Colombia query: 0 shared domains.** Madrid ZBE results are exclusively
Spain-specific ZBE aggregators (race.es, xataka.com, carwow.es, madrid.es, madrid360.es,
electroverse.com, parking-madrid.es, dacia.es) — completely disjoint competitor set,
confirming country + restriction-model are both real, non-redundant clustering axes: a
Colombia plate-digit-day city and a Madrid ZBE page never compete for the same searcher.

**Spain ZBE has the same national-aggregator pattern, one country ahead of us**: the
"zonas de bajas emisiones españa" query surfaces national ZBE hub sites (race.es,
ecomovilidad.es, bajasemisiones.com, ceroemisiones.es, newgearcars.es) that already cover
Madrid, Barcelona, Sevilla, Bilbao, San Sebastián, Palma as spokes of one hub. **We only have
1 Spanish city live**, so building a Spain country hub today would violate the "2-4 spokes"
minimum viability bar — but the moment a 2nd Spanish ZBE city ships, replicate the Colombia
hub pattern immediately; the competitive precedent is already proven.

**Commercial/API layer: 0 overlap with any informational query**, on either side. "pico y
placa api" / "vehicle restriction api latin america" surfaces `docs.verifik.co`,
`movilidadbogota.gov.co` (official exemption lookup), `placapi.com`, GitHub repos,
`apis.net.pe` — a completely separate SERP with two identifiable direct competitors for the
*paid API* business specifically: **Verifik** (`docs.verifik.co/.../verificar-pico-y-placa-para-bogota`)
and **PlacApi** (`placapi.com`), both of whom already publish per-city API documentation
pages. This confirms the commercial layer needs its own dedicated content cluster feeding
`/precios` — it should not be bolted onto the informational city pages.

**National sub-topics have their own SERP, independent of any single city**:
"excepciones pico y placa vehiculos electricos" surfaces `bogota.gov.co` +
`medellin.gov.co` + third-party blog `c3carecarcenter.com` (ranking 3x across
exceptions/multa queries) and explicitly states electric/hybrid exemptions apply "en la
mayoria de las ciudades colombianas" — i.e., this is genuinely a national topic, not a
per-city one. Same for "multa por pico y placa colombia" (dominated by national news outlets
citing one fine figure across multiple cities, though the seed data shows Bucaramanga's fine
figure actually differs from Bogotá's — a nuance a national explainer should call out rather
than each city page repeating boilerplate).

## 3. Existing near-duplicate content risk (not clustering per se, but adjacent)

`lib/city-seo.ts` generates FAQ answers per city from `t("plate_digit_day.faq_exceptions_answer", …)`
and `faq_holidays_answer` — and per the seed data, **most CO cities share the same
`exceptions: ["electric","hybrid", ...]` and `holidays_suspended: true` values**, so the FAQ
answer text is templated and near-identical across 6 pages, differentiated mainly by city
name substitution. This isn't classic keyword cannibalization (each city page still targets
a distinct `[city]` keyword and has unique schedule data), but it's thin/duplicate boilerplate
that a national "excepciones" explainer (§5, Cluster C) can absorb — city pages should link
out to the canonical explainer instead of re-deriving the same paragraph 6 times. Flagging
for the `seo-content` skill / E-E-A-T pass.

## 4. Hub-and-spoke recommendation

**Current structure**: flat, single-tier — `/ciudades` (index) → `/ciudades/[slug]` (7 pages).
No country or restriction-type grouping exists.

**Recommendation: add exactly one new hub tier today — a Colombia country hub — and defer
the rest until inventory justifies them.**

- **Add `/ciudades/colombia` (or `/pico-y-placa/colombia`) as a new pillar.** Justified by
  §2: competitors already run country hub → city spoke, and "pico y placa colombia" is a
  distinct, high-intent query with zero current coverage on the site. This also gives the 2
  new national informational spokes (exceptions, fines — §5 Cluster C) a home, and fixes the
  §0 sibling-linking gap for the 6 CO cities in a way `CityRegionSection` cannot (region is
  1:1 per city; country is the correct grouping key).
- **Do not add a Spain country hub yet** — 1 city can't be a "hub" (schema/skill requires
  2-4 spokes per cluster). Ship Madrid as-is off the global `/ciudades` index; promote to
  `/ciudades/espana` the moment a 2nd Spanish ZBE city (Barcelona, Sevilla, Bilbao, etc.) is
  seeded — reuse the Colombia hub template verbatim, since §2 shows Spain's SERP already has
  the identical national-aggregator-over-city-pages pattern waiting to be matched.
- **Do not add a global restriction-type hub** (e.g. `/zonas-bajas-emision` aggregating ZBE
  cities across *all* countries). §2 shows zero SERP overlap between a Colombian
  plate-digit-day search and a Spanish ZBE search — no single searcher's query spans both, so
  a cross-country restriction-type hub would be competing for a demand pattern that doesn't
  exist yet. The existing client-side model filter on `/ciudades`
  (`components/marketing/city-filter-grid.tsx`) already gives users that segmentation without
  needing a crawlable, indexable hub page. Revisit only once 2+ countries each have 2+ cities
  on the *same* model (e.g., Madrid + Barcelona both ZBE) — at that point a same-country,
  same-model hub is really just the country hub with a filter, which we'll already have.
- **`metro_area` / `CityRegionSection` should be kept for its intended narrower purpose**
  (genuinely conurbated satellite municipalities sharing one metro's actual rule — e.g. a
  future Bello/Envigado/Itagüí seeded under Medellín's metro), **not repurposed as the
  country-level linking mechanism.** It's the wrong grouping key for "Bogotá relates to
  Medellín" (different regions, different rules, same country) — that's exactly what the new
  country hub is for. Both mechanisms are needed; they solve different problems and today
  neither one is populated for country-level linking.
- **Add a commercial content cluster feeding `/precios`** — 2-3 new landing/spoke pages
  (e.g. `/precios/api-pico-y-placa`, `/precios/api-zonas-bajas-emision` or a `/desarrolladores`
  section) targeting the API-commercial keyword set from §1/§2, which is proven to be a fully
  separate SERP from the informational city content and currently has zero site coverage
  against named competitors Verifik and PlacApi.

## 5. Cluster plan (JSON)

```json
{
  "pillar_candidates": [
    { "keyword": "pico y placa colombia", "rationale": "broadest real cross-city demand, zero current site coverage, competitors already rank a country-hub page for it", "selected": true }
  ],
  "clusters": [
    {
      "id": "co-metro-major",
      "name": "Colombia — Grandes Ciudades",
      "pillar": { "keyword": "pico y placa colombia", "url": "/ciudades/colombia", "template": "country_hub", "intent": "informational", "word_count_target": "2500-4000" },
      "posts": [
        { "keyword": "pico y placa bogota hoy", "url": "/ciudades/bogota", "template": "city_spoke_existing", "intent": "informational", "word_count_target": "1200-1800" },
        { "keyword": "pico y placa medellin hoy", "url": "/ciudades/medellin", "template": "city_spoke_existing", "intent": "informational", "word_count_target": "1200-1800" },
        { "keyword": "pico y placa cali hoy", "url": "/ciudades/cali", "template": "city_spoke_existing", "intent": "informational", "word_count_target": "1200-1800" }
      ]
    },
    {
      "id": "co-metro-secondary",
      "name": "Colombia — Ciudades Intermedias",
      "pillar": { "keyword": "pico y placa colombia", "url": "/ciudades/colombia", "template": "country_hub", "intent": "informational" },
      "posts": [
        { "keyword": "pico y placa bucaramanga hoy", "url": "/ciudades/bucaramanga", "template": "city_spoke_existing", "intent": "informational", "word_count_target": "1200-1800" },
        { "keyword": "pico y placa cartagena hoy", "url": "/ciudades/cartagena", "template": "city_spoke_existing", "intent": "informational", "word_count_target": "1200-1800" },
        { "keyword": "pico y placa barranquilla vigente", "url": "/ciudades/barranquilla", "template": "city_spoke_existing", "intent": "informational", "word_count_target": "1200-1800", "note": "no restriction currently in force — page should explicitly answer 'is there pico y placa in Barranquilla' rather than a schedule table" }
      ]
    },
    {
      "id": "co-national-info",
      "name": "Colombia — Contenido Nacional de Apoyo",
      "pillar": { "keyword": "pico y placa colombia", "url": "/ciudades/colombia", "template": "country_hub", "intent": "informational" },
      "posts": [
        { "keyword": "excepciones pico y placa vehiculos electricos hibridos colombia", "url": "/ciudades/colombia/excepciones-vehiculos-electricos", "template": "national_explainer_spoke", "intent": "informational", "word_count_target": "1200-1600", "rationale": "absorbs near-duplicate exceptions FAQ text currently templated across 6 city pages (see city-seo.ts)" },
        { "keyword": "multa por pico y placa colombia cuanto vale", "url": "/ciudades/colombia/multas-y-sanciones", "template": "national_explainer_spoke", "intent": "informational", "word_count_target": "1000-1400", "rationale": "national query, but must surface real per-city fine variance found in seed data (Bucaramanga $633,200 vs. Bogota $604,100 in the SERP sample) instead of one blanket number" }
      ]
    },
    {
      "id": "es-zbe-pending",
      "name": "España — ZBE (cluster pendiente, 1 ciudad)",
      "pillar": null,
      "posts": [
        { "keyword": "zona de bajas emisiones madrid", "url": "/ciudades/madrid", "template": "city_spoke_existing", "intent": "informational", "word_count_target": "1200-1800", "note": "standalone until a 2nd Spanish ZBE city ships; do not force a 1-spoke hub. Link from /ciudades index directly." }
      ],
      "status": "pending_second_city"
    },
    {
      "id": "commercial-api",
      "name": "API / Comercial",
      "pillar": { "keyword": "pico y placa api", "url": "/precios", "template": "pricing_pillar_existing", "intent": "commercial" },
      "posts": [
        { "keyword": "api pico y placa colombia", "url": "/precios/api-pico-y-placa", "template": "commercial_spoke_new", "intent": "commercial", "word_count_target": "1200-1600", "competitors": ["docs.verifik.co", "placapi.com"] },
        { "keyword": "vehicle restriction api latin america", "url": "/precios/api-pico-y-placa (en)", "template": "commercial_spoke_new", "intent": "commercial", "word_count_target": "1200-1600" },
        { "keyword": "integrar pico y placa en mi app", "url": "/precios/guia-integracion", "template": "commercial_spoke_new", "intent": "transactional", "word_count_target": "800-1200" }
      ]
    }
  ],
  "future_placeholder_clusters": [
    { "id": "es-zbe-multi-city", "trigger": "2nd Spanish ZBE city seeded", "action": "promote es-zbe-pending to full country hub /ciudades/espana, mirroring co-metro-* pattern" },
    { "id": "congestion-charge", "trigger": "1st congestion_charge city seeded", "action": "do not build 'peaje de congestion [city]' pages until real city data exists — no fabricated content" }
  ]
}
```

## 6. Internal link matrix

**Mandatory (bidirectional, spoke ↔ pillar):**
- `/ciudades/{bogota,medellin,cali,bucaramanga,cartagena,barranquilla}` ↔ `/ciudades/colombia`
- `/precios/api-pico-y-placa`, `/precios/api-pico-y-placa-en`, `/precios/guia-integracion` ↔ `/precios`
- `/ciudades` (global index) → every one of the 7 city pages + `/ciudades/colombia` (already true today via `CityFilterGrid`, just needs the new hub added to the list)

**Recommended (spoke ↔ spoke, same sub-cluster):**
- Bogotá ↔ Medellín ↔ Cali (co-metro-major, interlink each other — e.g. in the FAQ or a "otras ciudades grandes" module)
- Bucaramanga ↔ Cartagena ↔ Barranquilla (co-metro-secondary)
- Every CO city page's "exceptions" FAQ answer → `/ciudades/colombia/excepciones-vehiculos-electricos` (replaces/supplements templated boilerplate from `city-seo.ts`)
- Every CO city page's fine/penalty mention → `/ciudades/colombia/multas-y-sanciones`
- Both national explainer spokes ↔ `/ciudades/colombia` pillar (already covered under mandatory, restated for clarity) and ↔ each other

**Optional (cross-cluster):**
- `/ciudades/colombia` → `/precios` ("this data is also available via API")
- `/ciudades/madrid` → `/precios/api-pico-y-placa-en` (API also serves Spain's ZBE data model)
- `/precios/api-pico-y-placa` → `/ciudades/colombia` (developer wants to see the underlying consumer-facing data first)

**Incoming-link count check per spoke (must be ≥3):**
- Bogotá: pillar (1) + Medellín/Cali interlink (2) + excepciones spoke (1) + multas spoke (1) = 5 ✓
- Medellín/Cali: same pattern = 5 ✓ each
- Bucaramanga/Cartagena/Barranquilla: pillar (1) + 2 sub-cluster interlinks + excepciones + multas = 5 ✓ each
- Madrid: `/ciudades` index (1) only today — **below the 3-link minimum**, flagged as an
  orphan-risk page until the Spain hub (§4/§5 future cluster) exists. Interim mitigation:
  feature Madrid in the homepage and in the commercial API spoke's "supported markets" list to
  get it to 2-3 inbound links without waiting on a 2nd Spanish city.
- Commercial spokes: `/precios` pillar (1) + cross-links between the 3 commercial spokes (2) = 3 ✓ each

## 7. Cannibalization check

- No two pages currently target the same primary keyword. Confirmed via `city-seo.ts` /
  `messages/es.json` meta title pattern (`meta.title_active` interpolates `{city}` — every
  title is city-scoped, none targets "Colombia" broadly).
- **Introduce-with-care**: the new `/ciudades/colombia` pillar must NOT have its `<title>`/H1
  overlap with any individual city's title pattern (e.g. avoid "Pico y Placa Colombia Hoy" if
  any city page's title also contains "Colombia Hoy" generically — checked, they don't; city
  titles are `"Pico y Placa en {city} Hoy"` style).
- **Soft cannibalization / thin-content risk** (not keyword-level, but worth tracking): the
  templated exceptions/holidays FAQ text in `city-seo.ts` is near-duplicate across the 6 CO
  cities today. Not a ranking conflict (different `[city]` keywords), but it dilutes uniqueness
  signals and is exactly what the new national explainer spokes (§5 Cluster C) are designed to
  absorb.
- Barranquilla currently has **no active restriction** — its page must not compete for
  "pico y placa bogota"-style transactional-schedule intent; keep it framed as an
  informational "no hay pico y placa en Barranquilla" answer (matches actual SERP framing
  found in §2), which is a naturally distinct intent from the other 5 city pages and creates
  no overlap risk.

## 8. Intent classification summary

| Query pattern | Intent | Notes |
|---|---|---|
| pico y placa [city] hoy / horario / calendario | Informational | core repeatable pSEO pattern, high frequency (daily check) |
| pico y placa colombia | Informational | country hub target |
| excepciones / multa / sanciones pico y placa | Informational | national, feeds new explainer spokes |
| zona de bajas emisiones madrid / etiqueta DGT | Informational | Madrid-specific, disjoint SERP from Colombia |
| pico y placa api / vehicle restriction api | Commercial | developer/business searcher, feeds `/precios` |
| integrar pico y placa en mi app | Transactional | closest to a signup/purchase-intent query, feeds `/register` via `/precios` |
| pyphoy / grupor5 / verifik / placapi | Navigational | excluded from clustering, logged only as competitor evidence |

## 9. Pre-delivery validation checklist

- [x] No two posts share the same primary keyword
- [x] Every spoke has ≥3 incoming internal links planned — **except Madrid (1 today)**, explicitly flagged with interim mitigation in §6
- [x] Every spoke links to its pillar (mandatory tier, §6)
- [x] Pillar links to every spoke (mandatory tier, §6)
- [x] No orphan pages in the final-state link matrix — Madrid is the one interim exception, tracked as `pending_second_city`
- [x] Template selection matches intent classification (informational → explainer/city_spoke templates, commercial/transactional → pricing-adjacent templates)
- [x] Word count targets within spec (pillar 2500-4000, spoke 1200-1800; national explainer spokes slightly shorter at 1000-1600 given narrower scope — flagged as an intentional deviation, not an error)
- [x] Total cluster size within constraints — 5 clusters (co-metro-major, co-metro-secondary, co-national-info, es-zbe-pending, commercial-api), 2-3 posts each
- [x] SERP overlap data supports groupings — §2 shows 3-4+ shared aggregator domains per Colombian city pair and 0 shared domains for Madrid-vs-Colombia and API-vs-informational, directly supporting the country-hub / no-restriction-type-hub / separate-commercial-cluster decisions

## Sources consulted (WebSearch, this session)

- [Pico y Placa en Bogotá Hoy — grupor5.com](https://www.grupor5.com/pico-y-placa/bogota)
- [Pico y Placa en Bogotá hoy — calendariodecolombia.com](https://www.calendariodecolombia.com/pico-y-placa/bogota)
- [Pico y placa particulares en Bogotá — pyphoy.com](https://www.pyphoy.com/bogota/particulares)
- [Así opera el pico y placa en Bogotá — bogota.gov.co](https://bogota.gov.co/mi-ciudad/movilidad/pico-y-placa-bogota-vehiculos-particulares-1-30-junio-de-2026)
- [Pico y Placa Medellín hoy — medellin.gov.co](https://www.medellin.gov.co/es/secretaria-de-movilidad/pico-y-placa-medellin-hoy/)
- [Pico y placa en Medellín hoy — infobae.com](https://www.infobae.com/colombia/2026/07/23/tenga-en-cuenta-este-es-el-pico-y-placa-en-medellin-para-hoy-23-de-julio-de-2026/)
- [Desde hoy rige el nuevo esquema de pico y placa en Cali — elpais.com.co](https://www.elpais.com.co/cali/pico-y-placa-en-cali-este-lunes-5-de-enero-del-2026-inicia-la-rotacion-habra-sanciones-0401.html)
- [Pico y placa en Colombia 2026: guía por ciudad — rentingcolombia.com](https://www.rentingcolombia.com/localiza-corporativo/blog/pico-y-placa-colombia)
- [Pico y Placa Colombia 2026 - Consulta Hoy — consultarpyp.com.co](https://consultarpyp.com.co/)
- [Pico y placa Colombia hoy 2026 — picoyplacahoycolombia.com](https://www.picoyplacahoycolombia.com/)
- [Pico y PLaca – Dirección de Tránsito de Bucaramanga](https://transitobucaramanga.gov.co/dtb/atencion-y-servicios-a-la-ciudadania/pico-y-placa)
- [Pico y placa hoy Cartagena — eluniversal.com.co](https://www.eluniversal.com.co/pico-y-placa/)
- [Conozca el nuevo pico y placa — cartagena.gov.co](https://www.cartagena.gov.co/noticias/conozca-el-nuevo-pico-placa-para-particulares-sus-rotaciones-durante-el-2026)
- [Así es el pico y placa en Barranquilla para Taxis 2026 — grupor5.com](https://www.grupor5.com/pico-y-placa/barranquilla)
- [Inició pico y placa para particulares en la vía 40 — barranquilla.gov.co](https://barranquilla.gov.co/mi-barranquilla/inicio-pico-y-placa-para-particulares-en-la-via-40)
- [ZBE Madrid | Mapa y novedades — race.es](https://www.race.es/zonas-de-bajas-emisiones/mapa-zbe-madrid)
- [Madrid Zona de Bajas Emisiones (ZBE) — madrid.es](https://www.madrid.es/portales/munimadrid/es/Inicio/Movilidad-y-transportes/Zonas-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones-ZBE-/?vgnextfmt=default&vgnextoid=93e63877029eb710VgnVCM1000001d4a900aRCRD&vgnextchannel=d2d2edf0f70ab710VgnVCM2000001f4a900aRCRD)
- [Madrid Central 2026: ZBEDEP Distrito Centro — parking-madrid.es](https://www.parking-madrid.es/madrid-central.html)
- [Zonas de bajas emisiones en España — race.es](https://www.race.es/zonas-de-bajas-emisiones)
- [Zonas de Bajas Emisiones en España 2026: el mapa definitivo — newgearcars.es](https://newgearcars.es/zonas-de-bajas-emisiones-espana-2026-mapa-ciudades/)
- [Verificar Pico y Placa para Bogotá — docs.verifik.co](https://docs.verifik.co/verifik-es/validacion-de-vehiculo/colombia/verificar-pico-y-placa-para-bogota)
- [CONSULTA EXCEPCIONES PICO Y PLACA EN BOGOTÁ — movilidadbogota.gov.co](https://www.movilidadbogota.gov.co/web/SIMUR/excepciones/consultarPlaca/)
- [PlacApi — API de consulta vehicular de Colombia](https://placapi.com/consultar-runt-por-placa)
- [Analysing a license plate-based vehicle restriction policy — Cali, Colombia (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S0965856423000381)
- [From restricting the use of cars by license plate numbers to congestion charging — Medellín (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0967070X16307521)
- [Cómo inscribir híbridos o eléctricos a la excepción de Pico y Placa — bogota.gov.co](https://bogota.gov.co/mi-ciudad/movilidad/como-inscribir-hibridos-o-electricos-la-excepcion-de-pico-y-placa)
- [ABC de la inscripción de los vehículos híbridos eléctricos — medellin.gov.co](https://www.medellin.gov.co/es/sala-de-prensa/noticias/abc-de-la-inscripcion-de-los-vehiculos-hibridos-electricos-para-tener-exencion-de-pico-y-placa-en-medellin/)
- [¿Cuánto vale la multa por circular en pico y placa? — noticiasrcn.com](https://www.noticiasrcn.com/colombia/cuanto-vale-la-multa-por-circular-en-pico-y-placa-336681)
- [Cuál es la multa por incumplir el pico y placa en Bogotá — bogota.gov.co](https://bogota.gov.co/mi-ciudad/movilidad/cual-es-la-multa-por-incumplir-el-pico-y-placa-en-bogota-durante-2025)
- [Pico y Placa Regional Bogotá 2026 — horapico.co](https://www.horapico.co/pico-y-placa-regional-bogota)
