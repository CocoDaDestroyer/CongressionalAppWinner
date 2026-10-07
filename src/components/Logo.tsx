/** The CartWise mark: the wordmark printed on a hanging shelf tag. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center rounded-tag border-[1.5px] border-ink bg-paper-raised py-1 pr-3 pl-7 ${className}`}
    >
      {/* The die-cut hole the tag hangs from. */}
      <span aria-hidden="true" className="absolute left-2.5 size-2.5 rounded-full border-[1.5px] border-ink bg-paper" />
      <span className="font-display text-[19px] leading-none font-extrabold tracking-[-0.03em] text-ink">
        CartWise
      </span>
    </span>
  )
}
