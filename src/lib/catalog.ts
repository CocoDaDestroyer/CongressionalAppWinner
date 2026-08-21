/**
 * Types mirroring supabase/migrations/0001_core_catalog_and_prices.sql.
 *
 * Kept hand-written for now. Once a Supabase project exists these should be
 * replaced by `supabase gen types typescript`, and any drift between this file
 * and the migration becomes a bug in this file.
 */
import type { Dimension, Unit } from './units'

export interface Brand {
  id: string
  name: string
}

/** What a shopper means by "ketchup". Comparison happens at this level. */
export interface ProductConcept {
  id: string
  name: string
  category: string
  dimension: Dimension
}

/** A specific sellable package; this is what a barcode resolves to. */
export interface Package {
  id: string
  conceptId: string
  brandId: string | null
  /** GTIN-14, zero-padded. Null for loose goods that carry no barcode. */
  gtin: string | null
  displayName: string
  /** Total sellable amount: a 6-pack of 12 floz cans is 72, not 6. */
  size: number
  unit: Unit
  packCount: number | null
  verifiedAt: string | null
}

export interface Retailer {
  id: string
  name: string
  supportsLoyalty: boolean
}

export interface Store {
  id: string
  retailerId: string
  address: string
  latitude: number
  longitude: number
}

/**
 * Ordered by trust. Ranking prefers the freshest observation and breaks
 * near-ties toward the more trustworthy source.
 */
export type PriceSource = 'scrape' | 'loyalty_sync' | 'receipt_ocr' | 'user_report'

export const SOURCE_TRUST: Record<PriceSource, number> = {
  scrape: 4,
  loyalty_sync: 3,
  receipt_ocr: 2,
  user_report: 1,
}

export const SOURCE_LABEL: Record<PriceSource, string> = {
  scrape: 'store website',
  loyalty_sync: 'member account',
  receipt_ocr: 'receipt photo',
  user_report: 'user reported',
}

export interface PriceObservation {
  id: string
  packageId: string
  storeId: string
  priceCents: number
  isMemberPrice: boolean
  source: PriceSource
  /** ISO timestamp of when the price was seen, not when it was recorded. */
  observedAt: string
}

/**
 * Aggregated review sentiment for a package, 0..1.
 *
 * Placeholder input: nothing computes these yet. They exist so the cost-versus
 * -quality ranking can be built and checked before review ingestion lands.
 */
export interface QualityScore {
  packageId: string
  score: number
  reviewCount: number
}
