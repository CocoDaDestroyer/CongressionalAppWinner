---
name: CartWise
description: Grocery prices per ounce, with the drive counted.
colors:
  ground: "oklch(0.972 0.009 155)"
  surface: "oklch(0.996 0.003 155)"
  sunken: "oklch(0.945 0.012 155)"
  line: "oklch(0.89 0.014 155)"
  line-strong: "oklch(0.78 0.02 155)"
  ink: "oklch(0.23 0.03 160)"
  ink-muted: "oklch(0.45 0.025 160)"
  ink-faint: "oklch(0.58 0.02 160)"
  leaf: "oklch(0.47 0.11 156)"
  leaf-hover: "oklch(0.41 0.1 157)"
  leaf-soft: "oklch(0.93 0.045 152)"
  leaf-ink: "oklch(0.36 0.09 157)"
  on-leaf: "oklch(0.985 0.01 150)"
  shell: "oklch(0.31 0.065 160)"
  shell-raised: "oklch(0.37 0.07 160)"
  on-shell: "oklch(0.96 0.02 150)"
  savings: "oklch(0.72 0.16 55)"
  savings-ink: "oklch(0.53 0.15 45)"
  savings-soft: "oklch(0.95 0.045 65)"
  rating: "oklch(0.74 0.15 82)"
  warn-ink: "oklch(0.5 0.11 70)"
  warn-soft: "oklch(0.95 0.05 88)"
  danger-ink: "oklch(0.52 0.17 27)"
  community-ink: "oklch(0.45 0.09 245)"
  community-soft: "oklch(0.94 0.03 245)"
  card-1: "oklch(0.34 0.07 162)"
  card-2: "oklch(0.36 0.08 250)"
  card-3: "oklch(0.33 0.03 60)"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, Figtree Variable, sans-serif"
    fontSize: "28px (page titles), 36px desktop; 40-60px on Home"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  numeral:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "15-16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  control:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  caption:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "12px"
  micro:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
  sticker-unit:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
  diagram-number:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 800
  page-title:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "28px"
    fontWeight: 800
  stat:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "28px"
    fontWeight: 800
  sticker-hero:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "34px"
    fontWeight: 800
  home-hero:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "40px"
    fontWeight: 800
rounded:
  card: "14px"
  field: "12px"
  focus: "6px"
  pill: "9999px"
  sticker: "50%"
spacing:
  gutter-mobile: "16px"
  gutter-desktop: "40px"
  stack: "24px"
components:
  button-primary:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.on-leaf}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.leaf-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "44px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  sticker-winner:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.on-leaf}"
    rounded: "{rounded.sticker}"
  sticker-plain:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sticker}"
---

# Design System: CartWise

## Overview

CartWise is a working tool that a shopper uses in an aisle and a judge watches in a two-minute
video. The world borrows one thing from the grocery store: the **produce sticker**. The per-unit
price is printed on an oval with heavy numerals. The recommended option gets the filled leaf-green
sticker, and every other option gets an outline. The eye lands on the right number before reading a
word.

Everything else stays out of the way. A deep leaf-green shell (a rail on desktop, a header band on
phones) frames a faintly green-tinted neutral ground. Content sits in flat panels split by
hairlines. Color does jobs: leaf means "this one", tangerine means "money you saved", amber means
"stale or unverified", and slate blue means "community-reported".

Dark mode is a separate palette, not an inversion: a green-black ground with brighter leaf accents.
It is applied as `<html data-theme="dark">`.

## Colors

Tokens live in `src/index.css` under `@theme` (light) and `:root[data-theme="dark"]` (dark).
Components use them only through Tailwind utilities (`bg-leaf`, `text-ink-muted`,
`border-line`). No component contains a hex value.

### Primary
- **Leaf** (`leaf`): the brand and every "this one" signal: the winning sticker, the primary
  button, the active route line, the current month's bar.
- **Leaf soft / leaf ink**: tinted backgrounds for the best-value hero and badges, with readable
  ink on top.

### Secondary
- **Tangerine** (`savings`, `savings-ink`, `savings-soft`): money saved and nothing else: Home's
  headline amount, "You save $X vs. one store", the "Saved this month" tile.
- **Rating gold** (`rating`): review stars only. Kept apart from tangerine so ratings never read
  as savings.

### Neutral
- `ground`, `surface`, `sunken`, `line`, `line-strong`, `ink`, `ink-muted`, `ink-faint`. All
  carry a little leaf hue, so the neutrals never read as cream or blue-grey.
- `shell` / `shell-raised` / `on-shell`: the navigation frame.

### State
- `warn-*`: stale prices, unverified products, fuel cost in charts.
- `danger-*`: destructive buttons and form errors.
- `community-*`: community-reported prices and the add-a-product flow.
- `card-1..3`: wallet card fills. They are deliberately generic and never a real retailer's
  colors.

### Named Rules
- **The Tangerine Rule.** If it isn't money the shopper saved, it isn't tangerine.
- **One filled sticker per list.** Only the recommended option wears the filled leaf sticker.

## Typography

- **Bricolage Grotesque** (variable, self-hosted via Fontsource) at 700-800 for headings and every
  number that matters: sticker numerals, totals, stat tiles.
- **Figtree** (variable, self-hosted) for all UI text.
- Numbers in tables, rows and totals use tabular figures (`tabular` utility).

### Hierarchy
- Page title: 28px / 36px desktop, weight 800.
- Section heading: 18px, weight 700.
- Row title: 16px, weight 600. Secondary line: 14px `ink-muted`.
- Badges and captions: 12px, weight 600.
- No kickers or eyebrow labels above headings. The receipt form's small uppercase field labels are
  the one exception, because the form imitates a printed receipt.

## Layout

- Mobile first. 16px side gutters at 390px; 40px on desktop; content max 1152px.
- Phones: sticky green header (logo, profile), fixed bottom tab bar with five destinations.
- Desktop (≥1024px): 248px green rail with logo and nav; Profile pinned at the bottom.
- Two-column screens on desktop: the decision (hero, slider, totals) on one side and the detail (the
  ranked list, list editor) on the other, with the decision column sticky.

## Elevation & Depth

The app is flat. Panels have a 1px `line` border and no shadow. `shadow-float` is used only on
things that float above content: the toast and the chart tooltip. The receipt form gets a 1px
drop shadow so its torn edge reads against the ground.

## Motion

One authored moment: when the best value changes (slider, new receipt, linked card), the hero
sticker is re-keyed and plays `stick-on`, a 520ms scale-and-rotate settle on `ease-out-expo`, like a
sticker being pressed on. The toast and Home hero rise in. Everything else is instant.
`prefers-reduced-motion` turns all of it off.

## Shapes

- 14px radius on panels, 12px on inputs, full pills on buttons, badges and segmented controls.
- Stickers are true ovals (`rounded-[50%]`), ~1.3:1. The hero sticker is rotated -6°; row stickers
  are upright for scanning.

## Components

### Buttons
`Button` / `ButtonLink` (`src/components/ui/Button.tsx`): primary (leaf), secondary (outlined),
ghost, danger (outlined, red text). 44px tall (36px small), pill-shaped.

### Chips
`Badge`: 24px pills with an optional 14px lucide icon. Tones: neutral, leaf, warn, community,
savings, danger. Price provenance badges live in `components/compare/PriceBadges.tsx`.

### Cards / Containers
`Panel`: the one container surface. Panels never nest. Lists inside panels are split by
`divide-line` hairlines.

### Inputs / Fields
`Field` wraps a visible label around its control. `inputClass` gives 44px fields with a strong
border and a leaf focus ring. The range slider uses the native control tinted by `accent-color`.

### Navigation
`AppShell`: rail links are 44px rows with a raised background when active. Tab bar items are icon
plus label, and the active icon sits in a leaf-soft pill.

### Sticker (signature)
`Sticker` (`src/components/Sticker.tsx`): per-unit price as an oval. Variants `winner` (leaf fill,
inner hairline ring), `plain` (outline), `locked` (dashed outline for member prices that need a
card). Sizes `lg` (hero) and `md` (rows). It wraps the canonical per-unit value in `<data>` so
sorting and tests read the real number.

## Do's and Don'ts

### Do:
- Lead every comparison with the per-unit price, in a sticker.
- Show source and age on every price.
- Use lucide icons at 16-20px, stroke style, never emoji or unicode glyphs.
- Give every screen a designed empty state (`EmptyState`).

### Don't:
- Don't use gradients, gradient text, glass or blur.
- Don't nest panels, and don't put shadows on resting content.
- Don't use tangerine for anything but savings.
- Don't hard-code colors in components; add a token.
- Don't show the value score as a rating. It only means something inside one comparison.
