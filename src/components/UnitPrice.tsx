/**
 * A per-unit price, the number every comparison turns on: "14.0¢ /oz".
 * The canonical value rides along in <data> for anything that sorts or tests it.
 */
import { shelfUnitPrice } from '../lib/compare'
import type { NormalizedPrice } from '../lib/units'

const SIZES = {
  hero: { amount: 'text-[44px] leading-none', unit: 'text-base' },
  row: { amount: 'text-[17px] leading-tight', unit: 'text-xs' },
}

const TONES = {
  leaf: 'text-leaf',
  ink: 'text-ink',
  faint: 'text-ink-faint',
}

interface UnitPriceProps {
  price: NormalizedPrice
  size?: keyof typeof SIZES
  tone?: keyof typeof TONES
}

export function UnitPrice({ price, size = 'row', tone = 'ink' }: UnitPriceProps) {
  const { amount, unit } = shelfUnitPrice(price)
  const s = SIZES[size]
  return (
    <span className={`inline-flex items-baseline gap-1 whitespace-nowrap ${TONES[tone]}`}>
      <data value={price.perUnit} className={`numeral ${s.amount}`}>
        {amount}
      </data>
      <span className={`font-medium text-ink-muted ${s.unit}`}>{unit === 'each' ? 'each' : `/${unit}`}</span>
    </span>
  )
}
