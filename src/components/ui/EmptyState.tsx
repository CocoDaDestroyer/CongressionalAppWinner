import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  children: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-leaf-soft text-leaf-ink">
        {icon}
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 max-w-[42ch] text-sm text-ink-muted">{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
