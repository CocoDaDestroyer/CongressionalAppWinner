import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

/** An empty shelf: a blank tag drawn in line, and one dry sentence about what to do. */
export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <svg viewBox="0 0 64 40" className="mb-4 h-10 w-16 text-ink-faint" aria-hidden="true">
        <path d="M2 4h52l8 8v24H2z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 26h20M10 31h12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
      </svg>
      <h2 className="section-title">{title}</h2>
      <p className="mt-1 max-w-[40ch] text-sm text-ink-muted">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
