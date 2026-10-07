import type { CSSProperties, ReactNode } from 'react'
import { Numeral } from './Numeral'
import { SaleTag } from './SaleTag'

export interface LedgerEntry {
  label: string
  value: string
  detail?: ReactNode
  /** Money saved: the figure sits on a yellow tag. */
  saved?: boolean
}

/** Figures in one ruled row, like a ledger line, rather than a row of boxes. */
export function Ledger({ entries, className = '' }: { entries: LedgerEntry[]; className?: string }) {
  return (
    <dl
      style={{ '--cols': `repeat(${entries.length}, minmax(0, 1fr))` } as CSSProperties}
      className={`grid grid-cols-2 border-y-2 border-ink sm:grid-cols-(--cols) sm:divide-x sm:divide-rule ${className}`}
    >
      {entries.map((entry, i) => (
        <div
          key={entry.label}
          className={`px-4 py-4 sm:px-5 ${i % 2 === 1 ? 'border-l border-rule sm:border-l-0' : ''} ${i >= 2 ? 'border-t border-rule sm:border-t-0' : ''}`}
        >
          <dt className="font-mono text-xs text-ink-muted">{entry.label}</dt>
          <dd className="mt-2">
            {entry.saved ? (
              <SaleTag tilt={-2}>
                <Numeral value={entry.value} className="font-display text-2xl font-extrabold tracking-[-0.03em]" />
              </SaleTag>
            ) : (
              <Numeral value={entry.value} className="font-display text-[28px] leading-none font-extrabold tracking-[-0.03em]" />
            )}
          </dd>
          {entry.detail && <dd className="mt-2 font-mono text-xs text-ink-faint">{entry.detail}</dd>}
        </div>
      ))}
    </dl>
  )
}
