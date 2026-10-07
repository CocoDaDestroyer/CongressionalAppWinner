import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  children: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-3 text-ink-faint">{icon}</span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-[40ch] text-sm text-ink-muted">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
