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
 *   - member prices at two chains, so linking a store card visibly changes plans
 *   - six months of receipt history, all older than every seeded price for the
 *     same package and store, so history feeds Spending without overriding
 *     anything Compare or Trip shows
 *
 * Tests assert on these properties. Preserve them when editing.
 */
import type {
  Brand,
  Receipt,
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
  { id: 'b-daves', name: "Dave's Killer Bread" },
  { id: 'b-fosterfarms', name: 'Foster Farms' },
  { id: 'b-barilla', name: 'Barilla' },
  { id: 'b-goodgather', name: 'Good & Gather' },
  { id: 'b-peets', name: "Peet's Coffee" },
  { id: 'b-chobani', name: 'Chobani' },
]

export const concepts: ProductConcept[] = [
  { id: 'c-ketchup', name: 'Ketchup', category: 'condiments', dimension: 'mass' },
  { id: 'c-olive-oil', name: 'Olive oil', category: 'pantry', dimension: 'volume' },
  { id: 'c-eggs', name: 'Eggs', category: 'dairy', dimension: 'count' },
  { id: 'c-milk', name: 'Milk', category: 'dairy', dimension: 'volume' },
  { id: 'c-rice', name: 'Rice', category: 'pantry', dimension: 'mass' },
  { id: 'c-bread', name: 'Bread', category: 'bakery', dimension: 'mass' },
  { id: 'c-bananas', name: 'Bananas', category: 'produce', dimension: 'mass' },
  { id: 'c-chicken', name: 'Chicken breast', category: 'meat', dimension: 'mass' },
  { id: 'c-pasta', name: 'Pasta', category: 'pantry', dimension: 'mass' },
  { id: 'c-coffee', name: 'Ground coffee', category: 'pantry', dimension: 'mass' },
  { id: 'c-yogurt', name: 'Greek yogurt', category: 'dairy', dimension: 'mass' },
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

  // Everyday staples, so receipts and spending look like a real weekly shop.
  {
    id: 'p-daves-27',
    conceptId: 'c-bread',
    brandId: 'b-daves',
    gtin: '00013764027206',
    displayName: "Dave's Killer Bread 21 Whole Grains, 27 oz",
    size: 27,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-kroger-bread-20',
    conceptId: 'c-bread',
    brandId: 'b-kroger',
    gtin: '00011110857842',
    displayName: 'Kroger Whole Wheat Bread, 20 oz',
    size: 20,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-bananas-lb',
    conceptId: 'c-bananas',
    brandId: null,
    // Loose produce carries no barcode.
    gtin: null,
    displayName: 'Bananas, per lb',
    size: 1,
    unit: 'lb',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-fosterfarms-chicken',
    conceptId: 'c-chicken',
    brandId: 'b-fosterfarms',
    gtin: '00075221061525',
    displayName: 'Foster Farms Chicken Breast, 2.5 lb',
    size: 2.5,
    unit: 'lb',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-365-chicken',
    conceptId: 'c-chicken',
    brandId: 'b-365',
    gtin: '00099482467203',
    displayName: '365 Organic Chicken Breast, 1.5 lb',
    size: 1.5,
    unit: 'lb',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-barilla-16',
    conceptId: 'c-pasta',
    brandId: 'b-barilla',
    gtin: '00076808280739',
    displayName: 'Barilla Spaghetti, 16 oz',
    size: 16,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-goodgather-pasta-16',
    conceptId: 'c-pasta',
    brandId: 'b-goodgather',
    gtin: '00085239017746',
    displayName: 'Good & Gather Spaghetti, 16 oz',
    size: 16,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-peets-10',
    conceptId: 'c-coffee',
    brandId: 'b-peets',
    gtin: '00078804001052',
    displayName: "Peet's Major Dickason's Ground Coffee, 10.5 oz",
    size: 10.5,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(30),
  },
  {
    id: 'p-chobani-32',
    conceptId: 'c-yogurt',
    brandId: 'b-chobani',
    gtin: '00818290012111',
    displayName: 'Chobani Plain Greek Yogurt, 32 oz',
    size: 32,
    unit: 'oz',
    packCount: null,
    verifiedAt: daysAgo(30),
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
    area: 'Westwood',
    retailerId: 'r-ralphs',
    address: '10861 Weyburn Ave, Los Angeles, CA',
    latitude: 34.0625,
    longitude: -118.4453,
  },
  {
    id: 's-target-westwood',
    area: 'Westwood',
    retailerId: 'r-target',
    address: '10861 Weyburn Ave, Los Angeles, CA',
    latitude: 34.0601,
    longitude: -118.4432,
  },
  {
    id: 's-wf-westwood',
    area: 'Westwood',
    retailerId: 'r-wholefoods',
    address: '1050 Gayley Ave, Los Angeles, CA',
    latitude: 34.0608,
    longitude: -118.4478,
  },
  // Roughly five miles south-west. Cheaper across the board, which is exactly
  // the case the trip optimizer has to weigh against the drive.
  {
    id: 's-ralphs-santa-monica',
    area: 'Santa Monica',
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
  { packageId: 'p-daves-27', score: 0.93, reviewCount: 5120 },
  { packageId: 'p-kroger-bread-20', score: 0.66, reviewCount: 410 },
  { packageId: 'p-bananas-lb', score: 0.8, reviewCount: 760 },
  { packageId: 'p-fosterfarms-chicken', score: 0.77, reviewCount: 1330 },
  { packageId: 'p-365-chicken', score: 0.87, reviewCount: 940 },
  { packageId: 'p-barilla-16', score: 0.89, reviewCount: 6210 },
  { packageId: 'p-goodgather-pasta-16', score: 0.74, reviewCount: 520 },
  { packageId: 'p-peets-10', score: 0.88, reviewCount: 3870 },
  { packageId: 'p-chobani-32', score: 0.9, reviewCount: 2650 },
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

  // -- Member prices. Ralphs and Target both discount for card holders, so
  //    linking either card changes what Compare and Trip recommend.
  obs('p-lucerne-12', 's-ralphs-westwood', 449, 'loyalty_sync', 2, true),
  obs('p-horizon-half-gal', 's-ralphs-westwood', 529, 'loyalty_sync', 2, true),
  obs('p-kroger-milk-gal', 's-ralphs-westwood', 399, 'loyalty_sync', 2, true),
  obs('p-nishiki-5lb', 's-target-westwood', 829, 'loyalty_sync', 1, true),

  // -- Staples.
  obs('p-daves-27', 's-ralphs-westwood', 649, 'scrape', 2),
  obs('p-daves-27', 's-ralphs-westwood', 549, 'loyalty_sync', 2, true),
  obs('p-daves-27', 's-target-westwood', 629, 'scrape', 1),
  obs('p-daves-27', 's-ralphs-santa-monica', 599, 'scrape', 2),
  obs('p-kroger-bread-20', 's-ralphs-westwood', 249, 'scrape', 2),
  obs('p-kroger-bread-20', 's-ralphs-santa-monica', 229, 'scrape', 2),
  obs('p-bananas-lb', 's-ralphs-westwood', 69, 'scrape', 2),
  obs('p-bananas-lb', 's-target-westwood', 75, 'scrape', 1),
  obs('p-bananas-lb', 's-wf-westwood', 79, 'scrape', 2),
  obs('p-bananas-lb', 's-ralphs-santa-monica', 59, 'scrape', 2),
  obs('p-fosterfarms-chicken', 's-ralphs-westwood', 1249, 'scrape', 3),
  obs('p-fosterfarms-chicken', 's-ralphs-santa-monica', 1149, 'scrape', 2),
  obs('p-365-chicken', 's-wf-westwood', 1349, 'scrape', 2),
  obs('p-barilla-16', 's-ralphs-westwood', 229, 'scrape', 2),
  obs('p-barilla-16', 's-target-westwood', 199, 'scrape', 1),
  obs('p-barilla-16', 's-ralphs-santa-monica', 209, 'scrape', 2),
  obs('p-goodgather-pasta-16', 's-target-westwood', 119, 'scrape', 1),
  obs('p-goodgather-pasta-16', 's-target-westwood', 99, 'loyalty_sync', 1, true),
  obs('p-peets-10', 's-ralphs-westwood', 1099, 'scrape', 3),
  obs('p-peets-10', 's-target-westwood', 999, 'scrape', 1),
  obs('p-peets-10', 's-wf-westwood', 1149, 'scrape', 2),
  obs('p-chobani-32', 's-ralphs-westwood', 649, 'scrape', 2),
  obs('p-chobani-32', 's-target-westwood', 599, 'scrape', 1),
  obs('p-chobani-32', 's-wf-westwood', 629, 'scrape', 2),
]

/**
 * Six months of one household's grocery runs, ending a week before `SEED_NOW`.
 *
 * Generated rather than typed out, but deterministically, so Spending shows the
 * same history on every load and the tests can rely on it. Every line is priced
 * from the seeded shelf price at that store, drifted down for inflation and
 * jittered a little, the way real receipts wander.
 *
 * Each receipt is older than every seeded observation for its package and store,
 * so history feeds Spending without superseding anything Compare or Trip show.
 * The Kroger ketchup at Ralphs Westwood is left out on purpose: its only
 * evidence is the stale user report, and a receipt would quietly replace it.
 */
export const receiptHistory: Receipt[] = buildReceiptHistory()

function buildReceiptHistory(): Receipt[] {
  const random = mulberry32(20_260_821)
  const shelf = newestPublicPrices(priceObservations)
  shelf.delete('p-kroger-20 s-ralphs-westwood')

  const stocked = (storeId: string) =>
    [...shelf.keys()].filter((key) => key.endsWith(` ${storeId}`)).map((key) => key.split(' ')[0])

  const receipts: Receipt[] = []
  const trip = (storeId: string, daysBack: number, minLines: number, maxLines: number) => {
    const available = shuffle(stocked(storeId), random)
    const count = Math.min(available.length, minLines + Math.floor(random() * (maxLines - minLines + 1)))
    const monthsBack = daysBack / 30
    const id = `h-${receipts.length + 1}`
    const purchasedAt = daysAgo(daysBack)

    receipts.push({
      id,
      storeId,
      purchasedAt,
      createdAt: purchasedAt,
      lines: available.slice(0, count).map((packageId, index) => {
        const base = shelf.get(`${packageId} ${storeId}`)!
        const drifted = base * (1 - 0.006 * monthsBack) * (1 + (random() - 0.5) * 0.06)
        return {
          id: `${id}-${index}`,
          packageId,
          quantity: packageId === 'p-bananas-lb' ? 2 + Math.floor(random() * 2) : random() < 0.25 ? 2 : 1,
          // Shelf prices end in 9; receipts should too.
          unitPriceCents: Math.max(9, Math.round(drifted / 10) * 10 - 1),
          isMemberPrice: false,
        }
      }),
    })
  }

  for (let week = 26; week >= 1; week--) {
    const daysBack = week * 7
    trip(week % 2 === 0 ? 's-target-westwood' : 's-ralphs-westwood', daysBack, 6, 10)
    if (week % 3 === 0) trip('s-wf-westwood', daysBack + 2, 3, 5)
    if (week % 4 === 1) trip('s-ralphs-santa-monica', daysBack + 3, 7, 11)
  }

  return receipts.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
}

/** Newest public price per `${packageId} ${storeId}`. */
function newestPublicPrices(observations: readonly PriceObservation[]): Map<string, number> {
  const newest = new Map<string, PriceObservation>()
  for (const o of observations) {
    if (o.isMemberPrice) continue
    const key = `${o.packageId} ${o.storeId}`
    const incumbent = newest.get(key)
    if (!incumbent || o.observedAt > incumbent.observedAt) newest.set(key, o)
  }
  return new Map([...newest].map(([key, o]) => [key, o.priceCents]))
}

/** Small seeded PRNG, so generated history is identical on every load. */
function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
