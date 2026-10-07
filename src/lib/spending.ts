/**
 * Spend tracking: receipts rolled up by month, store and year.
 *
 * Pure functions over receipts, so the Spending screen shows exactly what was
 * entered and nothing is stored twice. Months and years are calendar periods
 * in UTC, matching how receipt dates are stored.
 */
import type { Receipt } from './catalog'
import { receiptTotalCents } from './store'

export interface PeriodTotal {
  /** `YYYY-MM` for a month, `YYYY` for a year. */
  period: string
  cents: number
  receiptCount: number
}

export interface StoreTotal {
  storeId: string
  cents: number
  receiptCount: number
}

export interface SpendingSummary {
  thisMonthCents: number
  lastMonthCents: number
  thisYearCents: number
  /** Mean over the months in `months` that have any spending. */
  monthlyAverageCents: number
  /** The trailing window ending in the current month, oldest first, gaps as zero. */
  months: PeriodTotal[]
  /** Stores by spend this year, biggest first. */
  topStores: StoreTotal[]
}

export const monthOf = (iso: string): string => iso.slice(0, 7)
export const yearOf = (iso: string): string => iso.slice(0, 4)

/** Totals per period, keyed by whatever `periodOf` returns. Sorted oldest first. */
export function spendBy(
  receipts: readonly Receipt[],
  periodOf: (iso: string) => string,
): PeriodTotal[] {
  const totals = new Map<string, PeriodTotal>()
  for (const receipt of receipts) {
    const period = periodOf(receipt.purchasedAt)
    const total = totals.get(period) ?? { period, cents: 0, receiptCount: 0 }
    total.cents += receiptTotalCents(receipt)
    total.receiptCount += 1
    totals.set(period, total)
  }
  return [...totals.values()].sort((a, b) => a.period.localeCompare(b.period))
}

export function spendByStore(receipts: readonly Receipt[]): StoreTotal[] {
  const totals = new Map<string, StoreTotal>()
  for (const receipt of receipts) {
    const total = totals.get(receipt.storeId) ?? {
      storeId: receipt.storeId,
      cents: 0,
      receiptCount: 0,
    }
    total.cents += receiptTotalCents(receipt)
    total.receiptCount += 1
    totals.set(receipt.storeId, total)
  }
  return [...totals.values()].sort((a, b) => b.cents - a.cents)
}

/** `YYYY-MM` keys for the `count` months ending with `now`'s month, oldest first. */
export function trailingMonths(now: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - i), 1))
    return date.toISOString().slice(0, 7)
  })
}

export function summarizeSpending(
  receipts: readonly Receipt[],
  now: Date,
  windowMonths = 6,
): SpendingSummary {
  const byMonth = new Map(spendBy(receipts, monthOf).map((m) => [m.period, m]))
  const window = trailingMonths(now, windowMonths)
  const months = window.map(
    (period) => byMonth.get(period) ?? { period, cents: 0, receiptCount: 0 },
  )
  const active = months.filter((m) => m.receiptCount > 0)

  const thisYear = yearOf(now.toISOString())
  const yearReceipts = receipts.filter((r) => yearOf(r.purchasedAt) === thisYear)

  return {
    thisMonthCents: months[months.length - 1]?.cents ?? 0,
    lastMonthCents: months[months.length - 2]?.cents ?? 0,
    thisYearCents: yearReceipts.reduce((sum, r) => sum + receiptTotalCents(r), 0),
    monthlyAverageCents:
      active.length === 0
        ? 0
        : Math.round(active.reduce((sum, m) => sum + m.cents, 0) / active.length),
    months,
    topStores: spendByStore(yearReceipts),
  }
}

/** "2026-08" -> "Aug". */
export function shortMonthName(period: string): string {
  return new Date(`${period}-01T00:00:00Z`).toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
}

/** "2026-08" -> "August 2026". */
export function longMonthName(period: string): string {
  return new Date(`${period}-01T00:00:00Z`).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
