/**
 * Trip: which stores to visit and what to buy at each, with fuel for the
 * round trip counted against the savings.
 *
 * The headline is the total including fuel. The comparison beside it shows
 * the work: one stop, or the naive "buy everything wherever it is cheapest"
 * that ignores the drive.
 */
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Share2, TriangleAlert } from 'lucide-react'
import { formatCents } from '../lib/compare'
import { DEFAULT_DRIVING_COST } from '../lib/geo'
import { plural, retailerName } from '../lib/labels'
import { shoppingList } from '../lib/list'
import { formatMiles, optimizeTrip, tripSummaryText } from '../lib/trip'
import { useCatalog, useLinkedRetailers, useShoppingList } from '../lib/useCatalog'
import { SEED_HOME } from '../data/seed'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Toast } from '../components/ui/Toast'
import { ListEditor } from '../components/trip/ListEditor'
import { PlanComparison } from '../components/trip/PlanComparison'
import { RouteMap } from '../components/trip/RouteMap'
import { TripReceipt } from '../components/trip/TripReceipt'
import { PriceNumeral } from '../components/print/Numeral'
import { SaleTag } from '../components/print/SaleTag'

export function Trip() {
  const repo = useCatalog()
  const linked = useLinkedRetailers()
  const quantities = useShoppingList()
  const [shareNotice, setShareNotice] = useState<string | null>(null)
  const closeNotice = useCallback(() => setShareNotice(null), [])
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
    shoppingList.set(conceptId, quantity)
  }

  async function share() {
    if (!result) return
    const text = tripSummaryText(repo, result)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My CartWise trip plan', text })
        return
      }
      await navigator.clipboard.writeText(text)
      setShareNotice('Trip plan copied. Paste it into a message.')
    } catch (error) {
      // Dismissing the share sheet rejects with AbortError; that is not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareNotice('Could not share from this browser.')
    }
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
        <PageHeader title="Trip" description="Where to shop and what to buy, with the drive counted." />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          <Panel>
            <EmptyState title="The cart is empty">Add something to the list.</EmptyState>
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
      <PageHeader title="Trip" description="Where to shop and what to buy, with the drive counted." />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-8">
          <section aria-label="Trip total">
            <p className="font-mono text-sm text-ink-muted">Trip total, {plural(itemCount, 'item')}</p>
            <PriceNumeral value={formatCents(best.totalCents)} className="mt-2 hero-numeral" />
            <div className="mt-5">
              {savedVsOneStore >= 1 ? (
                <SaleTag tilt={-2}>You save {formatCents(savedVsOneStore)} vs. one store</SaleTag>
              ) : (
                <p className="font-semibold text-teal">One store is your best bet</p>
              )}
            </div>
            <p className="mt-4 font-mono text-sm text-ink-muted">
              {formatCents(best.groceryCents)} groceries + {formatCents(best.drivingCents)} fuel ·{' '}
              {plural(best.stores.length, 'stop')} · {formatMiles(best.miles)}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              icon={<Share2 className="size-4" aria-hidden="true" />}
              onClick={share}
            >
              Share plan
            </Button>
            {cardSavings >= 1 && cardsToLink.length > 0 && (
              <Link
                to="/profile"
                viewTransition
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal underline-offset-4 hover:underline"
              >
                <CreditCard className="size-4 shrink-0" aria-hidden="true" />
                Link your {cardsToLink.join(' and ')} {cardsToLink.length > 1 ? 'cards' : 'card'} to save{' '}
                {formatCents(cardSavings)} more
              </Link>
            )}
          </section>

          {best.unavailable.length > 0 && (
            <p role="status" className="flex items-center gap-2 text-sm text-amber">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              No store nearby has a price on file for {best.unavailable.join(', ')}.
            </p>
          )}

          <Panel className="flex flex-col gap-8 p-5 sm:p-6">
            <RouteMap repo={repo} home={SEED_HOME} route={best.routeOrder} />
            <PlanComparison repo={repo} result={result} />
          </Panel>
          <p className="text-xs text-ink-faint">
            Fuel at {formatCents(DEFAULT_DRIVING_COST.gasPriceCentsPerGallon)}/gal, {DEFAULT_DRIVING_COST.milesPerGallon} mpg.
            Each item is the best balance of per-unit price and reviews among the stores on the route.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <TripReceipt repo={repo} result={result} savedVsOneStore={savedVsOneStore} />
          {editor}
        </div>
      </div>
      {shareNotice && <Toast onClose={closeNotice}>{shareNotice}</Toast>}
    </>
  )
}
