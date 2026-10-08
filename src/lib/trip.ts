/**
 * Shopping-list optimization: given a list, decide which stores to visit and
 * what to buy at each, counting the drive against the savings.
 *
 * The naive answer -- buy every item wherever it is cheapest -- is wrong,
 * because it happily sends a shopper across town to save forty cents. The
 * objective here is the total a trip actually costs: groceries plus fuel for
 * the round trip.
 *
 * Method: enumerate every subset of stores up to `maxStores`. Within a subset
 * each item independently picks its best option (there is no interaction
 * between items once the store set is fixed, so per-item greedy is exact).
 * Route the subset with a brute-forced shortest round trip and add the driving
 * cost. Keep the cheapest total.
 *
 * That is exponential in the number of stores, which is affordable only because
 * a shopper considers a handful of nearby stores; `maxStores` and
 * `MAX_CANDIDATE_STORES` keep it honest.
 */
import { bestByValue, formatCents, type Valuable } from './compare'
import { storeLabel } from './labels'
import type { Package, Store } from './catalog'
import {
  DEFAULT_DRIVING_COST,
  drivingCostCents,
  shortestRoundTrip,
  type DrivingCostModel,
  type LatLng,
} from './geo'
import type { CatalogRepository } from './repository'
import { normalize, type NormalizedPrice } from './units'

export interface ListItem {
  conceptId: string
  /** How many packages to buy. */
  quantity: number
}

export interface PurchaseOption extends Valuable {
  conceptId: string
  pkg: Package
  store: Store
  retailerName: string
  priceCents: number
  isMemberPrice: boolean
  normalized: NormalizedPrice
  quality: number | null
}

export interface Purchase {
  conceptId: string
  conceptName: string
  quantity: number
  option: PurchaseOption
  /** `priceCents * quantity`. */
  lineTotalCents: number
}

export interface TripPlan {
  stores: Store[]
  /** Visiting order from home and back, excluding home itself. */
  routeOrder: Store[]
  purchases: Purchase[]
  /** Items on the list that nothing in range sells. */
  unavailable: string[]
  groceryCents: number
  miles: number
  drivingCents: number
  /** `groceryCents + drivingCents` -- the number being minimized. */
  totalCents: number
}

export interface TripComparison {
  best: TripPlan
  /** Best plan restricted to a single store, for "was one stop cheaper?". */
  bestSingleStore: TripPlan | null
  /**
   * Every item at its absolute cheapest store, ignoring the drive. This is the
   * tempting-but-wrong plan, kept so the UI can show what it actually costs.
   */
  ignoringTravel: TripPlan | null
}

/** Above this, subset enumeration stops being affordable. */
export const MAX_CANDIDATE_STORES = 12

export interface OptimizeOptions {
  home: LatLng
  /** Most stores the shopper is willing to visit in one trip. */
  maxStores?: number
  /** Passed through to the per-item value ranking. */
  qualityWeight?: number
  drivingCost?: DrivingCostModel
  /** Retailers whose member pricing the shopper can actually use. */
  memberRetailerIds?: readonly string[]
}

export function optimizeTrip(
  repo: CatalogRepository,
  list: readonly ListItem[],
  {
    home,
    maxStores = 3,
    qualityWeight = 0.5,
    drivingCost = DEFAULT_DRIVING_COST,
    memberRetailerIds = [],
  }: OptimizeOptions,
): TripComparison | null {
  const items = list.filter((i) => i.quantity > 0)
  if (items.length === 0) return null

  const members = new Set(memberRetailerIds)
  const optionsByConcept = new Map<string, PurchaseOption[]>()

  for (const item of items) {
    optionsByConcept.set(item.conceptId, collectOptions(repo, item.conceptId, members))
  }

  // Only stores that actually stock something on the list are worth routing to.
  const candidateStores = dedupeById(
    [...optionsByConcept.values()].flat().map((o) => o.store),
  )
  if (candidateStores.length > MAX_CANDIDATE_STORES) {
    throw new RangeError(
      `optimizeTrip enumerates store subsets and cannot handle ${candidateStores.length} ` +
        `candidate stores (limit ${MAX_CANDIDATE_STORES}); filter by distance first`,
    )
  }

  const build = (stores: readonly Store[]) =>
    buildPlan(repo, items, optionsByConcept, stores, home, qualityWeight, drivingCost)

  let best: TripPlan | null = null
  let bestSingleStore: TripPlan | null = null

  for (const subset of subsetsUpTo(candidateStores, maxStores)) {
    if (subset.length === 0) continue
    const plan = build(subset)
    // A subset whose stores are not all used is dominated by the smaller subset
    // that drops the unused ones, so skip it rather than reporting a pointless stop.
    if (plan.stores.length !== subset.length) continue

    if (isBetterPlan(plan, best)) best = plan
    if (subset.length === 1 && isBetterPlan(plan, bestSingleStore)) {
      bestSingleStore = plan
    }
  }

  if (!best) return null

  return {
    best,
    bestSingleStore,
    ignoringTravel: build(candidateStores),
  }
}

/**
 * Fewest missing items first, then cheapest.
 *
 * Getting this backwards makes the planner prefer a store set that quietly
 * fails to buy half the list, because everything it skips is free.
 */
function isBetterPlan(candidate: TripPlan, incumbent: TripPlan | null): boolean {
  if (!incumbent) return true
  if (candidate.unavailable.length !== incumbent.unavailable.length) {
    return candidate.unavailable.length < incumbent.unavailable.length
  }
  return candidate.totalCents < incumbent.totalCents
}

/** Every purchasable option for a concept, across packages and stores. */
function collectOptions(
  repo: CatalogRepository,
  conceptId: string,
  members: ReadonlySet<string>,
): PurchaseOption[] {
  const packages = repo.getSiblingPackages(conceptId)
  const prices = repo.getCurrentPrices(packages.map((p) => p.id))
  const byId = new Map(packages.map((p) => [p.id, p]))

  const options: PurchaseOption[] = []
  for (const price of prices) {
    const pkg = byId.get(price.packageId)
    const store = repo.getStore(price.storeId)
    if (!pkg || !store) continue

    // A member price the shopper cannot use is not an option for them.
    if (price.isMemberPrice && !members.has(store.retailerId)) continue

    options.push({
      conceptId,
      pkg,
      store,
      retailerName: repo.getRetailer(store.retailerId)?.name ?? 'Unknown store',
      priceCents: price.priceCents,
      isMemberPrice: price.isMemberPrice,
      normalized: normalize(price.priceCents, pkg.size, pkg.unit),
      quality: repo.getQuality(pkg.id)?.score ?? null,
    })
  }
  return options
}

function buildPlan(
  repo: CatalogRepository,
  items: readonly ListItem[],
  optionsByConcept: ReadonlyMap<string, PurchaseOption[]>,
  stores: readonly Store[],
  home: LatLng,
  qualityWeight: number,
  drivingCost: DrivingCostModel,
): TripPlan {
  const allowed = new Set(stores.map((s) => s.id))
  const concepts = repo.getConcepts()

  const purchases: Purchase[] = []
  const unavailable: string[] = []

  for (const item of items) {
    const available = (optionsByConcept.get(item.conceptId) ?? []).filter((o) =>
      allowed.has(o.store.id),
    )
    const conceptName =
      concepts.find((c) => c.id === item.conceptId)?.name ?? item.conceptId

    const chosen = bestByValue(available, qualityWeight)
    if (!chosen) {
      unavailable.push(conceptName)
      continue
    }

    purchases.push({
      conceptId: item.conceptId,
      conceptName,
      quantity: item.quantity,
      option: chosen,
      lineTotalCents: chosen.priceCents * item.quantity,
    })
  }

  // Only stores something is actually bought at get visited.
  const visitedIds = new Set(purchases.map((p) => p.option.store.id))
  const visited = stores.filter((s) => visitedIds.has(s.id))

  const route = shortestRoundTrip(home, visited)
  const groceryCents = purchases.reduce((sum, p) => sum + p.lineTotalCents, 0)
  const drivingCents = drivingCostCents(route.miles, drivingCost)

  return {
    stores: visited,
    routeOrder: route.order,
    purchases,
    unavailable,
    groceryCents,
    miles: route.miles,
    drivingCents,
    totalCents: groceryCents + drivingCents,
  }
}

function dedupeById<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...new Map(rows.map((r) => [r.id, r])).values()]
}

/** All subsets of `items` with size 1..maxSize. */
function* subsetsUpTo<T>(items: readonly T[], maxSize: number): Generator<T[]> {
  const n = items.length
  for (let mask = 1; mask < 1 << n; mask++) {
    const subset: T[] = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(items[i])
    }
    if (subset.length <= maxSize) yield subset
  }
}

export function formatMiles(miles: number): string {
  return `${miles.toFixed(1)} mi`
}

/** The plan as plain text, for sharing: stops in order, what to buy, and the bottom line. */
export function tripSummaryText(
  repo: CatalogRepository,
  { best, bestSingleStore }: TripComparison,
): string {
  const lines = ['My CartWise trip plan']
  best.routeOrder.forEach((store, index) => {
    lines.push('', `${index + 1}. ${storeLabel(repo, store)}`)
    for (const p of best.purchases.filter((q) => q.option.store.id === store.id)) {
      lines.push(`   ${p.quantity}x ${p.option.pkg.displayName} - ${formatCents(p.lineTotalCents)}`)
    }
  })
  lines.push(
    '',
    `Total ${formatCents(best.totalCents)} (${formatCents(best.groceryCents)} groceries + ${formatCents(best.drivingCents)} fuel, ${formatMiles(best.miles)})`,
  )
  const saved = bestSingleStore ? bestSingleStore.totalCents - best.totalCents : 0
  if (saved >= 1) lines.push(`Saves ${formatCents(saved)} vs. shopping at one store.`)
  return lines.join('\n')
}
