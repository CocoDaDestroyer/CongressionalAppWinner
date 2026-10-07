import type { HTMLAttributes } from 'react'

/** The one container: raised paper with a hairline rule. Panels never nest. */
export function Panel({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`sheet ${className}`} {...rest} />
}
