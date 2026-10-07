import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'leaf' | 'warn' | 'community' | 'savings' | 'danger'

const TONES: Record<BadgeTone, string> = {
  neutral: 'text-ink-muted',
  leaf: 'text-leaf-ink',
  warn: 'text-warn',
  community: 'text-community',
  savings: 'text-savings',
  danger: 'text-danger',
}

interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
}

/** A small coloured label: text and an icon, no fill, so a row never turns into a pill wall. */
export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>
      {icon}
      {children}
    </span>
  )
}
