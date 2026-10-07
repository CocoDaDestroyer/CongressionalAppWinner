/**
 * A number that rolls like an odometer when it changes (and once on mount).
 * The digit strips are CSS pseudo-elements; the DOM carries the plain value,
 * so screen readers and text queries read "$34.77", not "0123456789".
 */
import { useEffect, useState, type CSSProperties } from 'react'

interface NumeralProps {
  value: string
  className?: string
  /** Off when a parent already carries the readable value. */
  announce?: boolean
}

export function Numeral({ value, className = '', announce = true }: NumeralProps) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const chars = [...value]
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      {announce && <span className="sr-only">{value}</span>}
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
 * A price set like a shelf tag: the whole part large, the cents raised and
 * underlined with no decimal point, and an optional mono unit underneath them.
 * "14.0¢" prints as 14 over 0¢; "$34.77" as $34 over 77. The full value is
 * announced once for assistive tech.
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
  const cents = dot === -1 ? '' : value.slice(dot + 1)
  return (
    <span className={`relative inline-flex items-stretch ${className}`}>
      <span className="sr-only">
        {value}
        {unit ? ` ${unit}` : ''}
      </span>
      <Numeral value={whole} announce={false} />
      <span aria-hidden="true" className="ml-[0.05em] flex flex-col justify-between">
        {cents && (
          <Numeral
            value={cents}
            announce={false}
            className="mt-[0.05em] border-b-[0.06em] border-current pb-[0.04em] text-[0.42em] leading-none tracking-normal"
          />
        )}
        {unit && (
          <span className="pb-[0.04em] font-mono text-base leading-none font-medium tracking-normal text-ink-muted">
            {unit}
          </span>
        )}
      </span>
    </span>
  )
}
