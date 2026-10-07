import type { ReactNode } from 'react'

interface LeaderProps {
  label: ReactNode
  value: ReactNode
  className?: string
}

/** An itemized line: name, a dotted leader, and the value in mono. */
export function Leader({ label, value, className = '' }: LeaderProps) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="min-w-0">{label}</span>
      <span className="leader" aria-hidden="true" />
      <span className="shrink-0 font-mono tabular">{value}</span>
    </div>
  )
}
