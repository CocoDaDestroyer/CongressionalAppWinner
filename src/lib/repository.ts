/**
 * The data boundary. Everything above this line is written against
 * `CatalogRepository`, never against seed arrays or a Supabase client, so the
 * in-memory implementation can be swapped for a real one without touching
 * comparison logic or UI.
 */
import type {
  Brand,
  Package,
  PriceObservation,
  PriceSource,
  ProductConcept,
  QualityScore,
  Retailer,
  Store,
} from './catalog'
import { SOURCE_TRUST } from './catalog'

/** One row of the `current_prices` view. */
export interface CurrentPrice {
  packageId: string
  storeId: string
  isMemberPrice: boolean
  priceCents: number
  source: PriceSource
  observedAt: string
}

export interface CatalogRepository {
  getConcepts(): ProductConcept[]
  getPackage(packageId: string): Package | undefined
  /** Resolve a scanned barcode. Undefined when the GTIN is not in the catalog. */
  getPackageByGtin(gtin: string): Package | undefined
  /** Every package of the same concept -- the sibling brands and sizes. */
  getSiblingPackages(conceptId: string): Package[]
  getBrand(brandId: string | null): Brand | undefined
  getStore(storeId: string): Store | undefined
  getRetailer(retailerId: string): Retailer | undefined
  getQuality(packageId: string): QualityScore | undefined
  /** Current price per (package, store, member/public) for the given packages. */
  getCurrentPrices(packageIds: readonly string[]): CurrentPrice[]
}

/**
 * Collapse the append-only observation log to one current price per
 * (package, store, member/public).
 *
 * Mirrors the `current_prices` view: newest observation wins, and a tie on
 * timestamp is broken toward the more trustworthy source. Ties are common
 * because receipt OCR and scrapes both often resolve only to a date.
 */
export function toCurrentPrices(
  observations: readonly PriceObservation[],
): CurrentPrice[] {
  const best = new Map<string, PriceObservation>()

  for (const o of observations) {
    const key = `${o.packageId} ${o.storeId} ${o.isMemberPrice}`
    const incumbent = best.get(key)
    if (!incumbent || supersedes(o, incumbent)) best.set(key, o)
  }

  return [...best.values()].map((o) => ({
    packageId: o.packageId,
    storeId: o.storeId,
    isMemberPrice: o.isMemberPrice,
    priceCents: o.priceCents,
    source: o.source,
    observedAt: o.observedAt,
  }))
}

function supersedes(candidate: PriceObservation, incumbent: PriceObservation): boolean {
  const delta = Date.parse(candidate.observedAt) - Date.parse(incumbent.observedAt)
  if (delta !== 0) return delta > 0
  return SOURCE_TRUST[candidate.source] > SOURCE_TRUST[incumbent.source]
}

export interface InMemoryData {
  brands: readonly Brand[]
  concepts: readonly ProductConcept[]
  packages: readonly Package[]
  retailers: readonly Retailer[]
  stores: readonly Store[]
  qualityScores: readonly QualityScore[]
  priceObservations: readonly PriceObservation[]
}

export function createInMemoryRepository(data: InMemoryData): CatalogRepository {
  const byId = <T extends { id: string }>(rows: readonly T[]) =>
    new Map(rows.map((r) => [r.id, r]))

  const packages = byId(data.packages)
  const brands = byId(data.brands)
  const stores = byId(data.stores)
  const retailers = byId(data.retailers)
  const quality = new Map(data.qualityScores.map((q) => [q.packageId, q]))
  const byGtin = new Map(
    data.packages.filter((p) => p.gtin).map((p) => [p.gtin as string, p]),
  )
  const current = toCurrentPrices(data.priceObservations)

  return {
    getConcepts: () => [...data.concepts],
    getPackage: (id) => packages.get(id),
    getPackageByGtin: (gtin) => byGtin.get(gtin),
    getSiblingPackages: (conceptId) =>
      data.packages.filter((p) => p.conceptId === conceptId),
    getBrand: (id) => (id ? brands.get(id) : undefined),
    getStore: (id) => stores.get(id),
    getRetailer: (id) => retailers.get(id),
    getQuality: (id) => quality.get(id),
    getCurrentPrices: (packageIds) => {
      const wanted = new Set(packageIds)
      return current.filter((p) => wanted.has(p.packageId))
    },
  }
}
