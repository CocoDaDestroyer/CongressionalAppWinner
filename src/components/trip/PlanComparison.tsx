/**
 * The punchline: the optimized plan against the two tempting alternatives.
 * Each bar splits groceries from fuel, so "cheaper shelves, longer drive"
 * reads at a glance.
 */
import { formatCents } from '../../lib/compare'
import { plural, storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { formatMiles, type TripComparison, type TripPlan } from '../../lib/trip'

interface PlanComparisonProps {
  repo: CatalogRepository
  result: TripComparison
}

export function PlanComparison({ repo, result }: PlanComparisonProps) {
  const rows: { label: string; plan: TripPlan }[] = [{ label: 'Your plan', plan: result.best }]
  if (result.ignoringTravel) {
    rows.push({ label: 'Chase every lowest price', plan: result.ignoringTravel })
  }
  if (result.bestSingleStore) {
    rows.push({
      label: `Only ${storeLabel(repo, result.bestSingleStore.stores[0])}`,
      plan: result.bestSingleStore,
    })
  }
  const max = Math.max(...rows.map((r) => r.plan.totalCents))

  return (
    <section aria-labelledby="plan-comparison">
      <h2 id="plan-comparison" className="section-title">
        Why this plan
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Groceries plus fuel for the round trip, against the two obvious alternatives.
      </p>

      <ul className="mt-4 flex flex-col gap-4">
        {rows.map(({ label, plan }, index) => {
          const delta = plan.totalCents - result.best.totalCents
          const isBest = index === 0
          return (
            <li key={label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className={`font-semibold ${isBest ? 'text-ink' : 'text-ink-muted'}`}>{label}</span>
                <span className="flex items-baseline gap-2 tabular">
                  {!isBest && (
                    <span className="text-sm font-semibold text-ink-muted">
                      {delta > 0.5 ? `+${formatCents(delta)}` : 'same'}
                    </span>
                  )}
                  <data value={Math.round(plan.totalCents)} className="font-mono text-[17px] font-medium tabular">
                    {formatCents(plan.totalCents)}
                  </data>
                </span>
              </div>
              <div
                className="mt-1.5 flex h-2.5 overflow-hidden rounded-[1px] bg-paper-sunken"
                role="img"
                aria-label={`${formatCents(plan.groceryCents)} groceries and ${formatCents(plan.drivingCents)} fuel`}
              >
                <span
                  className={isBest ? 'bg-teal' : 'bg-ink'}
                  style={{ width: `${(plan.groceryCents / max) * 100}%` }}
                />
                <span
                  className="border-l-2 border-paper-raised bg-amber"
                  style={{ width: `${Math.max((plan.drivingCents / max) * 100, 1)}%` }}
                />
              </div>
              <p className="mt-1 font-mono text-xs text-ink-muted">
                {formatCents(plan.groceryCents)} groceries + {formatCents(plan.drivingCents)} fuel ·{' '}
                {plural(plan.stores.length, 'stop')} · {formatMiles(plan.miles)}
              </p>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
        <span className="inline-block h-2 w-4 rounded-[1px] bg-teal" aria-hidden="true" /> Groceries
        <span className="ml-2 inline-block h-2 w-4 rounded-[1px] bg-amber" aria-hidden="true" /> Fuel
      </p>
    </section>
  )
}
