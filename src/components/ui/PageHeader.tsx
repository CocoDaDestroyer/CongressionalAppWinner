import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-extrabold lg:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-[60ch] text-ink-muted">{description}</p>}
      </div>
      {actions}
    </header>
  )
}
