/**
 * How much the shopper saved, measured the way the rest of the app measures
 * price: per unit.
 *
 * For each receipt line, the yardstick is the typical (median) per-unit price
 * of that product across every package and store the catalog currently knows.
 * Paying less per unit than that, by buying the bigger package or shopping at
 * the cheaper store, counts as saved. Paying more counts as nothing rather
 * than as a loss, so one splurge does not wipe out a month of good choices.
 */
import type { Receipt } from './catalog'
import type { CatalogRepository } from './repository'
import { monthOf } from './spending'
import { normalize, toCanonical } from './units'

/** Median public per-unit price (cents per canonical unit) for a concept. */
export function typicalPerUnit(repo: CatalogRepository, conceptId: string): number | null {
  const packages = repo.getSiblingPackages(conceptId)
  const byId = new Map(packages.map((p) => [p.id, p]))
  const perUnits = repo
    .getCurrentPrices(packages.map((p) => p.id))
    .filter((price) => !price.isMemberPrice)
    .map((price) => {
      const pkg = byId.get(price.packageId)!
      return normalize(price.priceCents, pkg.size, pkg.unit).perUnit
    })
    .sort((a, b) => a - b)

  if (perUnits.length === 0) return null
  const middle = Math.floor(perUnits.length / 2)
  return perUnits.length % 2 === 1
    ? perUnits[middle]
    : (perUnits[middle - 1] + perUnits[middle]) / 2
}

/** Cents saved on one receipt against typical per-unit prices. */
export function receiptSavingsCents(repo: CatalogRepository, receipt: Receipt): number {
  let saved = 0
  for (const line of receipt.lines) {
    const pkg = repo.getPackage(line.packageId)
    if (!pkg) continue
    const typical = typicalPerUnit(repo, pkg.conceptId)
    if (typical === null) continue

    const paid = normalize(line.unitPriceCents, pkg.size, pkg.unit).perUnit
    const amount = toCanonical(pkg.size, pkg.unit)
    saved += Math.max(0, (typical - paid) * amount) * line.quantity
  }
  return Math.round(saved)
}

/** Total saved across receipts in the given `YYYY-MM` month. */
export function savingsInMonth(
  repo: CatalogRepository,
  receipts: readonly Receipt[],
  month: string,
): number {
  return receipts
    .filter((r) => monthOf(r.purchasedAt) === month)
    .reduce((sum, r) => sum + receiptSavingsCents(repo, r), 0)
}
