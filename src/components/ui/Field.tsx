import type { ReactNode } from 'react'

/** Shared look for text inputs and selects. */
export const inputClass =
  'h-11 w-full rounded-control border border-line-strong bg-surface px-3 text-[15px] text-ink ' +
  'placeholder:text-ink-faint transition-colors hover:border-ink-faint focus:border-leaf focus:outline-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-leaf'

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
  className?: string
}

/** A visible label wrapping its control, so the label names it for assistive tech. */
export function Field({ label, children, hint, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  )
}
