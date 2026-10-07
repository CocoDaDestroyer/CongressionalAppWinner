---
name: CartWise
description: Grocery prices per ounce, with the drive counted.
colors:
  ground: "#f4f6f3"
  surface: "#ffffff"
  sunken: "#eef1ed"
  line: "#e4e8e3"
  line-strong: "#cdd3cc"
  ink: "#17201b"
  ink-muted: "#5d6962"
  ink-faint: "#8a948d"
  leaf: "#13804a"
  leaf-hover: "#0f6b3d"
  leaf-soft: "#e9f4ec"
  leaf-ink: "#0f6b3d"
  on-leaf: "#ffffff"
  savings: "#c24e14"
  savings-soft: "#fdf0e7"
  rating: "#d99a0b"
  warn: "#a15c07"
  danger: "#c03221"
  danger-soft: "#fcebe8"
  community: "#3d5fa8"
  card-1: "#1d4d36"
  card-2: "#24385e"
  card-3: "#3b3330"
typography:
  hero-number:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    letterSpacing: "-0.03em"
  page-title:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    letterSpacing: "-0.015em"
  home-title:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 600
  stat:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
  section-title:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  page-title-desktop:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
  receipt-total:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
  card-title:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
  body:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  row-number:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
  small:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "14px"
  caption:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  micro:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
rounded:
  card: "16px"
  control: "10px"
  segment: "8px"
  pill: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-desktop: "48px"
  stack: "24px"
components:
  button-primary:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.on-leaf}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.leaf-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  nav-active:
    backgroundColor: "{colors.leaf-soft}"
    textColor: "{colors.leaf-ink}"
    rounded: "{rounded.control}"
---

# Design System: CartWise

## Overview

**The price tag, not the poster.** CartWise is a utility people trust with money, so it should look
calm and exact: white surfaces on a faintly green-grey ground, one typeface, one brand green, and
numbers that do the talking. The one memorable element is the big per-unit price at the top of
Compare. Everything around it stays quiet.

The reasoning and the v1 post-mortem are in `docs/design-plan.md`.

## Colors

Tokens live in `src/index.css` (`@theme` for light, `:root[data-theme="dark"]` for dark) and are
used only through Tailwind utilities. No component contains a hex value.

### Primary
- **Leaf** (`leaf`): the only brand color. It means "the one to buy" (the winning per-unit price,
  the best-value row) or "you are here" (active nav, the route line, primary buttons).
- **Leaf soft**: background of the selected row and the active nav item.

### Secondary
- **Savings orange** (`savings`): money saved, as text, and nothing else.

### Neutral
- `ground` (page), `surface` (cards, sidebar, tab bar), `sunken` (hover, segmented controls),
  `line` (hairlines and borders), and `ink` / `ink-muted` / `ink-faint` for text.

### Status
- `warn`, `community`, `danger`, `rating` show up only as **text and icon color**, never as filled
  pills. A fresh store-site price gets no label at all.
- `card-1..3`: wallet card fills on Profile. They are deliberately generic and never a real
  retailer's livery.

### Named Rules
- **One green.** If it isn't the recommended option or the current location, it isn't leaf.
- **Orange is money saved.** Not fuel, not warnings, not ratings.

## Typography

**One family: Figtree** (variable, self-hosted). Weights: 400 body, 500 labels and controls, 600
titles, 700 numbers. All numbers use tabular figures (`tabular`), and big numbers use the `numeral`
utility (700, -0.03em tracking). Sentence case everywhere: no uppercase labels and no eyebrows above
headings.

### Hierarchy
- Hero number: 44px / 700, leaf.
- Page title: 26px (30px desktop) / 600, with one muted 15px line under it at most.
- Card title: 16-18px / 600.
- Row title: 15-16px / 500. Secondary line: 14px `ink-muted`, at most one middle-dot separator
  chain per row.
- Labels and captions: 12px / 500.

## Layout

- Mobile first. 16px gutters at 390px, 48px on desktop, content max 1152px.
- Phones: a quiet top bar on the ground color (logo, profile button), and a white bottom tab bar
  with a hairline. The active tab is a green icon and label.
- Desktop (≥1024px): a white 232px sidebar with a hairline right edge. The active item gets a
  leaf-soft background.
- Two-column screens put the decision (hero, slider, totals) in one column and the detail (ranked
  list, list editor) in the other.

## Elevation & Depth

Flat. Cards have a 1px `line` border and `shadow-card` (1px at 4%), just enough to lift them off
the ground. `shadow-float` is only for the toast and the chart tooltip.

## Shapes

- Cards: 16px. Buttons and inputs: 10px. Segmented-control segments: 8px.
- Full pills are only for the "Best value" chip, the switch, and progress bars.

## Motion

When the best value changes (slider, receipt, linked card), the hero's content re-keys and plays
`settle`: a 360ms fade-and-rise on `ease-out-expo`. The toast and the Home title rise in once.
Everything else is instant. `prefers-reduced-motion` disables all of it.

## Components

### Buttons
`Button` / `ButtonLink`: primary (leaf), secondary (outlined), ghost, danger (outlined, red text).
44px tall (36px small), 10px radius.

### Labels
`Badge`: a 12px colored text label with an optional 14px icon. It has no fill, so a row never
turns into a wall of pills.

### Cards
`Panel` and the `card` utility: the one container surface. Cards never nest. Rows inside are split
by hairlines.

### Inputs
`Field` wraps a visible label around its control. `inputClass` gives 44px fields with a leaf focus
ring. The quality slider uses the `range` utility: a 4px track filled with leaf up to a white
thumb.

### Unit price (signature)
`UnitPrice`: a per-unit price as a big tabular numeral plus a small muted unit ("14.0¢ /oz"). The
`hero` size is 44px and leaf; the `row` size is 17px and right-aligned. It wraps the canonical value
in `<data>` so sorting and tests read the real number.

## Do's and Don'ts

### Do:
- Lead with the per-unit price and right-align it in lists.
- Label only what's unusual (member, community, receipt, stale, unverified).
- Use lucide icons at 16-22px, never emoji.
- Give every screen a designed empty state.

### Don't:
- Don't use gradients, glass, ornament, tilted elements or uppercase labels.
- Don't nest cards or add shadows beyond `shadow-card`.
- Don't use leaf or orange for anything outside their jobs.
- Don't hard-code colors in components; add a token.
- Don't show the value score as a rating.
