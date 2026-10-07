/** The CartWise mark: a produce sticker with a cart on it, plus the wordmark. */
interface LogoProps {
  /** `inverse` sits on the green shell; `brand` on the light ground. */
  tone?: 'brand' | 'inverse'
  showWordmark?: boolean
  className?: string
}

export function Logo({ tone = 'brand', showWordmark = true, className = '' }: LogoProps) {
  const sticker = tone === 'brand' ? 'fill-leaf' : 'fill-on-shell'
  const stroke = tone === 'brand' ? 'stroke-on-leaf' : 'stroke-shell'
  const fill = tone === 'brand' ? 'fill-on-leaf' : 'fill-shell'
  const word = tone === 'brand' ? 'text-ink' : 'text-on-shell'

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <g transform="rotate(-12 16 16)">
          <ellipse cx="16" cy="16" rx="15" ry="12.5" className={sticker} />
          <ellipse
            cx="16"
            cy="16"
            rx="12.6"
            ry="10.2"
            fill="none"
            strokeWidth="1"
            strokeOpacity="0.45"
            className={stroke}
          />
        </g>
        <path
          d="M8.6 10.6h2.3l2 8.2h8.5l1.9-6H11.9"
          fill="none"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={stroke}
        />
        <circle cx="14" cy="22.4" r="1.45" className={fill} />
        <circle cx="20.4" cy="22.4" r="1.45" className={fill} />
      </svg>
      {showWordmark && (
        <span className={`font-display text-xl font-bold tracking-tight ${word}`}>CartWise</span>
      )}
    </span>
  )
}
