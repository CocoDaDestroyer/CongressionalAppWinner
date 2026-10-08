import { describe, expect, it } from 'vitest'
import { findDeals } from './deals'
import { createInMemoryRepository } from './repository'
import * as seed from '../data/seed'

const repo = createInMemoryRepository(seed)
const now = seed.SEED_NOW

describe('findDeals', () => {
  it('returns the biggest gaps first, one per product', () => {
    const deals = findDeals(repo, { now, limit: 10 })
    expect(deals.length).toBeGreaterThan(0)
    const percents = deals.map((d) => d.percentLess)
    expect(percents).toEqual([...percents].sort((a, b) => b - a))
    const concepts = deals.map((d) => d.conceptName)
    expect(new Set(concepts).size).toBe(concepts.length)
  })

  it('never recommends a stale price or a locked member price', () => {
    for (const { option } of findDeals(repo, { now, limit: 20, memberRetailerIds: [] })) {
      expect(option.ageDays).toBeLessThanOrEqual(14)
      expect(option.memberLocked).toBe(false)
    }
  })

  it('respects the limit and only lists real savings', () => {
    const deals = findDeals(repo, { now, limit: 2 })
    expect(deals.length).toBeLessThanOrEqual(2)
    for (const d of deals) expect(d.percentLess).toBeGreaterThanOrEqual(1)
  })
})
