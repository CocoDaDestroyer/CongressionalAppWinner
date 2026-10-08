/**
 * How the best-value pick's shelf price has moved at its store: a sparkline of
 * every public observation (scrapes and receipts), with the net change.
 */
import { formatCents, packageSize, type CompareOption } from '../../lib/compare'
import { priceHistory } from '../../lib/history'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'

const W = 300
const H = 72
const PAD = 6

export function PriceHistory({ repo, option }: { repo: CatalogRepository; option: CompareOption }) {
  const history = priceHistory(repo, option.pkg.id, option.store.id)
  if (!history) return null

  const { points, lowCents, highCents, percentChange, spanDays } = history
  const first = points[0].at
  const span = Math.max(1, points[points.length - 1].at - first)
  const range = Math.max(1, highCents - lowCents)
  const x = (at: number) => PAD + ((at - first) / span) * (W - 2 * PAD)
  const y = (cents: number) => H - PAD - ((cents - lowCents) / range) * (H - 2 * PAD)
  const line = points.map((p) => `${x(p.at).toFixed(1)},${y(p.priceCents).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]

  const months = Math.max(1, Math.round(spanDays / 30))
  const trend =
    percentChange === 0
      ? `Flat over ${months} ${months === 1 ? 'month' : 'months'}`
      : `${percentChange < 0 ? 'Down' : 'Up'} ${Math.abs(percentChange)}% over ${months} ${months === 1 ? 'month' : 'months'}`

  return (
    <figure className="sheet m-0 p-5">
      <figcaption>
        <p className="font-display text-lg font-bold tracking-[-0.02em]">Price history</p>
        <p className="text-sm text-ink-muted">
          {packageSize(option.pkg)} at {storeLabel(repo, option.store)}
        </p>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${trend}, from ${formatCents(points[0].priceCents)} to ${formatCents(last.priceCents)}`}
        className="mt-3 h-auto w-full text-ink"
      >
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last.at)} cy={y(last.priceCents)} r="4.5" className="fill-teal stroke-paper-raised" strokeWidth="2" />
      </svg>
      <div className="mt-2 flex items-baseline justify-between gap-3 font-mono text-sm">
        <span className={`font-semibold ${percentChange < 0 ? 'text-teal' : percentChange > 0 ? 'text-brick' : 'text-ink-muted'}`}>
          {trend}
        </span>
        <span className="text-ink-muted">
          {formatCents(lowCents)}–{formatCents(highCents)}
        </span>
      </div>
    </figure>
  )
}
