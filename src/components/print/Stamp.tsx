import type { ReactNode } from 'react'

export type StampTone = 'ink' | 'teal' | 'community' | 'amber' | 'brick'

const TONES: Record<StampTone, string> = {
  ink: 'text-ink-muted',
  teal: 'text-teal',
  community: 'text-community',
  amber: 'text-amber',
  brick: 'text-brick',
}

interface StampProps {
  tone?: StampTone
  icon?: ReactNode
  /** Fixed per stamp, never random per render, so it reads as printed. */
  tilt?: number
  children: ReactNode
}

/** A provenance stamp: mono, uppercase, inked border. The one place uppercase is allowed. */
export function Stamp({ tone = 'ink', icon, tilt = -2, children }: StampProps) {
  return (
    <span
      style={{ rotate: `${tilt}deg` }}
      className={`inline-flex animate-stamp items-center gap-1 rounded-tag border border-current px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium tracking-wide whitespace-nowrap uppercase ${TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  )
}
