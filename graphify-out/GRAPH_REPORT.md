# Graph Report - .  (2026-07-27)

## Corpus Check
- 277 files · ~453,504 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1222 nodes · 2071 edges · 126 communities (76 shown, 50 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 87 edges (avg confidence: 0.81)
- Token cost: 244,412 input · 0 output

## Community Hubs (Navigation)
- API Keys Dashboard Page
- Docs Site Dependencies
- Auth & Dashboard Pages (web)
- Plate Digit Lookup Widget
- Admin App Onboarding & Infra
- Auth Controller (Login/Register)
- Restriction Model Cards (Zone/Congestion)
- Admin Dropdown Menu UI
- Admin City Controller (API)
- Cities Listing Page (web)
- Admin TypeScript Config
- Docs TypeScript Config
- Web TypeScript Config
- Core API Controllers
- SEO Audit Screenshots & Page Concepts
- Admin shadcn Component Config
- Web shadcn Component Config
- Admin Cities/Users Pages
- Scraping Job Base Class
- Docs Layout & Routing
- Admin Dev Dependencies
- Web Dev Dependencies
- Token Service (Auth)
- City OG Image Generation
- Admin Runtime Dependencies
- Admin Auth Controllers
- Site Icons & IndexNow Assets
- Web Runtime Dependencies
- Admin Rule Revision Page
- PHP Composer Autoload Config
- City Detail & Pricing Pages
- Admin User Detail Page
- Admin Button/Dialog UI
- Auth Pages & Dashboard Layout
- Admin App Shell & Nav
- Token Refresh & CORS
- Database Connection Core
- HTTP Response Core
- HTTP Router Core
- City Error/Not-Found Pages
- Rule Evaluators (Congestion/Emission)
- Request Validation Core
- City Repository (DB)
- Country Hub Feature & SEO Rationale
- Locale Root Layout (web)
- Admin Package Metadata
- Web Package Metadata
- Pico y Placa Rules Controller
- Client IP Utility
- Admin Root Layout
- API Key Controller
- Rule Proposal Repository
- Billing Manager Service
- MCP/DataForSEO Config
- API Key Repository
- Marketing Layout (Navbar/Footer)
- Rule Repository (DB)
- Rule Source Repository
- Core DB Migration (users/api_keys)
- Billing DB Migration
- Rules DB Migration
- Docs Root Layout
- Stripe Payment Service
- Wompi Payment Service
- DataForSEO Search Provider
- Rule Extraction Service (Scraping)
- Web Next.js Config (CSP)
- Docs Next.js Config
- Apple Touch Icon Route
- Auth Route Group Layout
- Admin AGENTS/CLAUDE Config
- Admin ESLint Config
- Admin Next Config
- class-variance-authority Dep
- clsx Dep (admin)
- js-cookie Dep
- sonner Dep (admin)
- tailwind-merge Dep (admin)
- tw-animate-css Dep (admin)
- zustand Dep (admin)
- Admin PostCSS Config
- Cities Metadata Migration
- Legal Info Migration
- Navbar & Mobile Menu Bug
- CardTitle Heading Bug
- Docs AGENTS/CLAUDE Config
- Docs ESLint Config
- Docs PostCSS Config
- Web AGENTS/CLAUDE Config
- Web ESLint Config
- clsx Dep (web)
- lucide-react Dep
- next-themes Dep
- react Dep
- react-dom Dep
- sonner Dep (web)
- tailwind-merge Dep (web)
- zustand Dep (web)
- Web PostCSS Config
- Locale Middleware & Logo Bug
- HTTP Status Codes Doc

## God Nodes (most connected - your core abstractions)
1. `cn()` - 78 edges
2. `cn()` - 64 edges
3. `Request` - 59 edges
4. `Database` - 30 edges
5. `Cache` - 27 edges
6. `BaseController` - 22 edges
7. `TokenService` - 20 edges
8. `Card()` - 18 edges
9. `CardHeader()` - 17 edges
10. `CardTitle()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Model-agnostic title copy wrong for Madrid ZBE` --references--> `buildCitySeo()`  [EXTRACTED]
  web/seo-audit/findings/sxo.md → web/lib/city-seo.ts
- `API fetch hangs page render indefinitely` --references--> `getCityRule()`  [EXTRACTED]
  web/seo-audit/findings/performance.md → web/lib/pico-placa.ts
- `Manual Admin-Driven Plan Changes (Payment Checkout In Development)` --references--> `Admin App Getting Started Guide`  [INFERRED]
  docs/content/docs/endpoints/plans.mdx → admin/README.md
- `docker-compose api service (PHP)` --shares_data_with--> `API Introduction & Quickstart`  [INFERRED]
  docker-compose.yml → docs/content/docs/index.mdx
- `cali/cartagena 500, medellin timeout confirmed live` --semantically_similar_to--> `Unguarded fetch() calls crash sitemap/city pages`  [INFERRED] [semantically similar]
  web/seo-audit/findings/content.md → web/seo-audit/findings/technical.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Auth Session Lifecycle (register/login/refresh/logout)** — docs_content_docs_endpoints_auth_register, docs_content_docs_endpoints_auth_login, docs_content_docs_endpoints_auth_refresh, docs_content_docs_endpoints_auth_logout [INFERRED 0.85]
- **API Key Lifecycle (list/create/reveal-once/revoke)** — docs_content_docs_endpoints_api_keys_get_api_keys, docs_content_docs_endpoints_api_keys_post_api_keys, docs_content_docs_endpoints_api_keys_delete_api_keys, docs_content_docs_endpoints_api_keys_raw_key [INFERRED 0.85]
- **Restriction Model Polymorphism in /check** — docs_content_docs_endpoints_check_get_check, docs_content_docs_restriction_models_plate_digit_day, docs_content_docs_restriction_models_emission_label_zone, docs_content_docs_restriction_models_congestion_charge [INFERRED 0.85]
- **Technical/performance/content audits independently found the same fetch-resilience bug** — web_seo_audit_findings_technical_unguarded_fetch_bug, web_seo_audit_findings_performance_fetch_hang_bug, web_seo_audit_findings_content_cali_cartagena_500_bug [EXTRACTED 0.90]
- **SXO and cluster audits independently converged on the model-aware title fix** — web_seo_audit_findings_sxo_wrong_title_bug, web_seo_audit_findings_cluster_madrid_disjoint_serp, web_lib_city_seo_buildcityseo [EXTRACTED 0.90]
- **Shared Mobile Navbar Pattern (Hamburger Menu + Crear Cuenta CTA) Across Marketing Pages** — web_seo_audit_screenshots_city_bogota_mobile_view, web_seo_audit_screenshots_ciudades_mobile_view, web_seo_audit_screenshots_home_mobile_view, web_seo_audit_screenshots_precios_mobile_view [INFERRED 0.85]
- **Shared Floating Pill Navbar and Footer Pattern Across Desktop Full-Page Screenshots** — web_seo_audit_screenshots_city_bogota_desktop_full_view, web_seo_audit_screenshots_ciudades_desktop_full_view, web_seo_audit_screenshots_home_desktop_full_view, web_seo_audit_screenshots_precios_desktop_full_view [INFERRED 0.85]
- **Reused City Card Component Across Cities Listing Page and Homepage** — web_seo_audit_screenshots_ciudades_desktop_full_view, web_seo_audit_screenshots_ciudades_mobile_full_view, web_seo_audit_screenshots_home_desktop_full_view [INFERRED 0.80]

## Communities (126 total, 50 thin omitted)

### Community 0 - "API Keys Dashboard Page"
Cohesion: 0.06
Nodes (42): ApiKey, CardAction(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+34 more)

### Community 1 - "Docs Site Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, fumadocs-core, fumadocs-mdx, fumadocs-ui, next, react, react-dom, @types/mdx (+34 more)

### Community 2 - "Auth & Dashboard Pages (web)"
Cohesion: 0.13
Nodes (19): Me, Plan, CountryHubPage(), generateMetadata(), getCountryCities(), CityContactSection(), Card(), CardContent() (+11 more)

### Community 3 - "Plate Digit Lookup Widget"
Cohesion: 0.10
Nodes (31): DIGITS, PlateDigitLookup(), CATEGORY_ICON, CategoryCard(), categoryChipClass(), PlateZoneSchedule(), WeekStrip(), BannerStatus (+23 more)

### Community 4 - "Admin App Onboarding & Infra"
Cohesion: 0.08
Nodes (38): Admin App Getting Started Guide, Next.js Framework, docker-compose api service (PHP), docker-compose mariadb service, docker-compose redis service, API Key Authentication, JWT Session Authentication, Refresh Token Rotation & Reuse Detection (+30 more)

### Community 5 - "Auth Controller (Login/Register)"
Cohesion: 0.07
Nodes (5): LoginController, ApiKeyMiddleware, RateLimitMiddleware, Cache, Predis\Client

### Community 6 - "Restriction Model Cards (Zone/Congestion)"
Cohesion: 0.12
Nodes (26): CongestionChargeCard(), EmissionZoneCard(), PlateCategoryNotice(), RestrictionSchedule(), buildCitySeo(), CitySeo, congestionChargeStrategy, emissionLabelZoneStrategy (+18 more)

### Community 7 - "Admin Dropdown Menu UI"
Cohesion: 0.11
Nodes (19): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+11 more)

### Community 8 - "Admin City Controller (API)"
Cohesion: 0.09
Nodes (5): CityController, RuleReviewController, UserController, SubscriptionController, Request

### Community 9 - "Cities Listing Page (web)"
Cohesion: 0.13
Nodes (21): CitiesPage(), generateStaticParams(), generateMetadata(), generateStaticParams(), HomePage(), buildStaticEntries(), sitemap(), STATIC_CONTENT_UPDATED (+13 more)

### Community 10 - "Admin TypeScript Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 11 - "Docs TypeScript Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 12 - "Web TypeScript Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 13 - "Core API Controllers"
Cohesion: 0.11
Nodes (4): HtmlTextExtractor, PageFetcher, applyDir(), PDO

### Community 14 - "SEO Audit Screenshots & Page Concepts"
Cohesion: 0.13
Nodes (24): Cities Listing Page (Concept), City Detail Page (Concept), Homepage (Concept), Pricing Page (Concept), Bogota City Detail Page - Desktop Full Page, Bogota City Detail Page - Desktop Viewport (Plate Digit Selector, Unselected/Default State), Bogota City Detail Page - Desktop Viewport (Plate ABC001, Digit 1 Selected, Lunes Result), Bogota City Detail Page - Mobile Full Page (+16 more)

### Community 15 - "Admin shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Web shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 17 - "Admin Cities/Users Pages"
Cohesion: 0.19
Nodes (15): City, CiudadesPage(), RESTRICTION_MODELS, PLAN_STYLE, UserRow, Badge(), badgeVariants, Input() (+7 more)

### Community 18 - "Scraping Job Base Class"
Cohesion: 0.14
Nodes (3): BaseJob, PicoPlacaScrapeJob, Logger

### Community 19 - "Docs Layout & Routing"
Cohesion: 0.12
Nodes (9): Page(), baseOptions, source, getMDXComponents(), browserCollections, create, docs, create (+1 more)

### Community 20 - "Admin Dev Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/js-cookie, @types/node, @types/react (+11 more)

### Community 21 - "Web Dev Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/js-cookie, @types/node, @types/react (+11 more)

### Community 22 - "Token Service (Auth)"
Cohesion: 0.15
Nodes (3): PDO, TokenService, PDO

### Community 23 - "City OG Image Generation"
Cohesion: 0.15
Nodes (12): contentType, Image(), modelLabel, size, subtitleCopy, contentType, copy, Image() (+4 more)

### Community 24 - "Admin Runtime Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, axios, @base-ui/react, lucide-react, next, next-themes, react, react-dom (+9 more)

### Community 25 - "Admin Auth Controllers"
Cohesion: 0.26
Nodes (3): RegisterController, BaseController, AuthMiddleware

### Community 26 - "Site Icons & IndexNow Assets"
Cohesion: 0.15
Nodes (17): Monorepo Apps (admin, docs, web), Next.js ImageResponse Generation (used for logo), IndexNow API Key File, IndexNow Protocol, Default Next.js File Icon (file.svg), Default Next.js Globe Icon (globe.svg), AI Citation / Attribution Policy Notes, llms.txt AI-Crawler Discovery File (+9 more)

### Community 27 - "Web Runtime Dependencies"
Cohesion: 0.12
Nodes (17): next-intl, dependencies, axios, @base-ui/react, class-variance-authority, js-cookie, next, next-intl (+9 more)

### Community 28 - "Admin Rule Revision Page"
Cohesion: 0.23
Nodes (11): Proposal, AdminLoginPage(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+3 more)

### Community 29 - "PHP Composer Autoload Config"
Cohesion: 0.12
Nodes (15): autoload, psr-4, config, optimize-autoloader, sort-packages, description, name, PicoPlaca\\App\\ (+7 more)

### Community 30 - "City Detail & Pricing Pages"
Cohesion: 0.23
Nodes (12): CityDetailPage(), formatDate(), getPlans(), Plan, PricingPage(), CityLegalSection(), Accordion(), AccordionItem() (+4 more)

### Community 31 - "Admin User Detail Page"
Cohesion: 0.19
Nodes (11): SubLog, UserDetail, SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton() (+3 more)

### Community 32 - "Admin Button/Dialog UI"
Cohesion: 0.16
Nodes (8): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 33 - "Auth Pages & Dashboard Layout"
Cohesion: 0.18
Nodes (8): LoginPage(), RegisterPage(), metadata, DashboardShell(), NAV_ITEMS, AuthStore, AuthUser, useAuthStore

### Community 34 - "Admin App Shell & Nav"
Cohesion: 0.19
Nodes (6): AdminShell(), NAV_ITEMS, api, failedQueue, AdminUser, AuthStore

### Community 35 - "Token Refresh & CORS"
Cohesion: 0.17
Nodes (3): RefreshController, CorsMiddleware, SecurityHeadersMiddleware

### Community 36 - "Database Connection Core"
Cohesion: 0.22
Nodes (3): Database, PDO, JobQueue

### Community 39 - "City Error/Not-Found Pages"
Cohesion: 0.24
Nodes (6): CATEGORY_KEYS, normalize(), PicoPlacaFinder(), Button(), buttonVariants, CategoryKey

### Community 40 - "Rule Evaluators (Congestion/Emission)"
Cohesion: 0.20
Nodes (4): CongestionChargeEvaluator, EmissionLabelEvaluator, PlateDigitDayEvaluator, RuleEvaluatorInterface

### Community 43 - "Country Hub Feature & SEO Rationale"
Cohesion: 0.20
Nodes (10): Country hub route /ciudades/pais/[country], CityRegionSection component, SEO Action Plan, Colombia country hub recommendation (competitor-proven pattern), Madrid vs Colombia queries: 0 shared SERP domains, CityRegionSection siblings always empty (region unique per city), llms.txt missing (404), Model-agnostic title copy wrong for Madrid ZBE (+2 more)

### Community 44 - "Locale Root Layout (web)"
Cohesion: 0.22
Nodes (5): fontSans, geistMono, ogLocale, viewport, Toaster()

### Community 45 - "Admin Package Metadata"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 46 - "Web Package Metadata"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 47 - "Pico y Placa Rules Controller"
Cohesion: 0.25
Nodes (3): RulesController, RuleEvaluatorInterface, RuleEvaluatorFactory

### Community 49 - "Admin Root Layout"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, Toaster()

### Community 53 - "MCP/DataForSEO Config"
Cohesion: 0.29
Nodes (6): DATAFORSEO_PASSWORD, DATAFORSEO_USERNAME, ENABLED_MODULES, FIELD_CONFIG_PATH, npx, dataforseo

### Community 58 - "Core DB Migration (users/api_keys)"
Cohesion: 0.60
Nodes (4): api_keys, jobs, refresh_tokens, users

### Community 59 - "Billing DB Migration"
Cohesion: 0.40
Nodes (4): payment_provider_configs, payments, plans, subscription_logs

### Community 60 - "Rules DB Migration"
Cohesion: 0.70
Nodes (4): cities, rule_change_proposals, rule_sources, rules

### Community 61 - "Docs Root Layout"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 66 - "Web Next.js Config (CSP)"
Cohesion: 0.50
Nodes (3): csp, nextConfig, withNextIntl

## Ambiguous Edges - Review These
- `Homepage - Mobile Viewport After Hamburger Menu Click` → `Homepage - Mobile Viewport (Hero Section)`  [AMBIGUOUS]
  web/seo-audit/screenshots/home-mobile-hamburger-clicked.png · relation: semantically_similar_to
- `Homepage - Mobile Viewport (Hero Section)` → `Hamburger Menu Click Shows No Visibly Different Open State In Captured Viewport`  [AMBIGUOUS]
  web/seo-audit/screenshots/home-mobile-hamburger-clicked.png · relation: conceptually_related_to
- `Pico y Placa Brand Logo (Lightning Bolt, Black/Lime)` → `Default Next.js Wordmark Logo (next.svg)`  [AMBIGUOUS]
  web/public/logo.png · relation: conceptually_related_to

## Knowledge Gaps
- **323 isolated node(s):** `npx`, `DATAFORSEO_USERNAME`, `DATAFORSEO_PASSWORD`, `ENABLED_MODULES`, `FIELD_CONFIG_PATH` (+318 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Homepage - Mobile Viewport After Hamburger Menu Click` and `Homepage - Mobile Viewport (Hero Section)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Homepage - Mobile Viewport (Hero Section)` and `Hamburger Menu Click Shows No Visibly Different Open State In Captured Viewport`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Pico y Placa Brand Logo (Lightning Bolt, Black/Lime)` and `Default Next.js Wordmark Logo (next.svg)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Request` connect `Admin City Controller (API)` to `Token Refresh & CORS`, `Auth Controller (Login/Register)`, `HTTP Router Core`, `Core API Controllers`, `Pico y Placa Rules Controller`, `Client IP Utility`, `API Key Controller`, `Admin Auth Controllers`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Database` connect `Database Connection Core` to `Token Refresh & CORS`, `Auth Controller (Login/Register)`, `Admin City Controller (API)`, `City Repository (DB)`, `Core API Controllers`, `Scraping Job Base Class`, `Rule Proposal Repository`, `Billing Manager Service`, `API Key Repository`, `Token Service (Auth)`, `Rule Repository (DB)`, `Rule Source Repository`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `cn()` connect `API Keys Dashboard Page` to `Auth & Dashboard Pages (web)`, `Plate Digit Lookup Widget`, `City Error/Not-Found Pages`, `Cities Listing Page (web)`, `City Detail & Pricing Pages`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `Database` (e.g. with `.addSource()` and `.index()`) actually correct?**
  _`Database` has 23 INFERRED edges - model-reasoned connections that need verification._