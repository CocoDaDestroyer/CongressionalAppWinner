import { describe, expect, it } from 'vitest'
import type { Receipt } from './catalog'
import { createInMemoryRepository } from './repository'
import { receiptSavingsCents, savingsInMonth, typicalPerUnit } from './savings'
import { normalize } from './units'
import * as seed from '../data/seed'

const repo = createInMemoryRepository(seed)

function receipt(purchasedAt: string, packageId: string, unitPriceCents: number, quantity = 1): Receipt {
  return {
    id: `s-${packageId}-${unitPriceCents}`,
    storeId: 's-ralphs-westwood',
    purchasedAt,
    createdAt: purchasedAt,
    lines: [{ id: 'l', packageId, quantity, unitPriceCents, isMemberPrice: false }],
  }
}

describe('typicalPerUnit', () => {
  it('is the median public per-unit price across packages and stores', () => {
    const typical = typicalPerUnit(repo, 'c-ketchup')!
    const cheapestPublic = normalize(279, 20, 'oz').perUnit
    const priciest = normalize(529, 32, 'oz').perUnit
    expect(typical).toBeGreaterThan(cheapestPublic)
    expect(typical).toBeLessThan(normalize(449, 20, 'oz').perUnit)
    expect(typical).not.toBe(priciest)
  })

  it('is null for a concept with no prices', () => {
    expect(typicalPerUnit(repo, 'c-nothing')).toBeNull()
  })
})

describe('receiptSavingsCents', () => {
  it('credits the big jar for being cheaper per unit, not for its sticker', () => {
    // $8.99 for 64 oz is far below the typical price per ounce of ketchup.
    expect(receiptSavingsCents(repo, receipt('2026-08-10T12:00:00Z', 'p-heinz-64', 899))).toBeGreaterThan(100)
  })

  it('never counts an expensive purchase as negative savings', () => {
    expect(receiptSavingsCents(repo, receipt('2026-08-10T12:00:00Z', 'p-heinz-20', 999))).toBe(0)
  })

  it('scales with quantity', () => {
    const one = receiptSavingsCents(repo, receipt('2026-08-10T12:00:00Z', 'p-heinz-64', 899, 1))
    const two = receiptSavingsCents(repo, receipt('2026-08-10T12:00:00Z', 'p-heinz-64', 899, 2))
    expect(two).toBeCloseTo(one * 2, -1)
  })
})

describe('savingsInMonth', () => {
  it('only counts receipts from that month', () => {
    const receipts = [
      receipt('2026-08-10T12:00:00Z', 'p-heinz-64', 899),
      receipt('2026-07-10T12:00:00Z', 'p-heinz-64', 899),
    ]
    expect(savingsInMonth(repo, receipts, '2026-08')).toBe(
      receiptSavingsCents(repo, receipts[0]),
    )
  })
})
