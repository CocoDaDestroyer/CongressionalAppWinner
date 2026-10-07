import type { HTMLAttributes } from 'react'

/** The one container surface. Panels never nest inside each other. */
export function Panel({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-card border border-line bg-surface ${className}`} {...rest} />
}
