import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
}

/** Every page opens on its title over a full-width 2px ink rule. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4 lg:mb-9">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-2 max-w-[62ch] text-ink-muted">{description}</p>}
      </div>
      {actions}
    </header>
  )
}
