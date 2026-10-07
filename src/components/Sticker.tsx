/**
 * The per-unit price as a produce sticker: CartWise's one signature shape.
 * The winner gets the filled sticker; everything else an outline, so the
 * eye lands on the right number before reading a word.
 */
import { shelfUnitPrice } from '../lib/compare'
import type { NormalizedPrice } from '../lib/units'

type Variant = 'winner' | 'plain' | 'locked'

const VARIANTS: Record<Variant, string> = {
  winner: 'bg-leaf text-on-leaf outline outline-1 -outline-offset-[5px] outline-on-leaf/45',
  plain: 'border-2 border-line-strong bg-surface text-ink',
  locked: 'border-2 border-dashed border-line-strong bg-surface text-ink-faint',
}

const SIZES = {
  lg: { box: 'h-28 w-36 -rotate-6', amount: 'text-[34px]', unit: 'text-xs' },
  md: { box: 'h-16 w-[5.5rem]', amount: 'text-xl', unit: 'text-[10px]' },
}

interface StickerProps {
  price: NormalizedPrice
  variant?: Variant
  size?: keyof typeof SIZES
  className?: string
}

export function Sticker({ price, variant = 'plain', size = 'md', className = '' }: StickerProps) {
  const { amount, unit } = shelfUnitPrice(price)
  const s = SIZES[size]
  return (
    <span
      className={`inline-flex shrink-0 flex-col items-center justify-center rounded-[50%] ${s.box} ${VARIANTS[variant]} ${className}`}
    >
      {/* The canonical per-unit value rides along for anything that sorts or tests it. */}
      <data
        value={price.perUnit}
        className={`font-display leading-none font-extrabold tracking-tight tabular ${s.amount}`}
      >
        {amount}
      </data>
      <span className={`mt-0.5 font-bold tracking-wide uppercase ${s.unit}`}>
        {unit === 'each' ? 'each' : `per ${unit}`}
      </span>
    </span>
  )
}
