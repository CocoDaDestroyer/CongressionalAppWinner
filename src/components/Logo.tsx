/** The CartWise mark: the wordmark printed on a shelf tag with its die-cut hole. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center rounded-tag border-[1.5px] border-ink bg-ink py-1 pr-3 pl-6 die-cut-left ${className}`}
    >
      <span className="font-display text-[19px] leading-none font-extrabold tracking-[-0.03em] text-paper">
        CartWise
      </span>
    </span>
  )
}
