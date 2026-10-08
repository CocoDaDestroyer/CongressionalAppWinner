import { describe, expect, it } from 'vitest'
import { optimizeTrip, tripSummaryText, type ListItem } from './trip'
import { createInMemoryRepository } from './repository'
import { DEFAULT_DRIVING_COST, drivingCostCents, haversineMiles, shortestRoundTrip } from './geo'
import * as seed from '../data/seed'

const repo = createInMemoryRepository(seed)
const home = seed.SEED_HOME

const list = (...items: [string, number][]): ListItem[] =>
  items.map(([conceptId, quantity]) => ({ conceptId, quantity }))

describe('geo', () => {
  it('measures a known distance', () => {
    // Westwood to the Santa Monica store is roughly five miles.
    const store = seed.stores.find((s) => s.id === 's-ralphs-santa-monica')!
    expect(haversineMiles(home, store)).toBeGreaterThan(3.5)
    expect(haversineMiles(home, store)).toBeLessThan(5.5)
  })

  it('returns a zero-mile route for no stops', () => {
    expect(shortestRoundTrip(home, [])).toEqual({ order: [], miles: 0 })
  })

  it('orders stops to minimise the round trip', () => {
    const near = { id: 'near', latitude: 34.0625, longitude: -118.4453 }
    const far = { id: 'far', latitude: 34.0195, longitude: -118.4912 }
    const route = shortestRoundTrip(home, [far, near])
    // Visiting the near store first and looping out is shorter than the reverse.
    expect(route.order[0].id).toBe('near')
  })

  it('refuses a stop count it cannot brute force', () => {
    const stops = Array.from({ length: 9 }, (_, i) => ({
      latitude: 34 + i / 100,
      longitude: -118,
    }))
    expect(() => shortestRoundTrip(home, stops)).toThrow(RangeError)
  })

  it('charges only fuel by default', () => {
    const cents = drivingCostCents(25, DEFAULT_DRIVING_COST)
    // 25 miles at 25 mpg is one gallon.
    expect(cents).toBeCloseTo(DEFAULT_DRIVING_COST.gasPriceCentsPerGallon)
  })
})

describe('optimizeTrip', () => {
  it('returns null for an empty list', () => {
    expect(optimizeTrip(repo, [], { home })).toBeNull()
    expect(optimizeTrip(repo, list(['c-eggs', 0]), { home })).toBeNull()
  })

  it('never plans a stop it buys nothing at', () => {
    const result = optimizeTrip(repo, list(['c-eggs', 1], ['c-milk', 1]), { home })!
    const visited = new Set(result.best.purchases.map((p) => p.option.store.id))
    expect(result.best.stores.map((s) => s.id).sort()).toEqual([...visited].sort())
  })

  it('counts fuel in the total, so total exceeds groceries alone', () => {
    const result = optimizeTrip(repo, list(['c-eggs', 1]), { home })!
    expect(result.best.drivingCents).toBeGreaterThan(0)
    expect(result.best.totalCents).toBeCloseTo(
      result.best.groceryCents + result.best.drivingCents,
    )
  })

  it('beats or matches the naive plan that ignores the drive', () => {
    const items = list(['c-eggs', 1], ['c-milk', 1], ['c-rice', 1], ['c-ketchup', 1])
    const result = optimizeTrip(repo, items, { home, maxStores: 4 })!
    expect(result.best.totalCents).toBeLessThanOrEqual(result.ignoringTravel!.totalCents)
  })

  it('skips a cheap but distant store for a single cheap item', () => {
    // Santa Monica eggs are $1.00 cheaper but roughly ten miles round trip
    // further, which costs more in fuel than it saves.
    const result = optimizeTrip(repo, list(['c-eggs', 1]), { home })!
    expect(result.best.stores.map((s) => s.id)).not.toContain('s-ralphs-santa-monica')
  })

  it('drives to the distant store once the basket is big enough', () => {
    // The same store, now worth the trip because the savings scale with the
    // basket while the fuel cost does not.
    const items = list(['c-eggs', 6], ['c-milk', 6], ['c-rice', 6])
    const result = optimizeTrip(repo, items, { home })!
    expect(result.best.stores.map((s) => s.id)).toContain('s-ralphs-santa-monica')
  })

  it('respects the maximum number of stops', () => {
    const items = list(['c-eggs', 4], ['c-milk', 4], ['c-rice', 4], ['c-olive-oil', 4])
    const result = optimizeTrip(repo, items, { home, maxStores: 2 })!
    expect(result.best.stores.length).toBeLessThanOrEqual(2)
  })

  it('hides member pricing the shopper cannot use', () => {
    const items = list(['c-ketchup', 1])
    const without = optimizeTrip(repo, items, { home, qualityWeight: 1 })!
    const withCard = optimizeTrip(repo, items, {
      home,
      qualityWeight: 1,
      memberRetailerIds: ['r-ralphs'],
    })!
    expect(without.best.purchases[0].option.isMemberPrice).toBe(false)
    // Heinz 20 oz is the best-rated ketchup; with a Ralphs card its member
    // price is the one that should be picked.
    expect(withCard.best.purchases[0].option.isMemberPrice).toBe(true)
    expect(withCard.best.groceryCents).toBeLessThan(without.best.groceryCents)
  })

  it('reports an item nothing in range sells', () => {
    const result = optimizeTrip(repo, list(['c-eggs', 1], ['c-nonexistent', 1]), {
      home,
    })!
    expect(result.best.unavailable).toContain('c-nonexistent')
    expect(result.best.purchases).toHaveLength(1)
  })

  it('offers a single-store plan for comparison', () => {
    const items = list(['c-eggs', 2], ['c-milk', 2])
    const result = optimizeTrip(repo, items, { home })!
    expect(result.bestSingleStore!.stores).toHaveLength(1)
    expect(result.bestSingleStore!.totalCents).toBeGreaterThanOrEqual(
      result.best.totalCents,
    )
  })
})

describe('tripSummaryText', () => {
  it('lists every stop in route order with its items and the total', () => {
    const result = optimizeTrip(repo, list(['c-eggs', 1], ['c-milk', 2]), { home })!
    const text = tripSummaryText(repo, result)
    result.best.routeOrder.forEach((_, i) => expect(text).toContain(`${i + 1}. `))
    for (const p of result.best.purchases) expect(text).toContain(p.option.pkg.displayName)
    expect(text).toMatch(/^My CartWise trip plan/)
    expect(text).toMatch(/Total \$\d+\.\d\d/)
  })
})
