/**
 * A package's price over time at one store, for the sparkline on Compare.
 * Pure: the repository supplies the observations, this shapes them.
 */
import type { CatalogRepository } from './repository'

export interface HistoryPoint {
  at: number
  priceCents: number
}

export interface PriceHistory {
  points: HistoryPoint[]
  /** Percent change from the first point to the last; negative means cheaper now. */
  percentChange: number
  lowCents: number
  highCents: number
  /** Whole days spanned by the series. */
  spanDays: number
}

/** Fewer points than this is an anecdote, not a trend. */
export const MIN_HISTORY_POINTS = 4

export function priceHistory(
  repo: CatalogRepository,
  packageId: string,
  storeId: string,
): PriceHistory | null {
  const points = repo
    .getPriceHistory(packageId, storeId)
    .map((o) => ({ at: Date.parse(o.observedAt), priceCents: o.priceCents }))
  if (points.length < MIN_HISTORY_POINTS) return null

  const prices = points.map((p) => p.priceCents)
  const first = points[0]
  const last = points[points.length - 1]
  return {
    points,
    percentChange: Math.round((last.priceCents / first.priceCents - 1) * 100),
    lowCents: Math.min(...prices),
    highCents: Math.max(...prices),
    spanDays: Math.round((last.at - first.at) / 86_400_000),
  }
}
