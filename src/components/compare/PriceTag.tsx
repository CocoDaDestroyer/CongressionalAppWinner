/**
 * The hero: the best-value per-unit price printed as a shelf tag. It prints
 * out of its slot whenever the pick changes, and the numeral rolls.
 */
import { Star, TrendingDown } from 'lucide-react'
import {
  explainPick,
  formatCents,
  formatShelfUnit,
  packageSize,
  shelfUnitPrice,
  type Comparison,
} from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { Leader } from '../print/Leader'
import { PriceNumeral } from '../print/Numeral'
import { SaleTag } from '../print/SaleTag'

interface PriceTagProps {
  repo: CatalogRepository
  comparison: Comparison
}

export function PriceTag({ repo, comparison }: PriceTagProps) {
  const pick = comparison.bestValue
  if (!pick) return null
  const cheapest = comparison.cheapest
  const reason = explainPick(comparison)
  const { amount, unit } = shelfUnitPrice(pick.normalized)

  return (
    <section aria-label="Best value" className="relative pt-3 pr-3">
      <div
        key={pick.key}
        className="relative animate-tag-print rounded-tag border-[1.5px] border-ink bg-paper-raised px-5 pt-5 pb-5 tag-shadow sm:px-6"
      >
        <span aria-hidden="true" className="absolute top-4 left-4 size-3 rounded-full border-[1.5px] border-ink bg-paper" />
        <SaleTag tilt={4} className="absolute -top-3 right-4">
          Best per oz
        </SaleTag>

        <h2 className="pr-24 pl-6 font-display text-xl leading-tight font-bold tracking-[-0.02em]">
          {pick.pkg.displayName}
        </h2>
        <PriceNumeral
          value={amount}
          unit={unit === 'each' ? 'each' : `/${unit}`}
          className="mt-4 hero-numeral text-ink"
        />
        <Leader
          className="mt-4 font-mono text-sm text-ink-muted"
          label={storeLabel(repo, pick.store)}
          value={`${formatCents(pick.priceCents)}${pick.isMemberPrice ? ' member' : ''}`}
        />

        {reason && (
          <ul className="mt-4 flex flex-col gap-1.5 border-t border-rule pt-4 text-[15px]">
            <li className="flex items-center gap-2 font-semibold">
              <TrendingDown className="size-4 shrink-0 text-teal" aria-hidden="true" />
              {reasonText(reason)}
            </li>
            {reason.stars !== null && (
              <li className="flex items-center gap-2 text-ink-muted">
                <Star className="size-4 shrink-0 fill-rating text-rating" aria-hidden="true" />
                {reason.stars.toFixed(1)} of 5 from {pick.reviewCount.toLocaleString('en-US')} reviews
              </li>
            )}
          </ul>
        )}

        {cheapest && cheapest.key !== pick.key && (
          <p className="mt-3 font-mono text-xs text-ink-faint">
            Cheapest is {cheapest.pkg.displayName} at {formatShelfUnit(cheapest.normalized)}
            {cheapest.quality === null
              ? ', unreviewed.'
              : `, rated ${(Math.round(cheapest.quality * 50) / 10).toFixed(1)}.`}
          </p>
        )}
      </div>
    </section>
  )
}

function reasonText(reason: NonNullable<ReturnType<typeof explainPick>>): string {
  if (reason.percentLess === 0) return 'Best balance of price and reviews'
  if (reason.versus.kind === 'scanned') {
    return `${reason.percentLess}% less per unit than the ${packageSize(reason.versus.option.pkg)} you scanned`
  }
  return `${reason.percentLess}% below the typical price per unit`
}
