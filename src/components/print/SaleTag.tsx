import type { ReactNode } from 'react'

interface SaleTagProps {
  children: ReactNode
  /** Slight fixed rotation, like a tag stuck on by hand. */
  tilt?: number
  size?: 'sm' | 'md'
  className?: string
}

/** Shelf-tag yellow: a filled tag with ink text. It only ever marks money saved. */
export function SaleTag({ children, tilt = 0, size = 'md', className = '' }: SaleTagProps) {
  const sizing = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
  return (
    <span
      style={{ rotate: `${tilt}deg` }}
      className={`inline-flex items-center gap-1.5 rounded-tag border-[1.5px] border-ink bg-tag font-semibold text-on-tag tag-shadow ${sizing} ${className}`}
    >
      {children}
    </span>
  )
}
