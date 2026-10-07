/**
 * Trip: which stores to visit and what to buy at each, with fuel for the
 * round trip counted against the savings.
 *
 * The headline is the total including fuel. The comparison beside it shows
 * the work: one stop, or the naive "buy everything wherever it is cheapest"
 * that ignores the drive.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, ListChecks, TriangleAlert } from 'lucide-react'
import { formatCents } from '../lib/compare'
import { DEFAULT_DRIVING_COST } from '../lib/geo'
import { plural, retailerName } from '../lib/labels'
import { formatMiles, optimizeTrip } from '../lib/trip'
import { useCatalog, useLinkedRetailers } from '../lib/useCatalog'
import { SEED_HOME } from '../data/seed'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState } from '../components/ui/EmptyState'
import { ListEditor } from '../components/trip/ListEditor'
import { PlanComparison } from '../components/trip/PlanComparison'
import { RouteMap } from '../components/trip/RouteMap'
import { StopCard } from '../components/trip/StopCard'

/** A weekly top-up: big enough that the planner has real choices to make. */
const STARTER_LIST: Record<string, number> = {
  'c-milk': 1,
  'c-ketchup': 1,
  'c-bread': 1,
  'c-pasta': 2,
  'c-coffee': 1,
  'c-yogurt': 1,
}

export function Trip() {
  const repo = useCatalog()
  const linked = useLinkedRetailers()
  const [quantities, setQuantities] = useState(STARTER_LIST)
  const [maxStores, setMaxStores] = useState(3)

  const concepts = useMemo(() => repo.getConcepts(), [repo])
  const list = useMemo(
    () => concepts.map((c) => ({ conceptId: c.id, quantity: quantities[c.id] ?? 0 })),
    [concepts, quantities],
  )

  const result = useMemo(
    () => optimizeTrip(repo, list, { home: SEED_HOME, maxStores, memberRetailerIds: linked }),
    [repo, list, maxStores, linked],
  )

  // What linking every card would save on this same trip: the nudge toward Profile.
  const withAllCards = useMemo(() => {
    const loyalty = repo.getRetailers().filter((r) => r.supportsLoyalty).map((r) => r.id)
    if (loyalty.every((id) => linked.includes(id))) return null
    return optimizeTrip(repo, list, { home: SEED_HOME, maxStores, memberRetailerIds: loyalty })
  }, [repo, list, maxStores, linked])

  const itemCount = list.reduce((sum, item) => sum + item.quantity, 0)

  function setQuantity(conceptId: string, quantity: number) {
    setQuantities((q) => ({ ...q, [conceptId]: Math.max(0, quantity) }))
  }

  const editor = (
    <ListEditor
      concepts={concepts}
      quantities={quantities}
      onChange={setQuantity}
      maxStores={maxStores}
      onMaxStoresChange={setMaxStores}
    />
  )

  if (!result) {
    return (
      <>
        <PageHeader title="Trip" description="Which stores to visit, and what to buy at each." />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel>
            <EmptyState icon={<ListChecks className="size-6" aria-hidden="true" />} title="Your list is empty">
              Add something to the list.
            </EmptyState>
          </Panel>
          {editor}
        </div>
      </>
    )
  }

  const { best, bestSingleStore } = result
  const savedVsOneStore = bestSingleStore ? bestSingleStore.totalCents - best.totalCents : 0
  const cardSavings = withAllCards ? best.totalCents - withAllCards.best.totalCents : 0
  const cardsToLink = withAllCards
    ? [
        ...new Set(
          withAllCards.best.purchases
            .filter((p) => p.option.isMemberPrice && !linked.includes(p.option.store.retailerId))
            .map((p) => retailerName(repo, p.option.store)),
        ),
      ]
    : []

  return (
    <>
      <PageHeader title="Trip" description="Which stores to visit, and what to buy at each, with the drive counted." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-6">
          <Panel aria-label="Trip total" className="p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink-muted">
                  Trip total for {plural(itemCount, 'item')}
                </p>
                <p className="font-display text-5xl leading-none font-extrabold tracking-tight tabular">
                  {formatCents(best.totalCents)}
                </p>
              </div>
              {savedVsOneStore >= 1 ? (
                <p className="rounded-full bg-savings-soft px-3 py-1.5 font-bold text-savings-ink">
                  You save {formatCents(savedVsOneStore)} vs. one store
                </p>
              ) : (
                <p className="rounded-full bg-leaf-soft px-3 py-1.5 font-bold text-leaf-ink">
                  One store is your best bet
                </p>
              )}
            </div>
            <p className="mt-3 text-sm text-ink-muted tabular">
              {formatCents(best.groceryCents)} groceries + {formatCents(best.drivingCents)} fuel ·{' '}
              {plural(best.stores.length, 'stop')} · {formatMiles(best.miles)} round trip
              <span className="lg:hidden">
                {' · '}
                <a href="#list" className="font-semibold text-leaf-ink underline">
                  Edit list
                </a>
              </span>
            </p>

            {cardSavings >= 1 && cardsToLink.length > 0 && (
              <Link
                to="/profile"
                className="mt-4 flex items-center gap-3 rounded-xl border border-leaf/25 bg-leaf-soft px-3 py-2.5 text-sm font-semibold text-leaf-ink hover:border-leaf/50"
              >
                <CreditCard className="size-5 shrink-0" aria-hidden="true" />
                Link your {cardsToLink.join(' and ')} {cardsToLink.length > 1 ? 'cards' : 'card'} to save{' '}
                {formatCents(cardSavings)} more on this trip
              </Link>
            )}
          </Panel>

          {best.unavailable.length > 0 && (
            <p role="status" className="flex items-center gap-2 rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn-ink">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              No store nearby has a price on file for {best.unavailable.join(', ')}.
            </p>
          )}

          <Panel className="grid gap-6 p-5 sm:p-6 xl:grid-cols-2">
            <RouteMap repo={repo} home={SEED_HOME} route={best.routeOrder} />
            <PlanComparison repo={repo} result={result} />
          </Panel>

          <section aria-labelledby="stops-title" className="flex flex-col gap-3">
            <h2 id="stops-title" className="text-lg font-bold">
              What to buy where
            </h2>
            <div className="grid gap-4 xl:grid-cols-2">
              {best.routeOrder.map((store, index) => (
                <StopCard
                  key={store.id}
                  repo={repo}
                  stop={index + 1}
                  store={store}
                  purchases={best.purchases.filter((p) => p.option.store.id === store.id)}
                />
              ))}
            </div>
            <p className="text-xs text-ink-faint">
              Fuel at {formatCents(DEFAULT_DRIVING_COST.gasPriceCentsPerGallon)}/gal and{' '}
              {DEFAULT_DRIVING_COST.milesPerGallon} mpg. Each item is the best balance of per-unit
              price and reviews among the stores on the route.
            </p>
          </section>
        </div>

        <div className="lg:sticky lg:top-10">{editor}</div>
      </div>
    </>
  )
}
