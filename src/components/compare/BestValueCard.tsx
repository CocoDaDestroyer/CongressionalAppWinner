import { Star, TrendingDown } from 'lucide-react'
import {
  explainPick,
  formatCents,
  formatShelfUnit,
  packageSize,
  type Comparison,
} from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { Sticker } from '../Sticker'

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
    <section
      aria-labelledby="best-value"
      className="rounded-card border border-leaf/25 bg-leaf-soft p-5 sm:p-6"
    >
      <div className="flex items-center gap-5">
        {/* Re-keyed on the pick, so a new winner visibly gets stuck on. */}
        <Sticker key={pick.key} price={pick.normalized} variant="winner" size="lg" className="animate-stick" />
        <div className="min-w-0">
          <h2 id="best-value" className="font-display text-xl leading-snug font-bold text-ink">
            Best value: <span className="text-leaf-ink">{pick.pkg.displayName}</span>
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {storeLabel(repo, pick.store)} · {formatCents(pick.priceCents)}
            {pick.isMemberPrice && ' member price'}
          </p>
        </div>
      </div>

      {reason && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold text-ink">
          <span className="inline-flex items-center gap-1.5">
            <TrendingDown className="size-4 text-leaf-ink" aria-hidden="true" />
            {reasonText(reason)}
          </span>
          {reason.stars !== null && (
            <span className="inline-flex items-center gap-1 tabular">
              <Star className="size-4 fill-rating text-rating" aria-hidden="true" />
              {reason.stars.toFixed(1)} of 5 from {pick.reviewCount.toLocaleString('en-US')} reviews
            </span>
          )}
        </p>
      )}

      {cheapest && cheapest.key !== pick.key && (
        <p className="mt-3 border-t border-leaf/20 pt-3 text-sm text-ink-muted">
          Lowest per unit: {cheapest.pkg.displayName} at {formatShelfUnit(cheapest.normalized)}
          {cheapest.quality === null
            ? ', not yet reviewed.'
            : `, rated ${(Math.round(cheapest.quality * 50) / 10).toFixed(1)} of 5.`}
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
