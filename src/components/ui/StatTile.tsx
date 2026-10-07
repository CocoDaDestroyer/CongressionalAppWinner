import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: string
  detail?: ReactNode
  tone?: 'ink' | 'savings'
}

export function StatTile({ label, value, detail, tone = 'ink' }: StatTileProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-sm font-semibold text-ink-muted">{label}</p>
      <p
        className={`mt-1 font-display text-[28px] leading-tight font-extrabold tracking-tight tabular ${tone === 'savings' ? 'text-savings-ink' : 'text-ink'}`}
      >
        {value}
      </p>
      {detail && <p className="mt-0.5 text-xs text-ink-muted">{detail}</p>}
    </div>
  )
}
