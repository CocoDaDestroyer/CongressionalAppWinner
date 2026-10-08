/**
 * "Deals near you": for each product, the best-value option that is also well
 * below the typical per-unit price. Same ranking as Compare, applied to the
 * whole catalog, so a deal shown on Home is the pick Compare would show.
 */
import { compareByPackage, STALE_AFTER_DAYS, type CompareOption } from './compare'
import type { CatalogRepository } from './repository'

export interface Deal {
  conceptName: string
  option: CompareOption
  /** Percent below the median usable per-unit price, 1..100. */
  percentLess: number
}

interface DealOptions {
  now: Date
  memberRetailerIds?: readonly string[]
  limit?: number
  qualityWeight?: number
}

export function findDeals(
  repo: CatalogRepository,
  { now, memberRetailerIds, limit = 3, qualityWeight = 0.5 }: DealOptions,
): Deal[] {
  const deals: Deal[] = []

  for (const concept of repo.getConcepts()) {
    const first = repo.getSiblingPackages(concept.id)[0]
    if (!first) continue
    const comparison = compareByPackage(repo, first.id, { now, memberRetailerIds, qualityWeight })
    const pick = comparison?.bestValue
    if (!comparison || !pick || pick.ageDays > STALE_AFTER_DAYS) continue

    const usable = comparison.options.filter((o) => !o.memberLocked)
    const sorted = usable.map((o) => o.normalized.perUnit).sort((a, b) => a - b)
    const typical = sorted[Math.floor((sorted.length - 1) / 2)]
    const percentLess = typical > 0 ? Math.round((1 - pick.normalized.perUnit / typical) * 100) : 0
    if (percentLess >= 1) deals.push({ conceptName: concept.name, option: pick, percentLess })
  }

  return deals.sort((a, b) => b.percentLess - a.percentLess).slice(0, limit)
}
