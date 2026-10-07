> **Superseded.** This quiet white-card plan read as generic. The current system is "shelf-tag
> print", specified in `DESIGN.md`. This file is kept as the record of why v1 and v2 were replaced.

# CartWise design plan: clean and quiet

## What went wrong in v1

- **Heavy chrome.** A dark green rail and header band framed every screen, so the app read as
  heavy and dated before the content got a word in.
- **Ornament on every row.** Each row had a chunky oval "sticker", the hero one was tilted, and the
  winner got its own green fill too.
- **Badge soup.** Rows carried three to five colored pills, so nothing stood out.
- **Two display voices.** A condensed extra-bold display face sat next to a rounded body face, with
  uppercase labels on top. That's too many voices for a utility app.
- **Boxes inside boxes.** Tinted hero panels sat inside bordered panels, with long intros on every
  page.

## Direction: "the price tag, not the poster"

CartWise should feel like a well-made utility you'd trust with money: calm white surfaces, one
green, one typeface, and numbers that do the talking. The memorable thing is a single big per-unit
price at the top of Compare. Everything else stays quiet.

## Tokens

### Color (light)

| Token | Value | Job |
|---|---|---|
| `ground` | `#F4F6F3` | page background |
| `surface` | `#FFFFFF` | cards, sidebar, tab bar |
| `line` | `#E4E8E3` | hairlines and card borders |
| `ink` | `#17201B` | text |
| `ink-muted` | `#5D6962` | secondary text |
| `leaf` | `#13804A` | the one brand color: primary actions, the winning price, active nav |
| `leaf-soft` | `#E9F4EC` | selected rows, the active nav pill |
| `savings` | `#C24E14` | money saved, as text only |

Dark mode uses the same roles: ground `#0E1210`, surface `#151A17`, line `#262D29`, ink `#ECF1ED`,
leaf `#4FC384`.

Status colors (stale, community, member) show up only as **text color on a small label**, never as
filled pills, and only when the status is unusual. A fresh store-site price gets no badge at all.

### Type

- **One family: Figtree.** Weights: 400 body, 500 labels, 600 titles, 700 big numbers.
- Scale: 12 · 13 · 14 · 16 · 18 · 22 · 28 · 40 px. Titles track -0.015em, big numbers -0.03em.
- All numbers use tabular figures. Sentence case everywhere: no uppercase labels and no eyebrows.

### Shape and depth

- Cards: 16px radius, a 1px `line` border and a barely-there shadow (`0 1px 2px` at 4%). Never
  nested.
- Buttons and inputs: 10px radius, 44px tall. Pills are only for the active tab and small labels.
- Rows inside a card are split by hairlines with 16px padding. No backgrounds except on the
  selected row.

### Layout

```
Desktop (≥1024)                                   Phone (390)
┌──────────┬────────────────────────────────┐     ┌──────────────────────┐
│ CartWise │  Ketchup                       │     │ CartWise          (o)│
│          │  You scanned Heinz 20 oz  [▾]  │     │ Ketchup              │
│ Home     │ ┌───────────────┐ ┌──────────┐ │     │ Heinz 20 oz      [▾] │
│ Compare  │ │ 14.0¢ /oz     │ │ row      │ │     │ ┌──────────────────┐ │
│ Trip     │ │ Heinz 64 oz   │ │ row      │ │     │ │ 14.0¢ /oz        │ │
│ Receipts │ │ 30% less ...  │ │ row      │ │     │ │ Heinz 64 oz ...  │ │
│ Spending │ └───────────────┘ │ ...      │ │     │ └──────────────────┘ │
│          │  price ◀──●──▶ quality         │     │  price ──●── quality │
│ Profile  │                   └──────────┘ │     │  rows ...            │
└──────────┴────────────────────────────────┘     ├──────────────────────┤
 white sidebar, hairline right edge                │ ⌂   ▦   ↯   ▤   ▥   │
                                                   └──────────────────────┘
```

Content is left-aligned. The page title is the subject ("Ketchup", "This week's trip"), not the
feature name, with one short muted line under it at most.

## Screen by screen

- **Shell.** White sidebar with a hairline right edge and a small green app-icon logo. The phone
  header sits on the ground color with no band. The tab bar is white with a hairline, and the active
  tab is green icon plus label.
- **Compare.** The hero card shows the per-unit price huge (40px, green) with "Best value" as a
  small green label beside it, then the product, the store and price, and one reason line. The rows
  read: product name, then store and shelf price muted, with the per-unit price right-aligned in
  bold. Only unusual facts become small colored text (Member · locked, Community, Stale,
  Unverified). The slider is custom: a thin track with a green fill.
- **Trip.** The total is big, with the saving as orange text beside it. The route diagram uses thin
  lines and small numbered dots. The comparison bars are 8px tall. Stops are plain cards.
- **Receipts.** A clean white card with dashed separators. No uppercase and no torn edge.
- **Spending.** Four quiet stat cards, the chart with its gridlines removed, and the store list as
  thin bars.
- **Home.** A large "Saved $22.69 this month" in plain ink, with only the amount in orange. Quick
  actions sit as a simple list in one card.
- **Profile.** Store cards keep their deep fills (a real wallet object is the one place color can
  be big) but drop the oversized ornament.

## Review against the brief

- *Generic SaaS-card kit?* It risks that. Mitigation: one hero card per screen, with everything
  else as rows and hairlines. Radii differ by hierarchy (16 for cards, 10 for controls), and there
  are no gradient washes or grey drop shadows.
- *Template chrome?* Eyebrows, uppercase labels, mono labels and arrow-suffixed buttons are all
  removed. Middle-dot meta strings are kept to one per row at most.
- *What makes it CartWise?* The giant per-unit price as the first thing on Compare, in the green
  that only ever means "the one to buy".
