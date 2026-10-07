import { useState } from 'react'
import { ChevronDown, ReceiptText, Trash2 } from 'lucide-react'
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
}

export function SavedReceipts({ repo, receipts }: SavedReceiptsProps) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? receipts : receipts.slice(0, FIRST_PAGE)

  return (
    <Panel aria-labelledby="saved-title">
      <h2 id="saved-title" className="flex items-baseline justify-between border-b border-line px-4 py-3.5 font-semibold">
        Saved receipts
        {receipts.length > 0 && <span className="text-sm font-semibold text-ink-muted tabular">{receipts.length}</span>}
      </h2>

      {receipts.length === 0 ? (
        <EmptyState icon={<ReceiptText className="size-6" aria-hidden="true" />} title="Nothing yet">
          Nothing yet. Saved receipts stay in this browser and feed your spending history.
        </EmptyState>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {shown.map((receipt) => (
              <li key={receipt.id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-sunken/60 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{storeLabel(repo, receipt.storeId)}</span>
                      <span className="text-sm text-ink-muted">
                        {shortDate(receipt.purchasedAt)} · {plural(receipt.lines.length, 'item')}
                      </span>
                    </span>
                    <span className="numeral">{formatCents(receiptTotalCents(receipt))}</span>
                    <ChevronDown
                      className="size-4 text-ink-faint transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="bg-sunken/50 px-4 pt-1 pb-3">
                    <ul className="text-sm">
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
            <div className="border-t border-line p-2">
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
