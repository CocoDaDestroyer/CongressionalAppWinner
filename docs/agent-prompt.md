You are taking over CartWise, a React 19 + Vite + TypeScript + Tailwind v4 grocery price-comparison app in this repo. It is an entry for the Congressional App Challenge, due Monday, October 26, 2026 at 12:00 PM ET. Judges score the idea, the implementation (UX and design), and coding skill, mostly by watching a 1-3 minute demo video. Your job is to make the app look as polished as possible and make every feature in the demo work cleanly. It does NOT need to scale or be secure. Spend zero effort on backend, auth, RLS or hardening.

READ FIRST: CLAUDE.md (all of it), then docs/polish-plan.md (the product plan: the story, the feature decisions and the timeline; follow its scope exactly). Then read src/lib/*.ts, src/routes/*.tsx, src/data/seed.ts and the tests. Run `npm ci`, `npx vitest run`, `npm run typecheck` and `npm run lint` to confirm the green baseline (133 tests pass).

TOOLS IN THIS REPO:
- The Impeccable design skill is at `.claude/skills/impeccable` (invoke with `/impeccable <command>`). Use it as your design workflow: `init` (writes PRODUCT.md from docs/polish-plan.md), then `shape` and `craft` for the app shell and Compare screen, then `document` (writes DESIGN.md), then apply that system to the other screens. Finish each screen with `critique`, `audit`, `polish`, `harden` (empty/error states) and `adapt` (390px and 1280px). Run `.claude/skills/impeccable/scripts/impeccable detect src` before each commit and fix what it reports. The `impeccable-finish-reviewer` agent reviews a finished build.
- If the wshobson/agents plugins are enabled (`ui-design`, `frontend-mobile-development`, `javascript-typescript`, `unit-testing`, `accessibility-compliance`, `avoid-ai-writing`), use them for component architecture, Tailwind design systems, tests, accessibility, and for the README and demo-script prose.

SCOPE (from docs/polish-plan.md; do not expand it):
1. Compare (rename the "Scan" tab): a hero "Best value" card with a one-line reason, ranked rows with per-unit price as the main number, small source/freshness/member badges, and the quality-vs-price slider.
2. Trip (the current List screen): headline total, "You save $X vs. one store", stop cards, an SVG route diagram, and a clear visual for "cheapest everywhere, ignoring the drive" vs. the optimized plan.
3. Receipts: a receipt-styled form. On save, a toast like "Updated N prices", linking to Compare.
4. Spending (new, real logic): aggregate receipts by month, store and year in a pure, unit-tested function in src/lib/. Show stat tiles and a bar chart (recharts). Add about 6 months of realistic historical receipts to the seed.
5. Home (small): "Saved $X this month" and three quick actions.
6. Profile: "Store cards" (wallet-style) with a Link toggle stored in catalogStore. It must feed the existing member-price logic so Compare and Trip visibly change. Move the trip screen's Ralphs checkbox here. Add a theme toggle and "Reset demo data".
7. Contribute becomes the unknown-barcode flow on Compare, not a tab. It writes a `user_report` observation through catalogStore, shows a "Community" badge, and loses to a fresher scrape. Add a test for that.
8. Remove the Community tab and route. Remove every stub screen and every "design comes later" comment.
Navigation: a mobile bottom tab bar (Home, Compare, Trip, Receipts, Spending) plus a Profile button. On desktop, a sidebar with the logo. Add a real SVG logo and favicon.
Stretch, only after 1-8 are finished and reviewed: camera barcode scanning with @zxing/browser (or the native BarcodeDetector) feeding `getPackageByGtin`, with manual entry kept as a fallback.

HARD RULES:
- Screens read data only through `useCatalog()` / `useReceipts()`. Mutations go through `catalogStore`. Never build a repository in a component. Any `useMemo` that derives from the repo lists the repo as a dependency.
- Compare prices per unit with `normalize()` / `cheapestFirst()`. Follow the provenance rules (freshest wins; ties go to scrape > loyalty_sync > receipt > user_report).
- Fake the data source, never the logic. Every number on screen comes from the real compare/trip/store code.
- Keep the seed's deliberate edge cases. Add to the seed; don't distort it.
- No paid services, no backend, no hosting setup. A free static deploy is the only exception, and only if asked.
- Tests stay green. The redesign will break selectors (`getByRole('table')`, the slider, "Save receipt"/"Add line"/"Delete", the "Item 1"/"Price 1"/"Purchased" labels). Update them deliberately, keep every behavioral assertion, and never delete a test to get green. Add tests for new logic. Component tests need `// @vitest-environment jsdom`.
- Avoid the generic AI look: no purple gradients, no gradient text, no glassmorphism, no emoji icons, no cards nested in cards, no shadow on everything. Use lucide-react icons. Put tokens in `src/index.css` via Tailwind v4 `@theme`, with light and dark modes, and no hard-coded hex values in components.
- After each screen or phase, run `npx vitest run`, `npm run typecheck`, `npm run lint`, `npm run build` and the Impeccable detector. Then commit with a clear message and push to the current branch. No PR unless asked.

QA AND DEMO READINESS:
- Run `npm run dev` and screenshot every route with Playwright and the preinstalled Chromium (executablePath `/opt/pw-browsers/chromium`; never run `playwright install`). Shoot at 390x844 and 1280x800, light and dark, saving to `docs/screenshots/`. Fix what you see in one batch, re-check once, and stop.
- Walk the demo path and make sure it works on the first click: Home → Compare Heinz ketchup (the 64 oz wins per unit while costing more) → move the slider → add a receipt with a lower price → Compare updates → Trip shows fuel-aware savings → link the Ralphs card and see member prices → Spending.
- Rewrite readme.md: pitch, screenshots, features, stack, and "How it works" (per-unit normalization, value scoring, trip optimization with travel cost, price provenance). Write a 90-second script to docs/demo-script.md. Update CLAUDE.md's "Repository status" and "Layout" sections.

Work screen by screen. Keep components small and readable, because code is judged too. If a design choice is ambiguous, follow DESIGN.md and keep going. At the end, report what changed, the screenshot paths, and anything unfinished.
