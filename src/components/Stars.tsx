import { Star } from 'lucide-react'

/** Review sentiment as "4.5" with a star, or a quiet "no reviews". */
export function Stars({ quality, reviewCount }: { quality: number | null; reviewCount?: number }) {
  if (quality === null) {
    return <span className="font-mono text-xs text-ink-faint">no reviews</span>
  }
  const stars = (Math.round(quality * 50) / 10).toFixed(1)
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-xs text-ink-muted tabular"
      aria-label={`Rated ${stars} out of 5${reviewCount ? ` from ${reviewCount.toLocaleString('en-US')} reviews` : ''}`}
    >
      <Star className="size-3 fill-rating text-rating" aria-hidden="true" />
      {stars}
    </span>
  )
}
