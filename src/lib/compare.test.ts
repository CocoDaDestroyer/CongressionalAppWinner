import { describe, expect, it } from 'vitest'
import { compareByPackage, formatPerUnit, isStale } from './compare'
import { createInMemoryRepository, toCurrentPrices } from './repository'
import type { PriceObservation } from './catalog'
import * as seed from '../data/seed'

const repo = createInMemoryRepository(seed)
const at = (now = seed.SEED_NOW) => ({ now })

describe('toCurrentPrices', () => {
  it('keeps only the newest observation per package, store and price type', () => {
    const current = toCurrentPrices(seed.priceObservations)
    const ralphsHeinz20 = current.filter(
      (p) => p.packageId === 'p-heinz-20' && p.storeId === 's-ralphs-westwood',
    )
    // Public and member, not the superseded 30-day-old scrape.
    expect(ralphsHeinz20).toHaveLength(2)
    expect(ralphsHeinz20.find((p) => !p.isMemberPrice)?.priceCents).toBe(429)
    expect(ralphsHeinz20.find((p) => p.isMemberPrice)?.priceCents).toBe(349)
  })

  it('breaks a timestamp tie toward the more trusted source', () => {
    const sameInstant = '2026-08-20T00:00:00.000Z'
    const observations: PriceObservation[] = [
      {
        id: 'a', packageId: 'p', storeId: 's', priceCents: 500,
        isMemberPrice: false, source: 'user_report', observedAt: sameInstant,
      },
      {
        id: 'b', packageId: 'p', storeId: 's', priceCents: 450,
        isMemberPrice: false, source: 'scrape', observedAt: sameInstant,
      },
    ]
    expect(toCurrentPrices(observations)).toEqual([
      expect.objectContaining({ priceCents: 450, source: 'scrape' }),
    ])
  })
})

describe('compareByPackage', () => {
  it('returns null for an unknown package', () => {
    expect(compareByPackage(repo, 'nope', at())).toBeNull()
  })

  it('pulls in sibling brands and sizes, not just the scanned package', () => {
    const result = compareByPackage(repo, 'p-heinz-20', at())!
    const packageIds = new Set(result.options.map((o) => o.pkg.id))
    expect(packageIds).toContain('p-hunts-32')
    expect(packageIds).toContain('p-kroger-20')
    expect(packageIds).toContain('p-heinz-64')
  })

  it('ranks by per-unit price, so the big jar beats the small one', () => {
    const result = compareByPackage(repo, 'p-heinz-20', at())!
    const heinz64 = result.options.findIndex((o) => o.pkg.id === 'p-heinz-64')
    const heinz20Public = result.options.findIndex(
      (o) => o.pkg.id === 'p-heinz-20' && !o.isMemberPrice,
    )
    // The 64 oz costs about twice as much on the shelf and still wins per gram.
    expect(heinz64).toBeLessThan(heinz20Public)
  })

  it('treats member pricing as its own option at the same store', () => {
    const result = compareByPackage(repo, 'p-heinz-20', at())!
    const ralphs = result.options.filter(
      (o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-ralphs-westwood',
    )
    expect(ralphs.map((o) => o.isMemberPrice).sort()).toEqual([false, true])
  })

  it('does not mix dimensions: olive oil never sees ketchup', () => {
    const result = compareByPackage(repo, 'p-365-1l', at())!
    expect(result.dimension).toBe('volume')
    expect(result.options.every((o) => o.pkg.conceptId === 'c-olive-oil')).toBe(true)
  })

  it('picks the cheapest option when quality is ignored', () => {
    const result = compareByPackage(repo, 'p-heinz-20', {
      ...at(),
      qualityWeight: 0,
    })!
    expect(result.bestValue).toBe(result.cheapest)
  })

  it('walks away from the cheapest option when quality is weighted', () => {
    const cheapOnly = compareByPackage(repo, 'p-heinz-20', {
      ...at(),
      qualityWeight: 0,
    })!
    const balanced = compareByPackage(repo, 'p-heinz-20', {
      ...at(),
      qualityWeight: 0.5,
    })!
    // The Kroger store brand is cheapest per unit but rated 0.58; balancing
    // quality against price should move the recommendation off it.
    expect(cheapOnly.bestValue!.pkg.id).toBe('p-kroger-20')
    expect(balanced.bestValue!.pkg.id).not.toBe('p-kroger-20')
  })

  it('marks an old user report as stale', () => {
    const result = compareByPackage(repo, 'p-heinz-20', at())!
    const kroger = result.options.find((o) => o.pkg.id === 'p-kroger-20')!
    expect(kroger.ageDays).toBe(45)
    expect(isStale(kroger)).toBe(true)
  })

  it('does not mark a fresh scrape as stale', () => {
    const result = compareByPackage(repo, 'p-heinz-20', at())!
    const fresh = result.options.find(
      (o) => o.pkg.id === 'p-heinz-20' && o.store.id === 's-target-westwood',
    )!
    expect(isStale(fresh)).toBe(false)
  })
})

describe('formatPerUnit', () => {
  it('shows mass and volume per 100 canonical units, not per gram', () => {
    const result = compareByPackage(repo, 'p-heinz-20', at())!
    expect(formatPerUnit(result.options[0].normalized)).toMatch(/^\$\d+\.\d\d \/ 100 g$/)
  })
})
