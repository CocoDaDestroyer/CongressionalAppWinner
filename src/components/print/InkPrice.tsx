/**
 * Ink that ages: a per-unit price whose ink fades with the age of its
 * evidence. Fresh prices print in full ink, aging ones go muted, stale ones go
 * faint with a brick underline. The <data> carries the canonical value.
 */
import { freshnessOf, shelfUnitPrice, type Freshness } from '../../lib/compare'
import type { NormalizedPrice } from '../../lib/units'

const INK: Record<Freshness, string> = {
  fresh: 'text-ink',
  aging: 'text-ink-muted',
  stale: 'text-ink-faint underline decoration-brick decoration-2 underline-offset-4',
}

interface InkPriceProps {
  price: NormalizedPrice
  ageDays: number
  /** The recommended option prints in teal whatever its age. */
  pick?: boolean
  locked?: boolean
}

export function InkPrice({ price, ageDays, pick = false, locked = false }: InkPriceProps) {
  const { amount, unit } = shelfUnitPrice(price)
  const age = freshnessOf(ageDays)
  const ink = pick ? 'text-teal' : locked ? 'text-ink-faint' : INK[age]
  return (
    <span data-age={age} className={`inline-flex items-baseline gap-0.5 font-mono whitespace-nowrap ${ink}`}>
      <data value={price.perUnit} className="text-[17px] font-medium tabular">
        {amount}
      </data>
      <span className="text-xs">{unit === 'each' ? ' each' : `/${unit}`}</span>
    </span>
  )
}
