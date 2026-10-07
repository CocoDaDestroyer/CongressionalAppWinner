import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: string
  detail?: ReactNode
  tone?: 'ink' | 'savings'
}

export function StatTile({ label, value, detail, tone = 'ink' }: StatTileProps) {
  return (
    <div className="card p-4 lg:p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className={`mt-1 numeral text-[26px] leading-tight ${tone === 'savings' ? 'text-savings' : 'text-ink'}`}>
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-ink-faint">{detail}</p>}
    </div>
  )
}
