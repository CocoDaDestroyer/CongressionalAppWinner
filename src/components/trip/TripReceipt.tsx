/**
 * The plan printed as a thermal receipt: items grouped by stop, a fuel line,
 * the total under a double rule, and whether chasing the cheapest shelves
 * would have been worth the drive.
 */
import { formatCents } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { formatMiles, type TripComparison } from '../../lib/trip'
import { Leader } from '../print/Leader'
import { ReceiptBlock, ReceiptTotal } from '../print/ReceiptBlock'
import { SaleTag } from '../print/SaleTag'

interface TripReceiptProps {
  repo: CatalogRepository
  result: TripComparison
  savedVsOneStore: number
}

export function TripReceipt({ repo, result, savedVsOneStore }: TripReceiptProps) {
  const { best, ignoringTravel } = result
  const chaseDelta = ignoringTravel ? ignoringTravel.totalCents - best.totalCents : 0

  return (
    <ReceiptBlock aria-label="Trip receipt">
      <p className="text-center text-xs tracking-[0.2em] text-ink-muted uppercase">CartWise trip plan</p>
      <div className="my-4 border-t border-dashed border-ink" />

      <ol className="flex flex-col gap-4">
        {best.routeOrder.map((store, index) => (
          <li key={store.id}>
            <p className="font-sans font-semibold">
              <span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-ink font-mono text-[11px] text-paper">
                {index + 1}
              </span>
              {storeLabel(repo, store)}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1 text-sm">
              {best.purchases
                .filter((p) => p.option.store.id === store.id)
                .map((p) => (
                  <li key={p.conceptId}>
                    <Leader
                      label={
                        <>
                          {p.quantity}× {p.option.pkg.displayName}
                          {p.option.isMemberPrice && <span className="ml-1.5 text-teal">Member price</span>}
                        </>
                      }
                      value={formatCents(p.lineTotalCents)}
                    />
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="my-4 border-t border-dashed border-ink" />
      <div className="flex flex-col gap-1 text-sm">
        <Leader label="Groceries" value={formatCents(best.groceryCents)} />
        <Leader label={`Fuel, ${formatMiles(best.miles)}`} value={formatCents(best.drivingCents)} />
      </div>
      <ReceiptTotal label="Total">{formatCents(best.totalCents)}</ReceiptTotal>

      {savedVsOneStore >= 1 && (
        <div className="mt-5 flex justify-center">
          <SaleTag tilt={-2}>Net of fuel: {formatCents(savedVsOneStore)} saved</SaleTag>
        </div>
      )}
      {ignoringTravel && (
        <p className="mt-5 text-center text-sm text-ink-muted">
          Worth the drive? Chasing every lowest price costs{' '}
          {chaseDelta > 0.5 ? `${formatCents(chaseDelta)} more` : 'the same'}.
        </p>
      )}
    </ReceiptBlock>
  )
}
