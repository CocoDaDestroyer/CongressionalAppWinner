/**
 * The trip planner.
 *
 * Build a list, get back which stores to visit and what to buy at each. The
 * headline number is the total including fuel, and the two comparison plans
 * beside it exist to show the work: one stop, or the naive "buy everything
 * wherever it is cheapest" that ignores the drive.
 *
 * Styling is deliberately plain; design comes later.
 */
import { useMemo, useState } from 'react'
import { formatCents, formatPerUnit } from '../lib/compare'
import { formatMiles, optimizeTrip, type TripPlan } from '../lib/trip'
import { useCatalog } from '../lib/useCatalog'
import * as seed from '../data/seed'

const CONCEPTS = seed.concepts

const INITIAL_QUANTITIES: Record<string, number> = {
  'c-eggs': 2,
  'c-milk': 2,
  'c-rice': 1,
  'c-ketchup': 1,
  'c-olive-oil': 0,
}

export function ShoppingList() {
  const repo = useCatalog()
  const [quantities, setQuantities] = useState(INITIAL_QUANTITIES)
  const [maxStores, setMaxStores] = useState(3)
  const [hasRalphsCard, setHasRalphsCard] = useState(false)

  const result = useMemo(
    () =>
      optimizeTrip(
        repo,
        CONCEPTS.map((c) => ({ conceptId: c.id, quantity: quantities[c.id] ?? 0 })),
        {
          home: seed.SEED_HOME,
          maxStores,
          memberRetailerIds: hasRalphsCard ? ['r-ralphs'] : [],
        },
      ),
    [repo, quantities, maxStores, hasRalphsCard],
  )

  function setQuantity(conceptId: string, quantity: number) {
    setQuantities((q) => ({ ...q, [conceptId]: Math.max(0, quantity) }))
  }

  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold">Shopping list</h1>
      <p className="mt-1 max-w-prose text-sm text-gray-600">
        Which stores to visit and what to buy at each, with fuel for the round
        trip counted against the savings. Distances are straight-line estimates
        from Westwood, not driving directions.
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-8">
        <div>
          <h2 className="text-sm font-medium">List</h2>
          <ul className="mt-2 space-y-1">
            {CONCEPTS.map((concept) => (
              <li key={concept.id} className="flex items-center gap-2 text-sm">
                <button
                  className="border px-2"
                  onClick={() => setQuantity(concept.id, (quantities[concept.id] ?? 0) - 1)}
                  aria-label={`One fewer ${concept.name}`}
                >
                  -
                </button>
                <span className="w-6 text-center tabular-nums">
                  {quantities[concept.id] ?? 0}
                </span>
                <button
                  className="border px-2"
                  onClick={() => setQuantity(concept.id, (quantities[concept.id] ?? 0) + 1)}
                  aria-label={`One more ${concept.name}`}
                >
                  +
                </button>
                <span>{concept.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="block text-gray-600">Stores willing to visit: {maxStores}</span>
            <input
              className="mt-1 w-48"
              type="range"
              min={1}
              max={4}
              step={1}
              value={maxStores}
              onChange={(e) => setMaxStores(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasRalphsCard}
              onChange={(e) => setHasRalphsCard(e.target.checked)}
            />
            <span>I have a Ralphs card</span>
          </label>
        </div>
      </div>

      {!result ? (
        <p className="mt-6 text-sm">Add something to the list.</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-4">
            <PlanSummary label="Best plan" plan={result.best} highlight />
            <PlanSummary
              label="If you only stop once"
              plan={result.bestSingleStore}
              baseline={result.best}
            />
            <PlanSummary
              label="Chasing every lowest price"
              plan={result.ignoringTravel}
              baseline={result.best}
            />
          </div>

          {result.best.unavailable.length > 0 && (
            <p className="mt-3 text-sm text-amber-700">
              No price on file for: {result.best.unavailable.join(', ')}.
            </p>
          )}

          <h2 className="mt-6 text-sm font-medium">
            Route: {['Home', ...result.best.routeOrder.map(storeLabel), 'Home'].join(' -> ')}
          </h2>

          {result.best.stores.map((store) => (
            <div key={store.id} className="mt-4">
              <h3 className="text-sm font-medium">{storeLabel(store)}</h3>
              <div className="text-xs text-gray-500">{store.address}</div>
              <table className="mt-1 w-full max-w-3xl border-collapse text-sm">
                <tbody>
                  {result.best.purchases
                    .filter((p) => p.option.store.id === store.id)
                    .map((purchase) => (
                      <tr key={purchase.conceptId} className="border-b">
                        <td className="py-1 pr-4 w-8 tabular-nums">
                          {purchase.quantity}x
                        </td>
                        <td className="py-1 pr-4">
                          {purchase.option.pkg.displayName}
                          {purchase.option.isMemberPrice && (
                            <span className="ml-1 text-xs text-gray-500">(member)</span>
                          )}
                        </td>
                        <td className="py-1 pr-4 text-gray-600">
                          {formatPerUnit(purchase.option.normalized)}
                        </td>
                        <td className="py-1 text-right tabular-nums">
                          {formatCents(purchase.lineTotalCents)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </section>
  )
}

function storeLabel(store: { retailerId: string; address: string }): string {
  const retailer = seed.retailers.find((r) => r.id === store.retailerId)?.name ?? 'Store'
  // Two Ralphs in the seed, so the city is what tells them apart.
  const city = store.address.split(',').slice(-2, -1)[0]?.trim() ?? ''
  return city ? `${retailer} (${city})` : retailer
}

function PlanSummary({
  label,
  plan,
  baseline,
  highlight = false,
}: {
  label: string
  plan: TripPlan | null
  baseline?: TripPlan
  highlight?: boolean
}) {
  if (!plan) return null
  const difference = baseline ? plan.totalCents - baseline.totalCents : 0

  return (
    <div className={highlight ? 'border-2 border-black p-3 text-sm' : 'border p-3 text-sm'}>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-medium tabular-nums">
        {formatCents(plan.totalCents)}
      </div>
      <div className="text-gray-600">
        {formatCents(plan.groceryCents)} groceries + {formatCents(plan.drivingCents)} fuel
      </div>
      <div className="text-gray-600">
        {plan.stores.length} stop{plan.stores.length === 1 ? '' : 's'},{' '}
        {formatMiles(plan.miles)}
      </div>
      {baseline && difference !== 0 && (
        <div className={difference > 0 ? 'mt-1 text-red-700' : 'mt-1 text-green-700'}>
          {difference > 0 ? '+' : ''}
          {formatCents(difference)} vs. best
        </div>
      )}
    </div>
  )
}
