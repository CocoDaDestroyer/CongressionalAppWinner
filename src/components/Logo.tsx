/** The CartWise mark (a cart in a rounded green tile) and the wordmark. */
interface LogoProps {
  showWordmark?: boolean
  className?: string
}

export function Logo({ showWordmark = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-leaf" />
        <path
          d="M8.5 10h2.4l2.1 8.6h8.6l2-6.3H11.9"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-on-leaf"
        />
        <circle cx="14" cy="22.6" r="1.5" className="fill-on-leaf" />
        <circle cx="20.6" cy="22.6" r="1.5" className="fill-on-leaf" />
      </svg>
      {showWordmark && <span className="text-[17px] font-semibold tracking-tight text-ink">CartWise</span>}
    </span>
  )
}
