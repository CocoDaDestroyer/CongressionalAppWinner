/**
 * A number that rolls like an odometer when it changes (and once on mount).
 * The digit strips are CSS pseudo-elements; the DOM carries the plain value,
 * so screen readers and text queries read "$34.77", not "0123456789".
 */
import { useEffect, useState, type CSSProperties } from 'react'

interface NumeralProps {
  value: string
  className?: string
}

export function Numeral({ value, className = '' }: NumeralProps) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const chars = [...value]
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {chars.map((ch, i) => {
          // Keyed from the right, so "$9.99" -> "$10.49" keeps the cents columns in place.
          const key = chars.length - i
          return /\d/.test(ch) ? (
            <span
              key={key}
              className="odometer-digit"
              style={{ '--d': ready ? ch : 0, '--delay': `${(chars.length - i) * 30}ms` } as CSSProperties}
            />
          ) : (
            <span key={key}>{ch}</span>
          )
        })}
      </span>
    </span>
  )
}

/**
 * A price set like a shelf tag: the whole part large, the fraction as a
 * superscript at 40%, and an optional mono unit. "14.0¢" -> 14 ^.0¢ /oz.
 */
export function PriceNumeral({
  value,
  unit,
  className = '',
}: {
  value: string
  unit?: string
  className?: string
}) {
  const dot = value.indexOf('.')
  const whole = dot === -1 ? value : value.slice(0, dot)
  const fraction = dot === -1 ? '' : value.slice(dot)
  return (
    <span className={`inline-flex items-stretch ${className}`}>
      <Numeral value={whole} />
      {/* Fraction up top like a shelf tag's cents, the unit tucked underneath it. */}
      <span className="ml-[0.04em] flex flex-col justify-between">
        {fraction && <Numeral value={fraction} className="mt-[0.04em] text-[0.42em] leading-none" />}
        {unit && (
          <span className="pb-[0.04em] font-mono text-base leading-none font-medium tracking-normal text-ink-muted">
            {unit}
          </span>
        )}
      </span>
    </span>
  )
}
