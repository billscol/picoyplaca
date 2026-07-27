# Visual / Mobile-Friendliness Audit — Pico y Placa Global

**Score: 70/100**

**Method:** Playwright (Chromium) automated capture at Desktop (1440x900, DPR 2) and Mobile (390x844, iPhone-class, DPR 2, touch-enabled) viewports. Pages tested: homepage (`/`), city detail (`/ciudades/bogota`, including a forced `?placa=ABC001&categoria=particulares` deep-link to surface a **restricted** state in the plate lookup widget since the live server clock fell on a Sunday — Bogota's pico y placa doesn't run weekends, so the natural "today" state renders "free" — see `city-bogota-desktop-today-natural.png` for the natural/unforced state vs. `city-bogota-desktop.png` / `city-bogota-mobile.png` for the forced restricted state), `/ciudades` listing, `/precios`. Bounding-box measurements, computed WCAG contrast ratios, DOM inspection of the hamburger-menu click, and horizontal-scroll checks were captured alongside screenshots. All screenshots are in `web/seo-audit/screenshots/`.

---

## What Works

1. **Above-the-fold on mobile is genuinely good.** On the 390x844 viewport (`home-mobile.png`), the H1 ("Restricciones vehiculares de LatAm, USA y Espana en una sola API"), subtitle, both CTAs ("Ver ciudades disponibles" / "Documentacion de la API"), and the full plate/city lookup form (`PicoPlacaFinder`) are all visible without scrolling. Measured boxes: H1 at y=198-358, finder form at y=638-796, both inside the 844px viewport.
2. **No horizontal scroll / overflow on any tested page at mobile width.** Verified programmatically (`document.documentElement.scrollWidth === clientWidth`) on `/`, `/ciudades`, `/ciudades/bogota`, `/precios` — all `false` for overflow. This is a core mobile-first indexing pass/fail signal and it passes.
3. **The fixed pill navbar does not overlap page content.** `header` bounding box is y=16-80 on mobile; the hero eyebrow badge starts well below that (~y=300+) with comfortable clearance in every screenshot (`home-mobile.png`, `ciudades-mobile.png`, `city-bogota-mobile.png`, `precios-mobile.png`).
4. **Color contrast is solid where it matters.** Computed WCAG ratios from actual rendered `getComputedStyle` values:
   - `muted-foreground` #606060 on white #ffffff ~ **6.3:1** (passes AA for normal text)
   - #606060 on secondary #f2f2f2 ~ **5.6:1** (passes AA)
   - #606060 on page background #f9f9f9 ~ **6.0:1** (passes AA)
   - `primary-foreground` black #000000 on lime `--primary` #cafc00 ~ **17.4:1** (passes AAA) — the lime CTA buttons ("Crear cuenta", "Ver ciudades disponibles", "Empezar") are all black-on-lime, not white-on-lime, so the accent color never creates a low-contrast pairing.
   - The concern flagged in the brief (lime accent / muted-foreground contrast) does **not** materialize as a real issue in this build.
5. **Entrance animations are CLS-safe.** The `animate-in fade-in slide-in-from-bottom-4` classes (hero, finder form, `CityFilterGrid` cards) animate `opacity`/`transform` only — elements keep their final layout position in normal flow from first paint and are only visually translated via a compositor-friendly transform, so they do not contribute to Cumulative Layout Shift the way animating `top`/`margin`/`height` would.
6. **Digit-picker tap targets in the plate lookup widget are well sized** (`plate-digit-lookup.tsx`) — roughly 65-70px square on mobile, comfortably above the 44-48px minimum.

---

## Findings

### 1. [High] Mobile hamburger menu is non-functional — primary nav is unreachable on mobile
`components/marketing/navbar.tsx` renders a `<Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu"><Menu /></Button>` with **no `onClick`, no state, and no menu panel markup anywhere in the component**. Confirmed by automated click test: DOM length before/after click was identical (173,689 chars both times), `[role="dialog"]` count stayed `0`, and `home-mobile-hamburger-clicked.png` is pixel-identical to `home-mobile.png` except for the button's own focus/hover background. On viewports below the `md` breakpoint, the desktop `<nav>` (Ciudades / Precios / Docs / Iniciar sesion) is `hidden`, so **there is currently no way for a mobile visitor to reach `/ciudades`, `/precios`, or the docs from the navbar at all** — the only paths are the homepage's own CTA buttons or scrolling all the way to the footer. This isn't strictly an SEO/crawlability problem (the links still exist in the DOM for crawlers), but it is a significant mobile usability/page-experience defect worth fixing before launch.
**Recommendation:** Wire the button to a real mobile menu (sheet/drawer or dropdown) exposing the same links as the desktop `<nav>`, or temporarily hide the icon until the panel ships so it doesn't look broken.

### 2. [Medium-High] "Mas popular" badge is visually clipped on the pricing page (both viewports)
On `/precios`, the badge positioned `absolute -top-3 left-1/2 -translate-x-1/2` above the Pro plan card is cut off by the card's top edge — only the bottom half of the "Mas popular" text renders, and it reads as an illegible sliver. Reproduced identically on desktop (`precios-desktop.png`) and mobile (`precios-mobile.png`), so it's a CSS/z-index or `overflow` clipping issue on the pricing `Card`, not a viewport-specific animation artifact.
**Recommendation:** Ensure the plan `Card` (and any parent) doesn't apply `overflow: hidden`/`clip` that intersects the badge's negative offset, or move the badge to a wrapper positioned outside the clipped ancestor.

### 3. [Low, likely dev-only but verify] Floating bottom-left widget overlaps page content on small viewports
A black circular button with an "N" mark (this looks like the Next.js Dev Tools indicator that ships with local `next dev`, not a product feature) sits fixed at the bottom-left and visually overlaps real content at mobile width:
- `ciudades-mobile.png`: covers part of the Bogota card's "Pico y placa (digito de placa)" badge text.
- `city-bogota-mobile.png`: sits directly on top of / adjacent to the restricted-day alert icon in the plate lookup result, creating two overlapping black circles.
- `precios-mobile.png`: covers the "B" of "Business" and part of the "$99.00" price.
**Recommendation:** If this is the Next.js dev indicator, confirm `devIndicators` is disabled or doesn't render in the production build (it shouldn't by default, but worth a production smoke-test since it visibly collides with real UI at this viewport). If it turns out to be an intentional support/chat widget, it needs repositioning (e.g., raise it or dock it away from card content) so it never overlaps live text.

### 4. [Medium] Several mobile tap targets fall below recommended minimum size
Measured via bounding boxes (CSS px, not scaled):
- Navbar hamburger button: **32x32px** (below Apple's 44x44 and Google's 48x48 guidance).
- `CityFilterGrid` filter chips ("Todas", "Pico y placa (digito de placa)", "Zona de bajas emisiones", "Peaje de congestion"): **34px tall** each.
These are all comfortably tappable in practice (isolated, well-spaced) but sit under the commonly cited 44-48px accessible-touch-target threshold, which matters most for users with larger fingers/motor impairment and is one of the signals in Google's mobile-usability guidance.
**Recommendation:** Bump vertical padding on `.rounded-full` chip/icon buttons (e.g., `py-1.5` -> `py-2.5`+) to land closer to 44px tall; not urgent, but a cheap accessibility win.

### 5. [Low/informational] Today-status banner and plate-lookup result can appear to disagree
On `/ciudades/bogota` with a deep-linked plate, the page shows two banners stacked: the city-level "Hoy NO hay restriccion" (today, Sunday, is free) directly above the plate-specific lookup result "Lunes ... #1 - 06:00-21:00" (this plate is restricted on Mondays). Both are individually correct, but a user skimming the page could momentarily read them as contradictory since one says "no restriction today" and the other immediately below shows a restriction. See `city-bogota-mobile.png` / `city-bogota-desktop.png`.
**Recommendation:** Consider a small label distinguishing "Today" vs. "Your plate's full week" sections, or visually separate them more (already have a card boundary, but a heading like "Consulta completa" could help).

### 6. [Low] Some UI copy renders at 12px
Filter-chip and badge labels (e.g., city model badges in `CityFilterGrid`, `ciudades-mobile.png`) compute to `font-size: 12px`. This is secondary/auxiliary text rather than body copy (which is 16-18px and reads fine), so it's not a hard mobile-usability failure, but it's below the commonly recommended 16px baseline and worth a look if legibility complaints come in from older users.

---

## Screenshot Index
- `home-desktop.png`, `home-desktop-full.png`, `home-mobile.png`, `home-mobile-full.png`, `home-mobile-hamburger-clicked.png`
- `ciudades-desktop.png`, `ciudades-desktop-full.png`, `ciudades-mobile.png`, `ciudades-mobile-full.png`
- `city-bogota-desktop.png`, `city-bogota-desktop-full.png`, `city-bogota-desktop-today-natural.png`, `city-bogota-mobile.png`, `city-bogota-mobile-full.png`
- `precios-desktop.png`, `precios-desktop-full.png`, `precios-mobile.png`, `precios-mobile-full.png`

## Limitations
- Live backend (`localhost:8000`) was not directly reachable from the audit shell (curl timed out), so city data was sourced through the already-rendered Next.js pages rather than the raw API; this did not block any of the checks above.
- Because the audit ran on a Sunday (server local time in Bogota's timezone), the *natural* "today" state for the plate-digit-day model city is "free" everywhere in Colombia; the restricted-state screenshots for `/ciudades/bogota` were obtained via the page's own `?placa=` deep-link feature (client-side, no backend mutation) rather than by waiting for a weekday.
- Tablet (768x1024) and laptop (1366x768) viewports were not captured — only the Desktop 1440x900 and Mobile 390x844 sizes requested for this pass.
