import type { ReactNode } from 'react'

/** Shared look for text inputs and selects: raised paper, an inked border, a teal focus ring. */
export const inputClass =
  'h-12 w-full rounded-control border-[1.5px] border-rule-strong bg-paper-raised px-3 text-[15px] text-ink ' +
  'placeholder:text-ink-faint transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-teal'

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
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-mono text-xs text-ink-faint">{hint}</span>}
    </label>
  )
}
