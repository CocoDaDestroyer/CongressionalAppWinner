---
name: CartWise
description: Grocery prices per ounce, printed like a shelf tag, with the drive counted.
colors:
  paper: "#f5f0e6"
  paper-raised: "#fbf8f1"
  paper-sunken: "#ece5d6"
  rule: "#d9d0bd"
  rule-strong: "#14201b"
  ink: "#14201b"
  ink-muted: "#4f5b54"
  ink-faint: "#606b64"
  teal: "#0b5d4b"
  teal-hover: "#084a3b"
  teal-wash: "#dcebe3"
  on-teal: "#ffffff"
  tag: "#ffd23f"
  on-tag: "#14201b"
  brick: "#a13a22"
  amber: "#7a4a00"
  community: "#2f4f9a"
  rating: "#b8800a"
  card-1: "#1d4a3c"
  card-2: "#26365a"
  card-3: "#4a2f26"
  dark-paper: "#0f1512"
  dark-paper-raised: "#161f1a"
  dark-rule: "#2a352e"
  dark-ink: "#f1ecdf"
  dark-ink-muted: "#a9b3ac"
  dark-ink-faint: "#8d978f"
  dark-teal: "#5fd3a8"
  dark-brick: "#ff8a6b"
  dark-community: "#8fa8f0"
  dark-amber: "#e8b04a"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.6vw, 3.25rem)"
    fontWeight: 800
    letterSpacing: "-0.035em"
    lineHeight: 0.95
  hero-numeral:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(4rem, 3rem + 6vw, 7.5rem)"
    fontWeight: 800
    letterSpacing: "-0.05em"
    lineHeight: 0.85
  page-title:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)"
    fontWeight: 700
    letterSpacing: "-0.03em"
  section-title:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  data:
    fontFamily: "DM Mono, ui-monospace, monospace"
    fontSize: "0.9375rem"
    fontWeight: 500
  data-small:
    fontFamily: "DM Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
  stamp:
    fontFamily: "DM Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
  row-price:
    fontFamily: "DM Mono, ui-monospace, monospace"
    fontSize: "17px"
    fontWeight: 500
  logo:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
  receipt-total:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
rounded:
  track: "2px"
  thumb: "3px"
  tag: "4px"
  control: "8px"
  card: "6px"
  pill: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-desktop: "56px"
  stack: "28px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.teal}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "48px"
  price-tag:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
  savings-tag:
    backgroundColor: "{colors.tag}"
    textColor: "{colors.on-tag}"
    rounded: "{rounded.tag}"
---

# Design System: CartWise

> Source: the owner's "shelf-tag print" brief (2026-10). It replaces the earlier quiet white-card
> system; `docs/design-plan.md` records why that one read as generic.

## Overview

**Shelf-tag print.** Every grocery aisle already has a visual language for the one thing CartWise
cares about: the little label under the product that says what it costs per ounce. CartWise takes
that label, the thermal receipt and the chalkboard sign, and treats them with editorial confidence.
The page is warm paper. Prices are printed ink. The single loud thing is a shelf-tag yellow that
appears only where money is saved.

1. **The per-unit price is a poster.** Enormous and condensed, with real typographic structure:
   large dollars-and-cents numeral, small superscript fraction, mono unit.
2. **Ink that ages.** Provenance and freshness are drawn into the price itself, so staleness is
   felt before it is read.
3. **Savings wear the tag.** Yellow is a physical object (a sale tag), never a text color.

## Colors

Tokens live in `src/index.css` (`@theme`, plus `:root[data-theme="dark"]`) and are used only through
Tailwind utilities. No component contains a hex value.

- **Paper and ink.** `paper` ground, `paper-raised` cards/tags/sidebar, `paper-sunken` wells and
  hover. `ink` (14.8:1) for headlines and prices, `ink-muted` 6.3:1, `ink-faint` 5:1+. Hairlines are
  `rule`; structural rules (under page titles, above totals, tag outlines) are full `ink` at 1-2px.
  The paper carries a barely-there SVG grain on `body` only.
- **Teal** (6.9:1): "the one to buy" and "you are here" only: best-value row wash (`teal-wash`),
  route line, active nav marker, focus ring. Primary buttons are ink and turn teal on hover.
- **Shelf-tag yellow** (`tag`, ink text 11.6:1): always a filled shape with ink text, never text on
  paper. It means money saved and the "Best per oz" tag, nothing else.
- **Status** (text and small marks only): `brick` stale/danger, `amber` unverified, `community`
  community-sourced, `rating` stars (decorative).
- **Dark, "after hours":** warm near-black, retuned rather than inverted. Tag yellow is unchanged
  and glows against it.

Named rules: yellow is a tag, never a font color. One teal. No purple, no gradients as color.

## Typography

- **Bricolage Grotesque** (800/700): display, page titles, every large price numeral.
- **Hanken Grotesk** (400/600): body, labels, buttons.
- **DM Mono** (500, tabular): all data: units, distances, timestamps, receipt lines, stamps.

Hero numeral `clamp(4rem, 3rem + 6vw, 7.5rem)`, one per screen. Numerals: dollars large, cents as a
superscript at 42% with no decimal point and an ink underline (as on real shelf tags), unit in mono
tucked under the cents. The full value is announced once for screen readers. Dotted leaders join names to prices in itemized lists. Sentence
case everywhere; uppercase only on provenance stamps.

## Layout

Mobile first: 16px gutters at 390px, 56px on desktop, max 1200px. Desktop screens use a 5/7 split
with a full-width 2px ink rule starting each page. Stat strips are a ledger (one row, vertical rules),
not four boxes. Phones: quiet top bar on paper; bottom tab bar on `paper-raised` with a 2px ink top
rule and a 3px teal bar over the active tab. Desktop: 248px `paper-raised` sidebar with a 2px ink
right rule, logo on a tag, active item teal-wash with a 3px teal left edge. Home opens on a
full-bleed teal band.

## Elevation & Depth

Flat paper with one shadow: the offset tag shadow `4px 4px 0 ink`, no blur, on price tags, the
savings tag and (on hover) buttons only. Cards use a 1px `rule` border and never nest.

## Shapes

Tags and cards 4-6px with a die-cut hole cut by a CSS mask (`die-cut-top`, `die-cut-left`); the price tag's offset
shadow is its own layer with the same cut, so it shows through the hole. The logo is an ink tag with a
die-cut hole. Buttons and inputs 8px. Receipt blocks get a
zig-zag bottom edge (a mask shape, not a color gradient). Full pills only for the switch and tracks.

## Motion

All motion respects `prefers-reduced-motion`.
- **Numeral tick:** prices and totals roll like an odometer (450ms, ease-out-expo, 30ms stagger).
- **Tag print:** a new lookup result slides out of a slot (520ms, slight overshoot); rows fade up in
  a 40ms stagger.
- **Stamp thunk:** stamps scale 1.15 to 1 with a fixed 2-3° rotation.
- **Route draw:** the route stroke draws in over 700ms; stops pop as it reaches them.
- **Receipt sweep:** a highlight bar sweeps a newly saved receipt line.
- **Page changes:** View Transitions crossfade (200ms) where supported.

## Signature Components

- **PriceTag:** the hero per-unit price as a shelf tag: `paper-raised` body, 1.5px ink outline,
  die-cut hole, hero numeral, mono unit, store and size in small print with a dotted leader to the
  sticker price, and a yellow "Best per oz" tag on its corner.
- **InkPrice:** ink that ages. Fresh (≤3 days) full ink; aging (4-14) `ink-muted`; stale (>14)
  `ink-faint` with a `brick` underline and an age stamp. Source stamps: MEMBER, RECEIPT, COMMUNITY,
  UNVERIFIED (store site gets none).
- **Shelf:** Compare's ranked list as rows with a per-unit bar proportional to cents per oz.
- **Value frontier:** a small scatter of cents/oz against review score on desktop Compare.
- **Receipt blocks:** mono type, dotted leaders, zig-zag edge, a heavy TOTAL line.
- **Trip route:** numbered ink stops, teal route stroke, mono distances, skipped stores in faint ink.
- **Buttons:** ink fill, paper text, 48px; hover turns teal and lifts 2px with a `2px 2px 0 ink`
  shadow. Inputs: `paper-raised`, 1.5px `rule-strong`, teal focus ring. Slider: 6px ink track, teal
  fill, square thumb.

## Do's and Don'ts

Do: make the per-unit price the largest thing; print provenance into the price; yellow only as a
filled tag; teal only for "buy this"/"you are here"; Bricolage for numerals, mono for data, dotted
leaders for itemized rows; one motion per moment.

Don't: gradients as color, gradient text, glass, purple or emoji; nested cards or blur shadows;
yellow text on paper; three identical cards; showing the value score as a rating; invented savings,
users or partnerships; uppercase eyebrows over headings.
