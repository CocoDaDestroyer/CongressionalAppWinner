import type { HTMLAttributes } from 'react'

/** The one container surface. Panels never nest inside each other. */
export function Panel({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`card ${className}`} {...rest} />
}
