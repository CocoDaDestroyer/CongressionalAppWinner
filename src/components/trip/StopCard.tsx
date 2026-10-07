import { CreditCard } from 'lucide-react'
import type { Store } from '../../lib/catalog'
import { formatCents, formatShelfUnit } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import type { Purchase } from '../../lib/trip'
import { Panel } from '../ui/Panel'

interface StopCardProps {
  repo: CatalogRepository
  stop: number
  store: Store
  purchases: Purchase[]
}

export function StopCard({ repo, stop, store, purchases }: StopCardProps) {
  const subtotal = purchases.reduce((sum, p) => sum + p.lineTotalCents, 0)
  return (
    <Panel aria-label={`Stop ${stop}: ${storeLabel(repo, store)}`}>
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-leaf font-display text-sm font-extrabold text-on-leaf">
          {stop}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{storeLabel(repo, store)}</h3>
          <p className="truncate text-xs text-ink-muted">{store.address}</p>
        </div>
        <span className="font-display font-bold tabular">{formatCents(subtotal)}</span>
      </header>
      <ul className="divide-y divide-line">
        {purchases.map((p) => (
          <li key={p.conceptId} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-7 shrink-0 font-semibold text-ink-muted tabular">{p.quantity}×</span>
            <span className="min-w-0 flex-1">
              <span className="block leading-snug">{p.option.pkg.displayName}</span>
              <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                {formatShelfUnit(p.option.normalized)}
                {p.option.isMemberPrice && (
                  <span className="inline-flex items-center gap-1 font-semibold text-leaf-ink">
                    <CreditCard className="size-3" aria-hidden="true" /> Member price
                  </span>
                )}
              </span>
            </span>
            <span className="font-semibold tabular">{formatCents(p.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
