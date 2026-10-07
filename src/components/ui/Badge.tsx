import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'leaf' | 'warn' | 'community' | 'savings' | 'danger'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-sunken text-ink-muted',
  leaf: 'bg-leaf-soft text-leaf-ink',
  warn: 'bg-warn-soft text-warn-ink',
  community: 'bg-community-soft text-community-ink',
  savings: 'bg-savings-soft text-savings-ink',
  danger: 'bg-danger-soft text-danger-ink',
}

interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
}

export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold whitespace-nowrap ${TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  )
}
