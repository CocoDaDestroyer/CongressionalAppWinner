import { Check, Star, TrendingDown } from 'lucide-react'
import { explainPick, formatCents, formatShelfUnit, packageSize, type Comparison } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { UnitPrice } from '../UnitPrice'

interface BestValueCardProps {
  repo: CatalogRepository
  comparison: Comparison
}

/** The answer first: what to buy, where, and the one-line reason why. */
export function BestValueCard({ repo, comparison }: BestValueCardProps) {
  const pick = comparison.bestValue
  if (!pick) return null
  const cheapest = comparison.cheapest
  const reason = explainPick(comparison)

  return (
    <section aria-label="Best value" className="card p-5 sm:p-6">
      {/* Re-keyed on the pick, so a new winner visibly settles in. */}
      <div key={pick.key} className="animate-settle">
        <div className="flex items-start justify-between gap-3">
          <UnitPrice price={pick.normalized} size="hero" tone="leaf" />
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-soft px-2.5 py-1 text-xs font-semibold text-leaf-ink">
            <Check className="size-3.5" aria-hidden="true" />
            Best value
          </span>
        </div>
        <h2 className="mt-4 text-lg leading-snug font-semibold">{pick.pkg.displayName}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          {storeLabel(repo, pick.store)} · <span className="tabular">{formatCents(pick.priceCents)}</span>
          {pick.isMemberPrice && ' member price'}
        </p>
      </div>

      {reason && (
        <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
          <li className="flex items-center gap-2">
            <TrendingDown className="size-4 shrink-0 text-leaf" aria-hidden="true" />
            {reasonText(reason)}
          </li>
          {reason.stars !== null && (
            <li className="flex items-center gap-2 tabular">
              <Star className="size-4 shrink-0 fill-rating text-rating" aria-hidden="true" />
              {reason.stars.toFixed(1)} of 5 from {pick.reviewCount.toLocaleString('en-US')} reviews
            </li>
          )}
        </ul>
      )}

      {cheapest && cheapest.key !== pick.key && (
        <p className="mt-3 text-xs text-ink-faint">
          Cheapest per unit is {cheapest.pkg.displayName} at {formatShelfUnit(cheapest.normalized)}
          {cheapest.quality === null
            ? ', not yet reviewed.'
            : `, rated ${(Math.round(cheapest.quality * 50) / 10).toFixed(1)}.`}
        </p>
      )}
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
