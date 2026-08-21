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
