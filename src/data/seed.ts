/**
 * Local seed data, standing in for a Supabase project.
 *
 * Everything here is fabricated but shaped exactly like the real tables, so the
 * comparison logic and UI can be built and checked with no backend, no hosting,
 * and no cost. Swap the repository implementation, not this file's consumers,
 * when a real database exists.
 *
 * The data is chosen to exercise the cases that matter:
 *   - a big package that wins on per-unit price while losing on sticker price
 *   - a store-brand option that is cheapest but lowest rated
 *   - member pricing that beats public pricing at the same store
 *   - a stale user report sitting alongside a fresh scrape
 *   - a cheap store far enough away that the drive can cancel the savings
 *
 * Tests assert on these properties. Preserve them when editing.
 */
import type {
  Brand,
  Package,
  PriceObservation,
  ProductConcept,
  QualityScore,
  Retailer,
  Store,
} from '../lib/catalog'

/** Fixed "now" for the seed so staleness in the UI stays stable while developing. */
export const SEED_NOW = new Date('2026-08-21T12:00:00Z')

const daysAgo = (n: number) =>
  new Date(SEED_NOW.getTime() - n * 86_400_000).toISOString()

/** Where the shopper starts and ends a trip. Westwood, Los Angeles. */
export const SEED_HOME = { latitude: 34.0635, longitude: -118.4455 }

export const brands: Brand[] = [
  { id: 'b-heinz', name: 'Heinz' },
  { id: 'b-hunts', name: "Hunt's" },
  { id: 'b-kroger', name: 'Kroger' },
  { id: 'b-bertolli', name: 'Bertolli' },
  { id: 'b-365', name: '365 by Whole Foods' },
  { id: 'b-lucerne', name: 'Lucerne' },
  { id: 'b-horizon', name: 'Horizon Organic' },
  { id: 'b-nishiki', name: 'Nishiki' },
]

export const concepts: ProductConcept[] = [
  { id: 'c-ketchup', name: 'Ketchup', category: 'condiments', dimension: 'mass' },
  { id: 'c-olive-oil', name: 'Olive oil', category: 'pantry', dimension: 'volume' },
  { id: 'c-eggs', name: 'Eggs', category: 'dairy', dimension: 'count' },
  { id: 'c-milk', name: 'Milk', category: 'dairy', dimension: 'volume' },
  { id: 'c-rice', name: 'Rice', category: 'pantry', dimension: 'mass' },
]

export const packages: Package[] = [
  // Ketchup -- the per-unit story. The 64 oz costs the most and wins per gram.
  {
    id: 'p-heinz-20',
    conceptId: 'c-ketchup',
    brandId: 'b-heinz',
    gtin: '00013000006200',
    displayName: 'Heinz Tomato Ketchup, 20 oz',
    size: 20,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(60),
  },
  {
    id: 'p-heinz-64',
    conceptId: 'c-ketchup',
    brandId: 'b-heinz',
    gtin: '00013000006415',
    displayName: 'Heinz Tomato Ketchup, 64 oz',
    size: 64,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(60),
  },
  {
    id: 'p-hunts-32',
    conceptId: 'c-ketchup',
    brandId: 'b-hunts',
    gtin: '00027000389119',
    displayName: "Hunt's Tomato Ketchup, 32 oz",
    size: 32,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(40),
  },
  {
    id: 'p-kroger-20',
    conceptId: 'c-ketchup',
    brandId: 'b-kroger',
    gtin: '00011110042859',
    displayName: 'Kroger Tomato Ketchup, 20 oz',
    size: 20,
    unit: 'oz',
    packCount: null,
    // Never verified: added by a user, still unconfirmed.
    verifiedAt: null,
  },

  // Olive oil -- a second dimension, so the UI has to keep them apart.
  {
    id: 'p-bertolli-500',
    conceptId: 'c-olive-oil',
    brandId: 'b-bertolli',
    gtin: '00036000280500',
    displayName: 'Bertolli Extra Virgin Olive Oil, 500 ml',
    size: 500,
    unit: 'ml',
    packCount: null,
    verifiedAt: daysAgo(90),
  },
  {
    id: 'p-365-1l',
    conceptId: 'c-olive-oil',
    brandId: 'b-365',
    gtin: '00099482434359',
    displayName: '365 Extra Virgin Olive Oil, 1 L',
    size: 1,
    unit: 'l',
    packCount: null,
    verifiedAt: daysAgo(30),
  },

  // Eggs -- the count dimension, where per-unit means per egg.
  {
    id: 'p-lucerne-12',
    conceptId: 'c-eggs',
    brandId: 'b-lucerne',
    gtin: '00021130098767',
    displayName: 'Lucerne Grade A Large Eggs, 12 ct',
    size: 12,
    unit: 'ct',
    packCount: 12,
    verifiedAt: daysAgo(20),
  },
  {
    id: 'p-kroger-eggs-18',
    conceptId: 'c-eggs',
    brandId: 'b-kroger',
    gtin: '00011110877543',
    displayName: 'Kroger Grade A Large Eggs, 18 ct',
    size: 18,
    unit: 'ct',
    packCount: 18,
    verifiedAt: daysAgo(20),
  },

  // Milk.
  {
    id: 'p-horizon-half-gal',
    conceptId: 'c-milk',
    brandId: 'b-horizon',
    gtin: '00742365236013',
    displayName: 'Horizon Organic Whole Milk, 1/2 gal',
    size: 0.5,
    unit: 'gal',
    packCount: null,
    verifiedAt: daysAgo(15),
  },
  {
    id: 'p-kroger-milk-gal',
    conceptId: 'c-milk',
    brandId: 'b-kroger',
    gtin: '00011110896544',
    displayName: 'Kroger Whole Milk, 1 gal',
    size: 1,
    unit: 'gal',
    packCount: null,
    verifiedAt: daysAgo(15),
  },

  // Rice.
  {
    id: 'p-nishiki-5lb',
    conceptId: 'c-rice',
    brandId: 'b-nishiki',
    gtin: '00011152110509',
    displayName: 'Nishiki Medium Grain Rice, 5 lb',
    size: 5,
    unit: 'lb',
    packCount: null,
    verifiedAt: daysAgo(25),
  },
  {
    id: 'p-kroger-rice-2lb',
    conceptId: 'c-rice',
    brandId: 'b-kroger',
    gtin: '00011110665201',
    displayName: 'Kroger Long Grain Rice, 2 lb',
    size: 2,
    unit: 'lb',
    packCount: null,
    verifiedAt: daysAgo(25),
  },
]

export const retailers: Retailer[] = [
  { id: 'r-ralphs', name: 'Ralphs', supportsLoyalty: true },
  { id: 'r-target', name: 'Target', supportsLoyalty: true },
  { id: 'r-wholefoods', name: 'Whole Foods', supportsLoyalty: false },
]

export const stores: Store[] = [
  {
    id: 's-ralphs-westwood',
    retailerId: 'r-ralphs',
    address: '10861 Weyburn Ave, Los Angeles, CA',
    latitude: 34.0625,
    longitude: -118.4453,
  },
  {
    id: 's-target-westwood',
    retailerId: 'r-target',
    address: '10861 Weyburn Ave, Los Angeles, CA',
    latitude: 34.0601,
    longitude: -118.4432,
  },
  {
    id: 's-wf-westwood',
    retailerId: 'r-wholefoods',
    address: '1050 Gayley Ave, Los Angeles, CA',
    latitude: 34.0608,
    longitude: -118.4478,
  },
  // Roughly five miles south-west. Cheaper across the board, which is exactly
  // the case the trip optimizer has to weigh against the drive.
  {
    id: 's-ralphs-santa-monica',
    retailerId: 'r-ralphs',
    address: '1644 Cloverfield Blvd, Santa Monica, CA',
    latitude: 34.0195,
    longitude: -118.4912,
  },
]

export const qualityScores: QualityScore[] = [
  { packageId: 'p-heinz-20', score: 0.91, reviewCount: 4820 },
  { packageId: 'p-heinz-64', score: 0.9, reviewCount: 1203 },
  { packageId: 'p-hunts-32', score: 0.82, reviewCount: 2140 },
  // Cheapest per unit, but noticeably worse reviewed -- the case the
  // cost-versus-quality ranking exists to handle.
  { packageId: 'p-kroger-20', score: 0.58, reviewCount: 312 },
  { packageId: 'p-bertolli-500', score: 0.74, reviewCount: 980 },
  { packageId: 'p-365-1l', score: 0.86, reviewCount: 1540 },
  { packageId: 'p-lucerne-12', score: 0.79, reviewCount: 640 },
  { packageId: 'p-kroger-eggs-18', score: 0.71, reviewCount: 890 },
  { packageId: 'p-horizon-half-gal', score: 0.88, reviewCount: 2310 },
  { packageId: 'p-kroger-milk-gal', score: 0.7, reviewCount: 1120 },
  { packageId: 'p-nishiki-5lb', score: 0.92, reviewCount: 3400 },
  // Deliberately unreviewed, to check that "no reviews" scores as neutral
  // rather than as bad.
  // p-kroger-rice-2lb has no entry.
]

let obsSeq = 0
const obs = (
  packageId: string,
  storeId: string,
  priceCents: number,
  source: PriceObservation['source'],
  ageDays: number,
  isMemberPrice = false,
): PriceObservation => ({
  id: `o-${++obsSeq}`,
  packageId,
  storeId,
  priceCents,
  isMemberPrice,
  source,
  observedAt: daysAgo(ageDays),
})

export const priceObservations: PriceObservation[] = [
  // -- Ketchup at Ralphs Westwood. Note the superseded older scrape on the
  //    20 oz: the current-price view must pick the newer one.
  obs('p-heinz-20', 's-ralphs-westwood', 449, 'scrape', 30),
  obs('p-heinz-20', 's-ralphs-westwood', 429, 'scrape', 2),
  obs('p-heinz-20', 's-ralphs-westwood', 349, 'loyalty_sync', 2, true),
  obs('p-heinz-64', 's-ralphs-westwood', 899, 'scrape', 2),
  obs('p-hunts-32', 's-ralphs-westwood', 529, 'scrape', 3),
  obs('p-kroger-20', 's-ralphs-westwood', 279, 'user_report', 45),

  // -- Ketchup at Target Westwood.
  obs('p-heinz-20', 's-target-westwood', 399, 'scrape', 1),
  obs('p-heinz-64', 's-target-westwood', 949, 'receipt', 6),
  obs('p-hunts-32', 's-target-westwood', 499, 'scrape', 1),

  // -- Ketchup in Santa Monica.
  obs('p-heinz-20', 's-ralphs-santa-monica', 419, 'scrape', 2),
  obs('p-hunts-32', 's-ralphs-santa-monica', 509, 'scrape', 2),

  // -- Olive oil.
  obs('p-bertolli-500', 's-ralphs-westwood', 1099, 'scrape', 4),
  obs('p-bertolli-500', 's-target-westwood', 1049, 'scrape', 1),
  obs('p-bertolli-500', 's-ralphs-santa-monica', 999, 'scrape', 2),
  obs('p-365-1l', 's-wf-westwood', 1799, 'scrape', 2),
  obs('p-365-1l', 's-wf-westwood', 1599, 'receipt', 1),

  // -- Eggs. Santa Monica is the cheap outlier.
  obs('p-lucerne-12', 's-ralphs-westwood', 549, 'scrape', 2),
  obs('p-lucerne-12', 's-target-westwood', 529, 'scrape', 1),
  obs('p-lucerne-12', 's-ralphs-santa-monica', 449, 'scrape', 2),
  obs('p-kroger-eggs-18', 's-ralphs-westwood', 699, 'scrape', 2),
  obs('p-kroger-eggs-18', 's-ralphs-santa-monica', 579, 'scrape', 2),

  // -- Milk.
  obs('p-horizon-half-gal', 's-ralphs-westwood', 649, 'scrape', 2),
  obs('p-horizon-half-gal', 's-wf-westwood', 599, 'scrape', 2),
  obs('p-horizon-half-gal', 's-ralphs-santa-monica', 549, 'scrape', 2),
  obs('p-kroger-milk-gal', 's-ralphs-westwood', 479, 'scrape', 2),
  obs('p-kroger-milk-gal', 's-ralphs-santa-monica', 399, 'scrape', 2),

  // -- Rice.
  obs('p-nishiki-5lb', 's-ralphs-westwood', 899, 'scrape', 3),
  obs('p-nishiki-5lb', 's-target-westwood', 949, 'scrape', 1),
  obs('p-nishiki-5lb', 's-ralphs-santa-monica', 749, 'scrape', 2),
  obs('p-kroger-rice-2lb', 's-ralphs-westwood', 429, 'scrape', 3),
  obs('p-kroger-rice-2lb', 's-ralphs-santa-monica', 379, 'scrape', 2),
]
