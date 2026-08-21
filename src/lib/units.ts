/**
 * Per-unit normalization. Nothing in the app compares two prices without going
 * through here first: a 32 oz jar at $5.00 beats a 12 oz jar at $2.50, and the
 * sticker price says the opposite.
 */

/** The dimension a product is sold by. Prices are only comparable within one. */
export type Dimension = 'mass' | 'volume' | 'count'

export type Unit =
  | 'g' | 'kg' | 'oz' | 'lb'
  | 'ml' | 'l' | 'floz' | 'gal'
  | 'ct'

/** Canonical unit per dimension; all normalized prices are quoted in these. */
const CANONICAL: Record<Dimension, Unit> = { mass: 'g', volume: 'ml', count: 'ct' }

/** Multiplier to the canonical unit of the same dimension. */
const CONVERSION: Record<Unit, { dimension: Dimension; toCanonical: number }> = {
  g:    { dimension: 'mass',   toCanonical: 1 },
  kg:   { dimension: 'mass',   toCanonical: 1000 },
  oz:   { dimension: 'mass',   toCanonical: 28.349523125 },
  lb:   { dimension: 'mass',   toCanonical: 453.59237 },
  ml:   { dimension: 'volume', toCanonical: 1 },
  l:    { dimension: 'volume', toCanonical: 1000 },
  floz: { dimension: 'volume', toCanonical: 29.5735295625 },
  gal:  { dimension: 'volume', toCanonical: 3785.411784 },
  ct:   { dimension: 'count',  toCanonical: 1 },
}

export function dimensionOf(unit: Unit): Dimension {
  return CONVERSION[unit].dimension
}

export function canonicalUnit(dimension: Dimension): Unit {
  return CANONICAL[dimension]
}

/** Convert a quantity to the canonical unit of its dimension. */
export function toCanonical(quantity: number, unit: Unit): number {
  return quantity * CONVERSION[unit].toCanonical
}

export interface NormalizedPrice {
  /** Price per canonical unit, in the same currency as the input. */
  perUnit: number
  dimension: Dimension
  unit: Unit
}

/**
 * A package's price expressed per canonical unit.
 *
 * `size` is the total sellable amount in the package: a 6-pack of 12 floz cans
 * is 72 floz, not 6. Callers are responsible for that multiplication, because
 * only the package record knows whether its count is separable.
 */
export function normalize(priceCents: number, size: number, unit: Unit): NormalizedPrice {
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    throw new RangeError(`price must be a non-negative number, got ${priceCents}`)
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new RangeError(`size must be a positive number, got ${size}`)
  }
  const dimension = dimensionOf(unit)
  return {
    perUnit: priceCents / toCanonical(size, unit),
    dimension,
    unit: CANONICAL[dimension],
  }
}

/**
 * Rank normalized prices cheapest-first. Mixing dimensions is a programming
 * error, not a user-facing condition -- you cannot compare $/g to $/ml.
 */
export function cheapestFirst<T>(
  items: readonly T[],
  priceOf: (item: T) => NormalizedPrice,
): T[] {
  const dimensions = new Set(items.map((i) => priceOf(i).dimension))
  if (dimensions.size > 1) {
    throw new TypeError(
      `cannot compare across dimensions: ${[...dimensions].sort().join(', ')}`,
    )
  }
  return [...items].sort((a, b) => priceOf(a).perUnit - priceOf(b).perUnit)
}
