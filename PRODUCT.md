# Product

<!-- impeccable:product-schema 1 -->

> Inferred from `docs/polish-plan.md`, `CLAUDE.md` and the owner's build brief (2026-10-07). The
> interview round was skipped at the owner's instruction to proceed autonomously; every section
> below is drawn from those documents, not invented.

## Platform

web

## Users

Household grocery shoppers on a budget, standing in a store aisle or planning a weekly run at home
on their phone. Their job: decide what to buy and where, without overpaying.

Secondary audience (the one that decides this entry's fate): Congressional App Challenge judges, who
watch a 1-3 minute demo video and may click through on a laptop.

## Product Purpose

CartWise shows the real price per ounce across nearby stores and brands, says whether the cheap
store is worth the drive, and lets shoppers' receipts keep prices current for everyone. Success in
the demo: a viewer understands within seconds that the sticker price lies and that CartWise tells
the truth, and every feature shown works on the first click.

## Positioning

Every comparison is per unit, never per sticker; trip plans count fuel against savings; every price
carries its provenance (store website, member account, receipt, community report) and its age.
Freshest price wins, ties go to the more trustworthy source.

## Operating Context

- Mobile-first: the demo shows a phone-sized app. It must also look intentional at 1280px.
- Core loop: Compare a product -> adjust quality vs. price -> enter a receipt -> Compare and Trip
  update -> link a store card to unlock member prices -> review spending.
- No backend. Data lives in a local catalog store seeded with fabricated but realistic data and
  persisted in the browser.

## Capabilities and Constraints

- Screens: Home, Compare, Trip, Receipts, Spending, Profile (store cards, theme, reset demo data).
  Community and stub screens are cut.
- Unknown barcodes route to an "Add this product" flow that writes a community (`user_report`)
  price.
- Stack: React 19, Vite, TypeScript, Tailwind v4, lucide-react icons, recharts for charts.
- No paid services, no hosting, no auth. Demo data is synthetic; nothing on screen may claim real
  store partnerships or real prices.

## Brand Commitments

- Name: CartWise. A real SVG logo and favicon are required.
- From the plan: fresh and trustworthy; green/teal primary; one warm accent reserved for savings;
  neutral surfaces; a characterful heading face; restraint everywhere except the savings numbers.
- The owner bans: purple gradients, gradient text, glassmorphism, emoji icons, nested cards,
  shadows on everything.

## Evidence on Hand

- Seed catalog in `src/data/seed.ts`: Ralphs, Target, Whole Foods in Westwood plus a cheaper Ralphs
  in Santa Monica; ketchup, olive oil, eggs, milk, rice. All synthetic.
- No testimonials, user counts, savings statistics or partnerships exist. Do not fabricate them.

## Product Principles

1. Per unit or it did not happen: the per-unit price is always the biggest number.
2. Show the work: every recommendation states its reason in one line.
3. Provenance is visible: source and freshness travel with every price.
4. The drive is a cost: savings are reported net of fuel.
5. Finished beats broad: a feature shown works perfectly; anything else is not shown.

## Accessibility & Inclusion

Target WCAG 2.1 AA contrast in both light and dark themes; full keyboard operation; respects
`prefers-reduced-motion`. (Inferred; no stricter standard was set.)
