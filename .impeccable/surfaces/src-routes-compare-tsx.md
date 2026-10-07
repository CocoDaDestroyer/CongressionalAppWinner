---
version: 1
slug: "src-routes-compare-tsx"
primary_target: "src/routes/Compare.tsx"
related_targets: ["src/App.tsx"]
---

# Surface brief: app shell + Compare

Scope: the CartWise app shell (navigation) and the Compare screen; the system then extends to Trip,
Receipts, Spending, Home and Profile. Mode: Operate.

Audience/job: a shopper deciding which package and store to buy from; judges watching a demo.
Constraints: mobile-first (390px) and intentional at 1280px; light and dark; lucide icons only;
tokens in src/index.css. Degraded roll (no challengers; roll service blocked by network policy).

Grounded candidates by resonance: 1 shelf-edge unit-price tag, 2 Nutrition Facts panel,
3 thermal receipt, 4 weekly grocery circular, 5 highway guide signs, 6 farmers' market chalkboard,
7 produce PLU stickers and crate labels (assigned).

## Direction contract

THESIS: The per-unit price is a produce sticker: one oval of heavy numerals stuck on the winner.
Refuses the category default of a grey comparison table with a green "Best deal" pill.

OWN-WORLD: Deep leaf-green shell (rail on desktop, header band on mobile) over a faintly green-tinted
neutral ground; dark mode is a green-black ground with the same leaf accents. Tangerine is reserved
for money saved. Stickers: full-round ovals, leaf-green fill with white numerals for the winner,
ink outline for the rest. Bricolage Grotesque at heavy weight for numerals and headings, Figtree for
UI text. Rows divided by hairlines, never cards in cards; 14px container radius.

STORY: The shopper sees the winner and the reason in one line, trusts it because every price shows
its source and age, nudges quality vs. price, and acts.

FIRST VIEWPORT: Product title with change control at top. Hero: the Best value sticker (per-unit
price) beside package, store, shelf price and the one-line why. Quality/price slider directly under
it. Ranked rows follow, per-unit sticker leading each row. Desktop: green rail left, hero+slider
column left, ranked list right.

FORM: candidate 7 of 7 (produce stickers), seed key 56630ebf.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
