import { describe, expect, it } from 'vitest'
import { priceHistory } from './history'
import { createInMemoryRepository } from './repository'
import { receiptsToObservations } from './store'
import * as seed from '../data/seed'

const repo = createInMemoryRepository({
  ...seed,
  priceObservations: [...seed.priceObservations, ...receiptsToObservations(seed.receiptHistory)],
})

describe('priceHistory', () => {
  it('lists public observations oldest first', () => {
    const rows = repo.getPriceHistory('p-heinz-20', 's-ralphs-westwood')
    expect(rows.length).toBeGreaterThan(3)
    expect(rows.every((o) => !o.isMemberPrice)).toBe(true)
    const times = rows.map((o) => Date.parse(o.observedAt))
    expect(times).toEqual([...times].sort((a, b) => a - b))
  })

  it('summarizes the change from first to last', () => {
    const h = priceHistory(repo, 'p-heinz-20', 's-ralphs-westwood')!
    const first = h.points[0].priceCents
    const last = h.points[h.points.length - 1].priceCents
    expect(h.percentChange).toBe(Math.round((last / first - 1) * 100))
    expect(h.lowCents).toBeLessThanOrEqual(h.highCents)
  })

  it('declines to draw a trend from too few points', () => {
    expect(priceHistory(repo, 'p-kroger-20', 's-ralphs-westwood')).toBeNull()
    expect(priceHistory(repo, 'nope', 'nope')).toBeNull()
  })
})
