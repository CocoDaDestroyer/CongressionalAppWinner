# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

Demo-ready. Every screen in the nav works end to end against the local catalog store: Home, Compare
(with the unknown-barcode "add a product" flow), Trip, Receipts, Spending and Profile (store cards,
theme, reset demo data). Community and the other stubs were cut. There is no Supabase project, no
hosting, and no paid service anywhere in the loop -- keep it that way unless the user says otherwise.
Camera barcode scanning works (`@zxing/browser`, lazy-loaded, hidden where the browser has no
camera; typing stays as the fallback). Not started: receipt OCR, a static deploy.

## Purpose: a presentation app, not a production app

This is a Congressional App Challenge / hackathon-style entry. It wins or loses on what judges see in a
1-3 minute demo video and a quick click-through: how polished and coherent it looks, and how cleanly
each feature works on screen. It is **not** meant to handle real traffic, real users, or real attackers.

What that means in practice:

- **Optimize for aesthetics and demo clarity.** Visual polish, consistent design, smooth interactions,
  believable data, and features that work flawlessly on the happy path come first.
- **Do not spend effort on scale or hardening.** No load handling, rate limiting, caching layers, auth
  hardening, RLS audits, or abuse prevention unless the user asks. Local in-memory/`localStorage` data is
  fine; a feature that looks real and behaves correctly in the demo is done.
- **"Clean implementation" still matters** -- judges score code quality too. Keep the existing seams
  (`CatalogRepository`, `useCatalog()`, per-unit normalization, provenance rules) intact, keep tests
  green, and prefer a small, readable component over a clever one. Fake the *data source* where needed,
  never the *logic*: a ranking shown on screen must be the real ranking.
- **Finished beats broad.** A feature shown in the demo must look finished: loading, empty and error
  states designed, no "stub" text, no layout jank. A half-built screen is worse than a missing nav item.

## Project: CartWise

A grocery price-comparison app. Users compare prices for a given product across nearby stores and
across cheaper/more expensive brands, and get a recommendation that balances cost against quality
(quality drawn from product reviews / sentiment analysis).

Two cross-cutting rules shape most of the data model and most of the math:

- **Prices are always normalized per unit** (per oz / per 100 g / per count) before anything is
  compared or ranked. Raw shelf price is display-only; a bigger package at a higher sticker price
  frequently wins. Any comparison that skips normalization is a bug. Enforced by `src/lib/units.ts`:
  `normalize()` before comparing, `cheapestFirst()` to rank. It throws rather than compare $/g
  against $/ml.
- **Prices are store-local and perishable.** Every price is a (product, store, timestamp, source)
  tuple, never a field on the product -- the `price_observations` table, which is append-only.
  Sources differ in trust: scraped > loyalty-account sync > receipt OCR > user submission.
  Staleness and source must be visible to ranking and to the UI. Read current prices through the
  `current_prices` view rather than querying observations directly.

## Stack

- **React** (frontend)
- **Supabase** — Postgres, auth, storage, realtime. This is the entire backend; prefer Postgres
  (RLS, views, RPC/Edge Functions) over introducing a separate server.
- **Tailwind** for styling
- **Google Maps API** for geocoding, store proximity, and trip routing

## Current task: polish for presentation

The skeleton phase is over (comparison, trip planning and receipts work end to end). Design is no longer
deferred -- it is now the priority. Build a consistent design system (tokens in `src/index.css` via
Tailwind v4 `@theme`, shared components under `src/components/`), apply it to every screen, and turn the
remaining stub routes into convincing, working features backed by the local catalog store. Mobile-first:
the app should look like a phone app in the demo, and also look intentional on a laptop.

`docs/polish-plan.md` is the product plan. It sets the demo story, which features to polish, fold in
or cut (Community is cut; Contribute becomes the unknown-barcode flow; Memberships moves into
Profile), and the timeline to the Oct 26, 2026 deadline. Stay inside that scope.

Design tooling: the Impeccable skill is vendored at `.claude/skills/impeccable` (Apache-2.0, from
pbakaus/impeccable). Use `/impeccable` for design work (`init`, `shape`, `craft`, `critique`, `audit`,
`polish`), and run `.claude/skills/impeccable/scripts/impeccable detect src` before committing UI
changes. Its engine binary downloads to `~/.impeccable/` on first run.

## Feature domains

Each is a separate slice; they share the product/price/store tables.

1. **Barcode scan → compare.** Scan a barcode, resolve to a product, show that product's price
   across nearby stores plus sibling brands (same category, different brand/size), ranked by
   per-unit cost and review sentiment.
2. **Store membership / loyalty linking.** Connect a store account to pull member-specific pricing.
   Member price and public price are distinct prices for the same (product, store).
3. **Community product database.** When a product or price can't be sourced from a retailer, users
   submit it. User-submitted records need provenance, and need to coexist with scraped records for
   the same product without either silently overwriting the other.
4. **Shopping-list optimization.** Given a list, decide *where* and *what* to buy. The objective
   includes travel: driving time, distance, and gas cost across the chosen store set, so a cheaper
   item at a distant store can lose. Bias toward a single trip among stores in close proximity.
   This is the most algorithmically involved feature — item-to-store assignment plus routing.
5. **Community threads/chat.** Nextdoor-style local discussion for budgeting tips and store
   recommendations. Locality-scoped; a natural fit for Supabase realtime.
6. **Receipt photo → price updates.** OCR a receipt to harvest fresh (product, store, price,
   timestamp) records. This is the main mechanism keeping prices current, so it feeds the same
   price table as scraping, tagged with its lower trust level.
7. **Spend tracking.** Monthly/annual grocery and food spend, derived from receipts and purchases.

## Architectural notes

- Features 1, 2, 3, 6 are all *price ingestion* paths into one table with different trust and
  freshness. Features 1, 4, 7 are all *consumers* of it. Get that table's shape right before
  building any single feature deeply.
- Product identity is the hard part: barcodes (UPC/EAN) identify a specific package, not a product
  concept. Brand comparison ("this tomato vs. that tomato") requires a product-concept layer above
  barcodes so siblings can be enumerated.
- Location, proximity, and routing appear in features 1, 4, and 5. Keep store geo and distance
  logic in one place rather than per-feature.
- Keep authorization in Supabase RLS rather than in React. User-submitted prices, community posts,
  and personal spend data all have distinct visibility rules.

## Commands

```
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm test           # vitest (watch);  npx vitest run  for one pass
npm run lint       # oxlint
npm run typecheck  # tsc -b --noEmit
```

Run a single test file or case:

```
npx vitest run src/lib/units.test.ts
npx vitest run -t 'refuses to compare mass against volume'
```

Tests default to the `node` environment (see `vite.config.ts`) because booting jsdom costs ~30s and
almost nothing under test needs a DOM. Component tests must opt in per-file with a
`// @vitest-environment jsdom` comment at the top.

Copy `.env.example` to `.env.local` before running; `src/lib/supabase.ts` throws at import if the
Supabase vars are missing.

## Layout

```
src/lib/units.ts       per-unit normalization and ranking
src/lib/catalog.ts     types mirroring the schema, by hand until `supabase gen types`
src/lib/repository.ts  the data boundary + the in-memory implementation
src/lib/compare.ts     scanned package -> ranked options; best value, its reason, shelf-tag display
src/lib/geo.ts         straight-line distance, round-trip routing, driving cost
src/lib/trip.ts        shopping list -> which stores to visit and what to buy at each
src/lib/store.ts       the live catalog: seed + receipts + linked cards + community reports
src/lib/useCatalog.ts  React bindings: useCatalog, useReceipts, useLinkedRetailers
src/lib/spending.ts    receipts by month, year and store (pure)
src/lib/savings.ts     saved vs. the typical per-unit price (pure)
src/lib/gtin.ts        typed/scanned barcode -> GTIN-14
src/lib/camera.ts      whether the browser can offer a camera
src/lib/labels.ts      shared display names ("Ralphs Westwood")
src/lib/theme.ts       light/dark/system, applied as <html data-theme>
src/lib/supabase.ts    the single Supabase client (unused -- nothing is hosted)
src/data/seed.ts       sample catalog, prices and six months of generated receipt history
src/index.css          design tokens (Tailwind v4 @theme), light and dark
src/components/        AppShell, Logo, Sticker (the per-unit oval), ui/ primitives, one folder per screen
src/routes/            one file per screen; Spending is lazy-loaded (recharts)
supabase/migrations/   schema, applied in filename order -- never applied anywhere yet
PRODUCT.md, DESIGN.md  product truth and the design system, for the Impeccable skill
docs/                  polish plan, demo script, screenshots
```

Design rules that are easy to break: colors only through tokens (no hex in components), tangerine
(`savings`) only for money saved, panels never nest, and the filled leaf sticker marks the one
recommended option on a screen.

## Working without a backend

Screens must read the catalog through `useCatalog()`, never by constructing their own repository.
`catalogStore` is the single source of truth, and it swaps the repository object on every mutation so
`useSyncExternalStore` sees the change; a screen holding its own repository silently goes stale the
moment a receipt is saved. Whatever a `useMemo` derives from the repository has to list it as a
dependency for the same reason.

Linked store cards are not baked into the repository: screens pass `useLinkedRetailers()` to
`compareByPackage` / `optimizeTrip` as `memberRetailerIds`. Without a linked card a member price is
listed but locked (`memberLocked`) and never recommended.

Seeded receipt history is dated older than every seeded price for the same package and store, so it
feeds Spending without overriding anything Compare or Trip show. A test enforces that.

Receipts are stored; price observations are derived from them on every rebuild, never stored
alongside. That direction is what lets a corrected or deleted receipt correct the prices it produced.

`CatalogRepository` in `src/lib/repository.ts` is the seam. UI and comparison logic are written
against that interface only, never against seed arrays or a Supabase client, so the day a project
exists the swap is one implementation and nothing above it changes. `toCurrentPrices()` reimplements
the `current_prices` view in TypeScript; if you change one, change the other.

Seed data is not decoration -- it is chosen to exercise the awkward cases (a big package that wins
per unit while losing on sticker price, a store brand that is cheapest and worst reviewed, member
pricing beating public pricing at one store, a stale user report next to a fresh scrape). Preserve
those properties when editing it, because the tests assert on them.

Quality scores in the seed are placeholder inputs; nothing computes sentiment yet. The
cost-versus-quality ranking in `bestByValue()` rescales price and quality across the candidate
set, so its score is only meaningful within a single comparison and must not be shown as a
product rating.

## Trip planning

`optimizeTrip()` enumerates store subsets, picks each item's best option within a subset, routes the
result, and minimises groceries plus fuel. Two rules there are load-bearing and were both bugs
before they were rules:

- A plan that cannot buy an item is ranked *behind* one that can, regardless of price. Compare on
  cost alone and the planner prefers store sets that silently skip half the list, because whatever
  it fails to buy is free.
- `bestByValue()` settles score ties on price. Without that, the same package at a member and a
  public price scores identically whenever quality dominates, and the winner is whichever row came
  back first.

## Price provenance

`price_observations.source` describes the *evidence*, not how it was transcribed -- which is why the
enum member is `receipt` rather than `receipt_ocr`. A hand-typed receipt and a photographed one are
the same kind of claim about what a shelf price was.

Freshest observation wins, and an exact timestamp tie is settled by source trust
(scrape > loyalty_sync > receipt > user_report). Ties are routine because dates round, so a test that
means to exercise supersession has to use a strictly newer timestamp or it silently exercises the
tie-break instead.

Distances are straight-line, scaled by `DETOUR_FACTOR`, and therefore optimistic -- deliberately, so
the planner costs nothing to run. Replacing `drivingMiles`/`routeMiles` in `src/lib/geo.ts` with the
Maps Distance Matrix is the whole migration; callers do not change. Both the routing and the subset
enumeration are brute force and throw above a hard stop count rather than hanging.
