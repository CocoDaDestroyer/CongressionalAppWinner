# CartWise: product plan for the Congressional App Challenge

**Deadline: Monday, October 26, 2026, 12:00 PM ET.** That leaves about 2.5 weeks from 2026-10-07. Submission
needs a public YouTube demo video (1-3 minutes) and the code.

## What wins

Judges score three things: the **idea** (creativity, originality, a real need), the **implementation**
(UX and design), and **coding skill**. In practice they watch a 2-minute video and maybe click through.
So the goal is not more features. The goal is **one clear story, told by a few screens that each look
finished**. Every feature shown has to work perfectly on the first try, and every feature not shown
has to stay out of the way.

## The story (decide this first; everything else serves it)

> Groceries cost more every month, and the sticker price lies. CartWise shows the real price per ounce
> across nearby stores and brands. It tells you whether the cheap store is worth the drive, and your
> receipts keep the prices honest for everyone.

That is a cost-of-living story with a community angle, which fits a congressional audience well.
Lead the video with that framing, then show the app proving it.

## Where things stand (as of 2026-10-07)

| Feature | State | Demo value |
|---|---|---|
| Compare (Scan) | Works: per-unit ranking, quality vs. price slider, provenance | **Core.** The "aha": the 64 oz wins while costing more |
| Trip planner (List) | Works: store-subset optimizer with fuel cost | **Core.** The algorithmic flex: "the cheap store isn't worth the drive" |
| Receipts | Works: entry feeds live prices into Compare and Trip | **Core.** Closes the loop and shows data freshness |
| Spending | Stub | High value, low cost: derived from receipts, makes a great chart |
| Memberships | Stub | Medium: member pricing already exists in the logic, it just needs a switch |
| Contribute | Stub | Low as its own tab; useful as the unknown-barcode fallback |
| Community | Stub | Lowest: expensive to make convincing, off the core story |
| Design | None | **The biggest gap.** Nothing is styled yet |

The logic is strong and tested (70 tests). The gap is almost entirely presentation.

## Feature decisions (tasteful scope)

**Keep and polish: the core loop.**
1. **Compare.** Rename the "Scan" tab to "Compare" until real scanning exists (see the stretch goals).
   Use a hero card with the "Best value" pick and a one-line *why* ("38% cheaper per oz than the 20 oz,
   4.6 stars"). Show the ranked rows with per-unit price as the biggest number on each row. Sticker
   price and the source/freshness badge stay small, as supporting detail.
2. **Trip.** A headline total and "You save $X vs. shopping at one store", the stops as cards, and a
   simple SVG route diagram. The comparison against "cheapest everywhere, ignoring the drive" is the
   punchline, so give it a clear visual.
3. **Receipts.** A receipt-styled entry form. On save, show the payoff: "Updated 3 prices. Compare
   now reflects this receipt."

**Add, because it is cheap and visual.**
4. **Spending.** This month and this year, a bar chart by month, and top stores. It is pure
   aggregation over receipts, so it needs about 6 months of seeded history.
5. **Home/Overview** (optional, small): "Saved $X this month" plus three quick actions (Compare,
   Plan a trip, Add receipt). It gives the video a strong opening frame.

**Fold in rather than build out.**
6. **Memberships becomes a "Store cards" section in a Profile screen.** Wallet-style cards with a
   Link toggle. Linking must visibly change prices in Compare and Trip, which reuses existing logic.
   Move the trip screen's "has Ralphs card" checkbox here.
7. **Contribute becomes the unknown-barcode flow.** Not a tab. When a barcode isn't found, offer
   "Add this product." The submission shows up with a "Community" badge and still loses to a fresher
   scraped price, which demonstrates the provenance rules.

**Cut from the navigation.**
8. **Community.** Remove the tab. If there is time after everything else is finished, add a small
   read-mostly "Local tips" list on Home. A thin chat screen hurts more than no chat screen.

**Navigation result:** 4 bottom tabs (Home or Compare, Trip, Receipts, Spending) plus a Profile icon.
On desktop, a sidebar.

## Stretch goals (only after the core is finished; each is a big "wow" in the video)

- **Real barcode scanning** with the phone camera (`@zxing/browser`, or the native `BarcodeDetector`
  where supported), feeding the existing `getPackageByGtin`. Free, no backend. Seeing a real scan in
  the video is very persuasive. Keep manual entry as a fallback.
- **Real receipt OCR** with `tesseract.js` (runs in the browser, free) that pre-fills the receipt form
  for the user to confirm. Only worth it if it reliably reads one clean demo receipt.
- **Free static deploy** (GitHub Pages, Netlify or Vercel) so judges can click a link. It costs
  nothing and runs no backend, so it fits the project rules.

## Design approach

Use the **Impeccable** skill, which is installed in `.claude/skills/impeccable`, as the design
workflow:
1. `/impeccable init`: writes `PRODUCT.md` (audience, purpose, voice) from this plan.
2. `/impeccable shape`, then `/impeccable craft` on the app shell and Compare first. That sets the
   visual world. Record it in `DESIGN.md` (`/impeccable document`).
3. Apply the same system to Trip, Receipts, Spending and Profile.
4. `/impeccable critique` and `/impeccable audit` per screen. Then `polish`, `harden` (empty and
   error states), and `adapt` (390px phone and 1280px desktop).
5. Run `impeccable detect src` before each commit to catch the obvious AI-design tells.

Direction to start from (Impeccable may refine it): fresh and trustworthy, with green/teal as the
primary color. One warm accent used only for savings. Neutral surfaces. A characterful heading font.
Mobile-first. Restraint everywhere except the savings numbers.

The wshobson/agents plugins (`ui-design`, `frontend-mobile-development`, `javascript-typescript`,
`unit-testing`) cover component architecture, Tailwind design systems and testing.
`avoid-ai-writing` is for the README and video script.

## Timeline (19 days)

| Days | Work |
|---|---|
| 1-2 | Design direction, tokens, app shell and navigation, logo. Compare fully redesigned |
| 3-5 | Trip and Receipts redesigned. Store cards in Profile; fold Contribute into the barcode flow |
| 6-8 | Spending with seeded history. Home screen. Empty, loading and error states everywhere |
| 9-10 | Critique and audit passes, mobile and desktop screenshots, fixes. **Feature freeze** |
| 11-13 | Stretch: camera scanning, then a static deploy |
| 14-15 | README with screenshots and "how it works"; demo script; record and edit the video |
| 16-19 | Buffer: re-record, fix bugs found on camera, submit early (by Oct 23) |

## Out of scope (per CLAUDE.md)

Hosting a backend, auth, security, scale, real loyalty integrations, real Maps API calls, and paid
services of any kind.
