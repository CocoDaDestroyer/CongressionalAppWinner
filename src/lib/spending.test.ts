import { describe, expect, it } from 'vitest'
import type { Receipt } from './catalog'
import {
  longMonthName,
  shortMonthName,
  spendBy,
  spendByStore,
  summarizeSpending,
  trailingMonths,
  monthOf,
  yearOf,
} from './spending'
import * as seed from '../data/seed'

let id = 0
function receipt(storeId: string, purchasedAt: string, ...lines: [number, number][]): Receipt {
  const receiptId = `t-${++id}`
  return {
    id: receiptId,
    storeId,
    purchasedAt,
    createdAt: purchasedAt,
    lines: lines.map(([unitPriceCents, quantity], i) => ({
      id: `${receiptId}-${i}`,
      packageId: 'p-heinz-20',
      quantity,
      unitPriceCents,
      isMemberPrice: false,
    })),
  }
}

const receipts = [
  receipt('s-a', '2025-12-30T12:00:00Z', [1000, 1]),
  receipt('s-a', '2026-06-02T12:00:00Z', [500, 2]),
  receipt('s-b', '2026-06-20T12:00:00Z', [250, 4]),
  receipt('s-b', '2026-08-01T12:00:00Z', [300, 1], [200, 2]),
]

describe('spendBy', () => {
  it('totals by month, multiplying price by quantity', () => {
    expect(spendBy(receipts, monthOf)).toEqual([
      { period: '2025-12', cents: 1000, receiptCount: 1 },
      { period: '2026-06', cents: 2000, receiptCount: 2 },
      { period: '2026-08', cents: 700, receiptCount: 1 },
    ])
  })

  it('totals by year', () => {
    expect(spendBy(receipts, yearOf)).toEqual([
      { period: '2025', cents: 1000, receiptCount: 1 },
      { period: '2026', cents: 2700, receiptCount: 3 },
    ])
  })

  it('is empty for no receipts', () => {
    expect(spendBy([], monthOf)).toEqual([])
  })
})

describe('spendByStore', () => {
  it('ranks stores by total spend', () => {
    expect(spendByStore(receipts)).toEqual([
      { storeId: 's-a', cents: 2000, receiptCount: 2 },
      { storeId: 's-b', cents: 1700, receiptCount: 2 },
    ])
  })
})

describe('trailingMonths', () => {
  it('counts back across a year boundary, oldest first', () => {
    expect(trailingMonths(new Date('2026-02-10T00:00:00Z'), 4)).toEqual([
      '2025-11', '2025-12', '2026-01', '2026-02',
    ])
  })
})

describe('summarizeSpending', () => {
  const now = new Date('2026-08-21T12:00:00Z')

  it('fills months with no receipts as zero', () => {
    const summary = summarizeSpending(receipts, now, 3)
    expect(summary.months).toEqual([
      { period: '2026-06', cents: 2000, receiptCount: 2 },
      { period: '2026-07', cents: 0, receiptCount: 0 },
      { period: '2026-08', cents: 700, receiptCount: 1 },
    ])
    expect(summary.thisMonthCents).toBe(700)
    expect(summary.lastMonthCents).toBe(0)
  })

  it('averages only months with spending', () => {
    expect(summarizeSpending(receipts, now, 3).monthlyAverageCents).toBe(1350)
  })

  it('limits the year total and top stores to the current year', () => {
    const summary = summarizeSpending(receipts, now)
    expect(summary.thisYearCents).toBe(2700)
    // s-a outspends s-b overall, but most of that was in 2025.
    expect(summary.topStores.map((s) => s.storeId)).toEqual(['s-b', 's-a'])
  })

  it('is all zeros with no receipts', () => {
    const summary = summarizeSpending([], now)
    expect(summary.thisMonthCents).toBe(0)
    expect(summary.monthlyAverageCents).toBe(0)
    expect(summary.months).toHaveLength(6)
    expect(summary.topStores).toEqual([])
  })

  it('covers six months of seeded history', () => {
    const summary = summarizeSpending(seed.receiptHistory, seed.SEED_NOW)
    expect(summary.months.every((m) => m.receiptCount > 0)).toBe(true)
    // History starts in February, before the six-month window opens.
    expect(summary.thisYearCents).toBeGreaterThan(summary.months.reduce((sum, m) => sum + m.cents, 0))
  })
})

describe('month names', () => {
  it('formats in UTC so a month never shifts by time zone', () => {
    expect(shortMonthName('2026-03')).toBe('Mar')
    expect(longMonthName('2026-12')).toBe('December 2026')
  })
})
