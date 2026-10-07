/**
 * Turn "I scanned this" into a ranked list of what to actually buy.
 *
 * The comparison walks up from the scanned package to its concept, back down to
 * every sibling package, then joins current prices at every store. Each
 * resulting option is one (package, store, member/public) combination, priced
 * per canonical unit.
 */
import type { CatalogRepository, CurrentPrice } from './repository'
import { SOURCE_LABEL, type Package, type PriceSource, type Store } from './catalog'
import {
  cheapestFirst,
  normalize,
  toCanonical,
  type Dimension,
  type NormalizedPrice,
} from './units'

export interface CompareOption {
  key: string
  pkg: Package
  store: Store
  retailerName: string
  priceCents: number
  isMemberPrice: boolean
  normalized: NormalizedPrice
  source: PriceSource
  sourceLabel: string
  observedAt: string
  /** Whole days between the observation and `now`. */
  ageDays: number
  /** Review sentiment 0..1, or null when nothing has reviewed this package. */
  quality: number | null
  reviewCount: number
  /**
   * A member price at a retailer whose card the shopper has not linked. Still
   * listed, so the shopper can see what linking would unlock, but never
   * recommended.
   */
  memberLocked: boolean
}

export interface Comparison {
  scanned: Package
  conceptName: string
  dimension: Dimension
  /** Every option, cheapest per unit first. */
  options: CompareOption[]
  /** Cheapest usable option per unit. Null only when nothing usable has a price. */
  cheapest: CompareOption | null
  /** Best cost-versus-quality balance; often not the cheapest. */
  bestValue: CompareOption | null
}

/** An observation older than this is shown as stale rather than trusted silently. */
export const STALE_AFTER_DAYS = 14

export interface CompareOptions {
  /**
   * How much quality counts against price, 0..1. At 0 the ranking is purely
   * per-unit cost; at 1 it ignores price entirely. The default splits the
   * difference, which is the app's whole premise.
   */
  qualityWeight?: number
  /** Injected so tests and the seed UI can pin "today". */
  now?: Date
  /**
   * Retailers whose member pricing the shopper can use. Omitted means every
   * member price counts, which is how the catalog looks with no shopper.
   */
  memberRetailerIds?: readonly string[]
}

export function compareByPackage(
  repo: CatalogRepository,
  packageId: string,
  { qualityWeight = 0.5, now = new Date(), memberRetailerIds }: CompareOptions = {},
): Comparison | null {
  const scanned = repo.getPackage(packageId)
  if (!scanned) return null

  const concept = repo.getConcepts().find((c) => c.id === scanned.conceptId)
  if (!concept) return null

  const siblings = repo.getSiblingPackages(concept.id)
  const prices = repo.getCurrentPrices(siblings.map((p) => p.id))
  const byPackage = new Map(siblings.map((p) => [p.id, p]))
  const members = memberRetailerIds ? new Set(memberRetailerIds) : null

  const options: CompareOption[] = []
  for (const price of prices) {
    const pkg = byPackage.get(price.packageId)
    const store = repo.getStore(price.storeId)
    if (!pkg || !store) continue

    const retailer = repo.getRetailer(store.retailerId)
    const quality = repo.getQuality(pkg.id)

    options.push({
      key: optionKey(price),
      pkg,
      store,
      retailerName: retailer?.name ?? 'Unknown store',
      priceCents: price.priceCents,
      isMemberPrice: price.isMemberPrice,
      normalized: normalize(price.priceCents, pkg.size, pkg.unit),
      source: price.source,
      sourceLabel: SOURCE_LABEL[price.source],
      observedAt: price.observedAt,
      ageDays: Math.floor(
        (now.getTime() - Date.parse(price.observedAt)) / 86_400_000,
      ),
      quality: quality?.score ?? null,
      reviewCount: quality?.reviewCount ?? 0,
      memberLocked: price.isMemberPrice && members !== null && !members.has(store.retailerId),
    })
  }

  const ranked = cheapestFirst(options, (o) => o.normalized)
  const usable = ranked.filter((o) => !o.memberLocked)

  return {
    scanned,
    conceptName: concept.name,
    dimension: concept.dimension,
    options: ranked,
    cheapest: usable[0] ?? null,
    bestValue: bestByValue(usable, qualityWeight),
  }
}

function optionKey(price: CurrentPrice): string {
  return `${price.packageId}:${price.storeId}:${price.isMemberPrice ? 'member' : 'public'}`
}

/** The minimum an option must expose to be ranked on cost versus quality. */
export interface Valuable {
  normalized: NormalizedPrice
  /** Review sentiment 0..1, or null when nothing has reviewed it. */
  quality: number | null
}

/** Quality assumed for an unreviewed option: neutral, not bad. */
export const NEUTRAL_QUALITY = 0.5

/**
 * Score each option on cheapness and quality, both rescaled to 0..1 across the
 * candidate set, then take the weighted best.
 *
 * Rescaling is what makes the two comparable at all -- cents per gram and a
 * sentiment score share no units. It also means the score is only meaningful
 * *within* one candidate set; it is not a rating you can carry between
 * products, and it must never be shown to a user as one.
 *
 * An option with no reviews scores as neutral rather than as bad, so an
 * unreviewed store brand is not punished for being new to the catalog.
 */
export function bestByValue<T extends Valuable>(
  options: readonly T[],
  qualityWeight: number,
): T | null {
  if (options.length === 0) return null
  if (options.length === 1) return options[0]

  const perUnits = options.map((o) => o.normalized.perUnit)
  const minPrice = Math.min(...perUnits)
  const maxPrice = Math.max(...perUnits)
  const priceSpread = maxPrice - minPrice

  let best = options[0]
  let bestScore = -Infinity

  for (const option of options) {
    // 1 for the cheapest option, 0 for the priciest. A flat set scores 1 so
    // quality decides outright.
    const cheapness =
      priceSpread === 0 ? 1 : (maxPrice - option.normalized.perUnit) / priceSpread
    const quality = option.quality ?? NEUTRAL_QUALITY
    const score = qualityWeight * quality + (1 - qualityWeight) * cheapness

    // Ties are routine -- the same package at two prices scores identically
    // whenever quality dominates -- so settle them on price rather than on
    // whichever row the database happened to return first.
    const tied = Math.abs(score - bestScore) < 1e-9
    if (tied ? option.normalized.perUnit < best.normalized.perUnit : score > bestScore) {
      bestScore = score
      best = option
    }
  }

  return best
}

const DOLLARS = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Cents to a display string: 429 -> "$4.29", 226047 -> "$2,260.47". */
export function formatCents(cents: number): string {
  return `$${DOLLARS.format(cents / 100)}`
}

/**
 * Per-unit price for display. Canonical units are too small to read as money --
 * "$0.0067/g" tells a shopper nothing -- so mass and volume are shown per 100.
 */
export function formatPerUnit(price: NormalizedPrice): string {
  if (price.dimension === 'count') {
    return `${formatCents(price.perUnit)} each`
  }
  return `${formatCents(price.perUnit * 100)} / 100 ${price.unit}`
}

/** The unit a US shelf tag quotes, per dimension. */
const SHELF_UNIT: Record<Dimension, { label: string; canonicalAmount: number }> = {
  mass: { label: 'oz', canonicalAmount: toCanonical(1, 'oz') },
  volume: { label: 'fl oz', canonicalAmount: toCanonical(1, 'floz') },
  count: { label: 'each', canonicalAmount: 1 },
}

/**
 * Per-unit price the way a US shelf tag prints it: "14.0¢" per oz, "$1.08"
 * per fl oz. Display only; ranking always uses the canonical `perUnit`.
 */
export function shelfUnitPrice(price: NormalizedPrice): { amount: string; unit: string } {
  const { label, canonicalAmount } = SHELF_UNIT[price.dimension]
  const cents = price.perUnit * canonicalAmount
  const amount = cents < 100 ? `${cents.toFixed(1)}¢` : formatCents(cents)
  return { amount, unit: label }
}

export function formatShelfUnit(price: NormalizedPrice): string {
  const { amount, unit } = shelfUnitPrice(price)
  return unit === 'each' ? `${amount} each` : `${amount}/${unit}`
}

/** "Heinz Tomato Ketchup, 64 oz" -> "64 oz". */
export function packageSize(pkg: Package): string {
  const unit = pkg.unit === 'floz' ? 'fl oz' : pkg.unit
  return `${pkg.size} ${unit}`
}

/** The facts behind a recommendation, for a one-line "why". */
export interface PickReason {
  /** How much less per unit the pick costs than the yardstick, 0..100. */
  percentLess: number
  /** What the pick is measured against. */
  versus: { kind: 'scanned'; option: CompareOption } | { kind: 'typical' }
  /** Review sentiment as stars out of five, or null when unreviewed. */
  stars: number | null
}

/**
 * Why the best-value pick won. When it is a different package from the one
 * scanned, it is measured against the scanned package's best usable price --
 * the decision the shopper was about to make. Otherwise against the median
 * usable price per unit.
 */
export function explainPick(comparison: Comparison): PickReason | null {
  const pick = comparison.bestValue
  if (!pick) return null
  const usable = comparison.options.filter((o) => !o.memberLocked)

  const scannedBest = usable.find((o) => o.pkg.id === comparison.scanned.id)
  let yardstick: number
  let versus: PickReason['versus']
  if (pick.pkg.id !== comparison.scanned.id && scannedBest) {
    yardstick = scannedBest.normalized.perUnit
    versus = { kind: 'scanned', option: scannedBest }
  } else {
    const sorted = usable.map((o) => o.normalized.perUnit).sort((a, b) => a - b)
    yardstick = sorted[Math.floor((sorted.length - 1) / 2)]
    versus = { kind: 'typical' }
  }

  const percentLess =
    yardstick > 0 ? Math.max(0, Math.round((1 - pick.normalized.perUnit / yardstick) * 100)) : 0

  return {
    percentLess,
    versus,
    stars: pick.quality === null ? null : Math.round(pick.quality * 50) / 10,
  }
}

export function isStale(option: CompareOption): boolean {
  return option.ageDays > STALE_AFTER_DAYS
}

export function formatAge(ageDays: number): string {
  if (ageDays <= 0) return 'today'
  if (ageDays === 1) return 'yesterday'
  return `${ageDays} days ago`
}
