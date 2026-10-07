// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { CatalogStore, receiptTotalCents, receiptsToObservations } from './store'
import { compareByPackage } from './compare'
import * as seed from '../data/seed'

const YESTERDAY = new Date(seed.SEED_NOW.getTime() - 86_400_000).toISOString()
/**
 * Strictly newer than every seeded observation. Using YESTERDAY here would tie
 * with the Target scrape, and a tie is settled by source trust -- a scrape
 * beats a receipt -- so the test would be asserting the wrong mechanism.
 */
const TODAY = seed.SEED_NOW.toISOString()

function newStore() {
  localStorage.clear()
  return new CatalogStore(seed)
}

describe('receiptsToObservations', () => {
  it('produces one observation per line, attributed to the receipt', () => {
    const observations = receiptsToObservations([
      {
        id: 'r-1',
        storeId: 's-target-westwood',
        purchasedAt: YESTERDAY,
        createdAt: YESTERDAY,
        lines: [
          {
            id: 'r-1-0', packageId: 'p-heinz-20', quantity: 3,
            unitPriceCents: 379, isMemberPrice: false,
          },
        ],
      },
    ])
    // Quantity does not multiply the price: the observation is the shelf price.
    expect(observations).toEqual([
      expect.objectContaining({
        packageId: 'p-heinz-20',
        storeId: 's-target-westwood',
        priceCents: 379,
        source: 'receipt',
      }),
    ])
  })
})

describe('CatalogStore', () => {
  let store: CatalogStore

  beforeEach(() => {
    store = newStore()
  })

  it('starts from seed data alone', () => {
    expect(store.getReceipts()).toHaveLength(0)
  })

  it('rejects a receipt with no usable lines', () => {
    expect(() =>
      store.recordReceipt({
        storeId: 's-target-westwood',
        purchasedAt: YESTERDAY,
        lines: [{ packageId: 'p-heinz-20', quantity: 0, unitPriceCents: 100 }],
      }),
    ).toThrow(RangeError)
  })

  it('feeds a saved receipt into the prices comparison reads', () => {
    const before = compareByPackage(store.getRepository(), 'p-heinz-20', {
      now: seed.SEED_NOW,
    })!
    const targetBefore = before.options.find(
      (o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-target-westwood',
    )!
    expect(targetBefore.priceCents).toBe(399)

    store.recordReceipt({
      storeId: 's-target-westwood',
      purchasedAt: TODAY,
      lines: [{ packageId: 'p-heinz-20', quantity: 1, unitPriceCents: 299 }],
    })

    const after = compareByPackage(store.getRepository(), 'p-heinz-20', {
      now: seed.SEED_NOW,
    })!
    const targetAfter = after.options.find(
      (o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-target-westwood',
    )!
    // The receipt is newer than the scrape, so it supersedes it.
    expect(targetAfter.priceCents).toBe(299)
    expect(targetAfter.source).toBe('receipt')
  })

  it('does not let an older receipt override a newer scrape', () => {
    store.recordReceipt({
      storeId: 's-target-westwood',
      purchasedAt: new Date(seed.SEED_NOW.getTime() - 30 * 86_400_000).toISOString(),
      lines: [{ packageId: 'p-heinz-20', quantity: 1, unitPriceCents: 199 }],
    })
    const result = compareByPackage(store.getRepository(), 'p-heinz-20', {
      now: seed.SEED_NOW,
    })!
    const target = result.options.find(
      (o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-target-westwood',
    )!
    expect(target.priceCents).toBe(399)
  })

  it('swaps the repository object so React sees a change', () => {
    const before = store.getRepository()
    store.recordReceipt({
      storeId: 's-target-westwood',
      purchasedAt: YESTERDAY,
      lines: [{ packageId: 'p-heinz-20', quantity: 1, unitPriceCents: 299 }],
    })
    expect(store.getRepository()).not.toBe(before)
  })

  it('notifies subscribers, and stops after unsubscribe', () => {
    let calls = 0
    const unsubscribe = store.subscribe(() => calls++)

    store.recordReceipt({
      storeId: 's-target-westwood',
      purchasedAt: YESTERDAY,
      lines: [{ packageId: 'p-heinz-20', quantity: 1, unitPriceCents: 299 }],
    })
    expect(calls).toBe(1)

    unsubscribe()
    store.recordReceipt({
      storeId: 's-target-westwood',
      purchasedAt: YESTERDAY,
      lines: [{ packageId: 'p-heinz-20', quantity: 1, unitPriceCents: 289 }],
    })
    expect(calls).toBe(1)
  })

  it('removes the prices a deleted receipt produced', () => {
    const receipt = store.recordReceipt({
      storeId: 's-target-westwood',
      purchasedAt: TODAY,
      lines: [{ packageId: 'p-heinz-20', quantity: 1, unitPriceCents: 299 }],
    })
    store.deleteReceipt(receipt.id)

    const result = compareByPackage(store.getRepository(), 'p-heinz-20', {
      now: seed.SEED_NOW,
    })!
    const target = result.options.find(
      (o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-target-westwood',
    )!
    expect(target.priceCents).toBe(399)
  })

  it('ignores a delete for an unknown receipt', () => {
    const before = store.getRepository()
    store.deleteReceipt('nope')
    expect(store.getRepository()).toBe(before)
  })

  it('survives a reload through localStorage', () => {
    store.recordReceipt({
      storeId: 's-target-westwood',
      purchasedAt: YESTERDAY,
      lines: [{ packageId: 'p-heinz-20', quantity: 2, unitPriceCents: 299 }],
    })
    const reloaded = new CatalogStore(seed)
    expect(reloaded.getReceipts()).toHaveLength(1)
    expect(receiptTotalCents(reloaded.getReceipts()[0])).toBe(598)
  })

  it('starts empty rather than throwing on corrupt storage', () => {
    localStorage.setItem('cartwise.receipts.v1', '{not json')
    expect(new CatalogStore(seed).getReceipts()).toHaveLength(0)
  })
})

describe('linked store cards', () => {
  it('records a linked card and forgets it when unlinked', () => {
    const store = newStore()
    store.setCardLinked('r-ralphs', true)
    expect(store.getLinkedRetailerIds()).toEqual(['r-ralphs'])
    store.setCardLinked('r-ralphs', false)
    expect(store.getLinkedRetailerIds()).toEqual([])
  })

  it('notifies subscribers only on a real change', () => {
    const store = newStore()
    let calls = 0
    store.subscribe(() => calls++)
    store.setCardLinked('r-target', true)
    store.setCardLinked('r-target', true)
    expect(calls).toBe(1)
  })

  it('survives a reload', () => {
    newStore().setCardLinked('r-target', true)
    expect(new CatalogStore(seed).getLinkedRetailerIds()).toEqual(['r-target'])
  })
})

describe('community contributions', () => {
  const tenDaysAgo = new Date(seed.SEED_NOW.getTime() - 10 * 86_400_000)

  function storeAt(now: Date) {
    localStorage.clear()
    return new CatalogStore(seed, { clock: () => now })
  }

  const targetHeinz20 = (store: CatalogStore) =>
    compareByPackage(store.getRepository(), 'p-heinz-20', { now: seed.SEED_NOW })!.options.find(
      (o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-target-westwood' && !o.isMemberPrice,
    )!

  it('records a report as a user_report observation', () => {
    const store = storeAt(seed.SEED_NOW)
    const observation = store.reportPrice({
      packageId: 'p-heinz-20', storeId: 's-target-westwood', priceCents: 359,
    })
    expect(observation.source).toBe('user_report')
    expect(targetHeinz20(store)).toMatchObject({ priceCents: 359, source: 'user_report' })
  })

  it('loses to a fresher scrape', () => {
    // The seeded Target scrape is one day old; this report is ten.
    const store = storeAt(tenDaysAgo)
    store.reportPrice({ packageId: 'p-heinz-20', storeId: 's-target-westwood', priceCents: 199 })
    expect(targetHeinz20(store)).toMatchObject({ priceCents: 399, source: 'scrape' })
  })

  it('loses to a scrape seen at the same instant', () => {
    const scrapedAt = new Date(seed.priceObservations.find(
      (o) => o.packageId === 'p-heinz-20' && o.storeId === 's-target-westwood',
    )!.observedAt)
    const store = storeAt(scrapedAt)
    store.reportPrice({ packageId: 'p-heinz-20', storeId: 's-target-westwood', priceCents: 199 })
    expect(targetHeinz20(store)).toMatchObject({ priceCents: 399, source: 'scrape' })
  })

  it('rejects a price that is not a positive number of cents', () => {
    const store = storeAt(seed.SEED_NOW)
    expect(() =>
      store.reportPrice({ packageId: 'p-heinz-20', storeId: 's-target-westwood', priceCents: 0 }),
    ).toThrow(RangeError)
  })

  it('adds an unknown barcode as an unverified package with a community price', () => {
    const store = storeAt(seed.SEED_NOW)
    const pkg = store.contributeProduct({
      gtin: '00012345678905',
      displayName: 'Sir Kensington Ketchup, 20 oz',
      conceptId: 'c-ketchup',
      size: 20,
      unit: 'oz',
      storeId: 's-wf-westwood',
      priceCents: 549,
    })
    const repo = store.getRepository()
    expect(repo.getPackageByGtin('00012345678905')).toEqual(pkg)
    expect(pkg.verifiedAt).toBeNull()

    // It joins the comparison as a sibling of the other ketchups.
    const option = compareByPackage(repo, 'p-heinz-64', { now: seed.SEED_NOW })!.options.find(
      (o) => o.pkg.id === pkg.id,
    )!
    expect(option).toMatchObject({ priceCents: 549, source: 'user_report', ageDays: 0 })
  })

  it('refuses a barcode the catalog already knows', () => {
    const store = storeAt(seed.SEED_NOW)
    expect(() =>
      store.contributeProduct({
        gtin: '00013000006200', displayName: 'Dupe', conceptId: 'c-ketchup',
        size: 20, unit: 'oz', storeId: 's-wf-westwood', priceCents: 100,
      }),
    ).toThrow(RangeError)
  })

  it('survives a reload', () => {
    storeAt(seed.SEED_NOW).reportPrice({
      packageId: 'p-heinz-20', storeId: 's-target-westwood', priceCents: 359,
    })
    expect(targetHeinz20(new CatalogStore(seed))).toMatchObject({ priceCents: 359 })
  })
})

describe('resetDemoData', () => {
  it('restores seeded history and clears cards and contributions', () => {
    localStorage.clear()
    const store = new CatalogStore(seed, {
      initialReceipts: seed.receiptHistory,
      clock: () => seed.SEED_NOW,
    })
    expect(store.getReceipts()).toHaveLength(seed.receiptHistory.length)

    store.deleteReceipt(seed.receiptHistory[0].id)
    store.setCardLinked('r-ralphs', true)
    store.reportPrice({ packageId: 'p-heinz-20', storeId: 's-target-westwood', priceCents: 359 })

    store.resetDemoData()
    expect(store.getReceipts()).toHaveLength(seed.receiptHistory.length)
    expect(store.getLinkedRetailerIds()).toEqual([])
    const target = compareByPackage(store.getRepository(), 'p-heinz-20', {
      now: seed.SEED_NOW,
    })!.options.find((o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-target-westwood')!
    expect(target.priceCents).toBe(399)
  })

  it('never lets seeded history override a seeded price', () => {
    localStorage.clear()
    const withHistory = new CatalogStore(seed, { initialReceipts: seed.receiptHistory })
    const without = newStore()
    for (const concept of seed.concepts) {
      const ids = seed.packages.filter((p) => p.conceptId === concept.id).map((p) => p.id)
      expect(withHistory.getRepository().getCurrentPrices(ids)).toEqual(
        without.getRepository().getCurrentPrices(ids),
      )
    }
  })
})
