# CartWise: polish plan

## Where things stand (as of 2026-10-07)

- **Working end to end:** Scan/compare (`src/routes/Scan.tsx`), trip planner (`src/routes/ShoppingList.tsx`)
  and receipt entry (`src/routes/Receipts.tsx`), all reading the local `catalogStore` through `useCatalog()`.
  Receipts feed price observations, which change what Scan and List recommend right away.
- **Stubs:** Spending, Community, Contribute, Memberships (a heading and one sentence each, in
  `src/routes/index.tsx`).
- **Design:** none. Plain Tailwind, a text nav bar across the top, bordered `<select>`s and raw tables. No
  design tokens, no components folder, no icons, no fonts, no favicon beyond the Vite default.
- **Health:** 70 tests pass, typecheck and lint are clean. No backend, nothing hosted.
- **Tests rely on markup:** `getByRole('table')`, `getByRole('slider')`, button names like "Save receipt",
  labels like "Item 1" and "Purchased". A redesign will break these selectors, so update them on purpose
  and keep every behavioral assertion.

## What the judges score

The Congressional App Challenge scores three things: the **quality of the idea**, the **implementation**
(including user experience and design), and **coding skill**. Judges mostly see the app through a public
**1-3 minute YouTube video** that shows what the app does, what it was built with, and how it works. So
two things matter most: how the app looks in that video, and how cleanly each feature works on screen.

## How to make an AI-built app look good (research summary)

1. **Choose a visual direction before writing any code.** Asking an AI to "make it look nice" gets you the
   statistically average app. Pick one or two real reference apps and write their look down as tokens.
2. **Avoid the obvious AI look:** purple-to-blue gradients, glassmorphism on everything, emoji used as
   icons, a soft gray shadow on every card, and Inter with no type hierarchy.
3. **Put a design system in place before touching screens.** Tokens for color, type scale, spacing,
   radius and shadow, plus a small set of shared components. Every screen then uses only those.
4. **Use a solid component and icon base:** shadcn/ui (Radix underneath, you own the code, works with
   Tailwind v4 and Vite), `lucide-react` icons, `sonner` toasts, `tw-animate-css` or `motion` for
   restrained animation.
5. **Design every state:** loading, empty, error and success. Most vibe-coded apps fall apart here.
6. **Use realistic content:** real-sounding products, stores, prices, names and dates. No lorem ipsum, no
   "test", no `--` placeholders.
7. **Spend motion and color on the money moments.** Accent color and animation go on the 2-3 numbers
   that tell the story ("You save $4.12", "Best value"). Everything else stays calm.
8. **QA it like a reviewer:** check at 390px and 1280px, in light and dark mode, with keyboard focus
   rings and visible contrast, and with no console errors.
9. **Build the app around the demo script.** Decide the 90-second story first, then make every screen in
   that story flawless.

## Plan

### Phase 0: Direction (short)
- Brand: CartWise, "smart grocery savings." Fresh, trustworthy, a little playful. A green/teal primary,
  a warm accent saved for savings callouts, neutral slate surfaces. A characterful sans for headings
  (e.g. "Plus Jakarta Sans" or "Outfit") and a clean sans for body text.
- Reference apps to borrow from: Apple Wallet / Revolut (card hierarchy), Instacart (product rows),
  Copilot Money (spend charts).
- Write it down as `docs/design.md`: palette, type scale, radius, shadow, spacing, motion rules, do/don't.

### Phase 1: Foundation
- Tailwind v4 `@theme` tokens in `src/index.css`, with light and dark modes.
- Install shadcn/ui (Vite + Tailwind v4 path), `lucide-react`, `sonner`, and `recharts` (for Spending).
- `src/components/`: AppShell, PageHeader, Card, StatTile, Badge (source/trust, stale, member),
  PriceTag, EmptyState, Skeleton, plus the shadcn primitives the screens need.
- App shell: a mobile bottom tab bar with 5 tabs (Scan, List, Receipts, Spending, Community) plus a
  "More" sheet for Contribute and Memberships. A sidebar layout on desktop.
- Real logo and favicon (simple SVG cart plus checkmark), proper `<title>` and meta tags.

### Phase 2: Redesign the three working screens
- **Scan:** a hero "scanner" panel (camera-style frame with an animated scan line, a product picker and
  barcode entry), a big "Best value" card and a "Cheapest per unit" card, then the ranked options as
  rows (product, store, sticker price, per-unit price, quality stars, source/freshness badge). Turn the
  quality-versus-price slider into a labeled segmented control or a styled slider.
- **List:** a list builder with quantity steppers, and a plan summary card with the headline total and
  the savings versus a single store and versus the naive plan. Per-store stop cards, and a simple
  route visual (stylized SVG stops, no Maps API needed).
- **Receipts:** a receipt-shaped entry form, a toast when a receipt is saved, a history list, and a clear
  "this updated N prices" callout that links to Scan.

### Phase 3: Turn the stubs into real features (local data, real logic)
- **Spending:** monthly/annual totals derived from receipts. A bar chart by month, breakdown by store and
  category, and a "saved with CartWise" stat. Seed enough historical receipts for the chart to look full.
- **Memberships:** link/unlink loyalty cards (a simulated connect flow with a short loading state). Linked
  status feeds the existing member-price logic, so linking Ralphs visibly changes Scan and List results.
  Move the List screen's "has Ralphs card" toggle here.
- **Contribute:** an "add a product / price" form that writes a `user_report` observation through the
  store, shows up in Scan with an "unverified / community" badge, and loses to fresh scraped prices as
  the provenance rules require. The unknown-barcode error on Scan should link here.
- **Community:** locality threads with seeded posts, authors, timestamps, replies and upvotes; new
  posts and replies persisted locally. Mention products and stores as chips that link to Scan.

### Phase 4: Delight and consistency pass
- Page transitions and number count-ups on the savings figures. Skeletons on first render (fake a short
  delay only where it helps the video).
- An onboarding/landing screen ("Save on every grocery run") with 3 value props and a "Try the demo"
  button.
- Remove every "stub", "placeholder" and "design comes later" string and comment.
- Accessibility basics: labels, focus rings, AA contrast, `prefers-reduced-motion`.

### Phase 5: Demo readiness
- A "Reset demo data" action in settings.
- A scripted demo path that works on the first click every time: scan ketchup, see that the 64 oz wins
  per unit, enter a receipt, watch the ranking change, plan a trip, link a membership, see the savings,
  look at Spending.
- Screenshot every screen at 390px and 1280px with Playwright (Chromium is preinstalled) and fix
  anything off.
- `npm run build` passes. Optional: deploy free to GitHub Pages or Vercel (static site, no backend).
- README with screenshots, the tech stack, and how the ranking and trip math work. This supports the
  "coding skill" criterion.

## Out of scope (per CLAUDE.md)
Supabase hosting, auth, RLS, scale, security hardening, real OCR, real Maps API calls, real loyalty
integrations. Fake the data source when needed, but never the logic.
