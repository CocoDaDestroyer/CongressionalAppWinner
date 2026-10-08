import { useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import type { Receipt } from '../../lib/catalog'
import { formatCents } from '../../lib/compare'
import { plural, shortDate, storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { catalogStore, lineTotalCents, receiptTotalCents } from '../../lib/store'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Panel } from '../ui/Panel'

const FIRST_PAGE = 5

interface SavedReceiptsProps {
  repo: CatalogRepository
  receipts: readonly Receipt[]
  /** A receipt just saved: its row gets a highlight sweep. */
  highlightId?: string | null
}

export function SavedReceipts({ repo, receipts, highlightId }: SavedReceiptsProps) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? receipts : receipts.slice(0, FIRST_PAGE)

  return (
    <Panel aria-labelledby="saved-title">
      <h2 id="saved-title" className="flex items-baseline justify-between border-b-2 border-ink px-4 py-3 section-title">
        Saved receipts
        {receipts.length > 0 && <span className="font-mono text-sm font-medium text-ink-muted">{receipts.length}</span>}
      </h2>

      {receipts.length === 0 ? (
        <EmptyState title="Nothing yet">
          Nothing yet. Saved receipts stay in this browser and feed your spending history.
        </EmptyState>
      ) : (
        <>
          <ul className="divide-y divide-dotted divide-rule">
            {shown.map((receipt) => (
              <li key={receipt.id} className="relative overflow-hidden">
                {receipt.id === highlightId && (
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 animate-sweep bg-teal/20" />
                )}
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-paper-sunken/60 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{storeLabel(repo, receipt.storeId)}</span>
                      <span className="font-mono text-xs text-ink-muted">
                        {shortDate(receipt.purchasedAt)} · {plural(receipt.lines.length, 'item')}
                        {receipt.photo && ' · photo'}
                      </span>
                    </span>
                    <span className="font-mono font-medium">{formatCents(receiptTotalCents(receipt))}</span>
                    <ChevronDown
                      className="size-4 text-ink-faint transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="bg-paper-sunken/50 px-4 pt-1 pb-3">
                    <ul className="font-mono text-sm">
                      {receipt.lines.map((line) => (
                        <li key={line.id} className="flex justify-between gap-3 py-1">
                          <span>
                            <span className="text-ink-muted tabular">{line.quantity}×</span>{' '}
                            {repo.getPackage(line.packageId)?.displayName ?? line.packageId}
                          </span>
                          <span className="tabular">{formatCents(lineTotalCents(line))}</span>
                        </li>
                      ))}
                    </ul>
                    {receipt.photo && (
                      <img
                        src={receipt.photo}
                        alt={`Photo of the ${storeLabel(repo, receipt.storeId)} receipt`}
                        className="mt-2 max-h-72 rounded-control border border-rule object-contain"
                      />
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-2"
                      icon={<Trash2 className="size-4" aria-hidden="true" />}
                      onClick={() => catalogStore.deleteReceipt(receipt.id)}
                    >
                      Delete receipt
                    </Button>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          {receipts.length > FIRST_PAGE && (
            <div className="border-t border-rule p-2">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Show recent only' : `Show all ${receipts.length} receipts`}
              </Button>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}
