# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

Skeleton stage. Comparison, trip planning and receipt entry work end to end against a local catalog
store; every other feature is a route stub. There is no Supabase project, no hosting, and no paid service anywhere in the
loop -- keep it that way unless the user says otherwise.

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

## Current task: skeleton

Build structure, routes, data model, and stubbed data flow. **Design/visual polish is explicitly
deferred** — use unstyled or minimally styled Tailwind and do not spend effort on look-and-feel.
Prefer wiring a feature end-to-end with a placeholder UI over a polished UI with no data path.

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
src/lib/compare.ts     scanned package -> ranked options across brands, sizes, stores
src/lib/geo.ts         straight-line distance, round-trip routing, driving cost
src/lib/trip.ts        shopping list -> which stores to visit and what to buy at each
src/lib/store.ts       the live catalog: seed + entered receipts, persisted, observable
src/lib/useCatalog.ts  React binding for the above
src/lib/supabase.ts    the single Supabase client (unused so far -- nothing is hosted)
src/data/seed.ts       fabricated catalog and prices, shaped like the real tables
src/routes/Scan.tsx    the comparison screen
src/routes/ShoppingList.tsx  the trip planner
src/routes/Receipts.tsx      receipt entry; the rest of src/routes/ is stubs
supabase/migrations/   schema, applied in filename order -- never applied anywhere yet
```

## Working without a backend

Screens must read the catalog through `useCatalog()`, never by constructing their own repository.
`catalogStore` is the single source of truth, and it swaps the repository object on every mutation so
`useSyncExternalStore` sees the change; a screen holding its own repository silently goes stale the
moment a receipt is saved. Whatever a `useMemo` derives from the repository has to list it as a
dependency for the same reason.

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
