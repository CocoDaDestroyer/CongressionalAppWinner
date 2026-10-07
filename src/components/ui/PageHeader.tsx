import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-8">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-semibold lg:text-[30px]">{title}</h1>
        {description && <p className="mt-1 max-w-[60ch] text-[15px] text-ink-muted">{description}</p>}
      </div>
      {actions}
    </header>
  )
}
