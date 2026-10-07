/**
 * Value frontier: every reviewed option by price per unit (x) and review score
 * (y). The ink line joins the options nothing beats on both at once, which is
 * where the best value always sits. Lazy-loaded with the chart library.
 */
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { formatShelfUnit, shelfUnitCents, type Comparison, type CompareOption } from '../../lib/compare'

interface Point {
  key: string
  name: string
  price: number
  stars: number
  label: string
}

function toPoint(option: CompareOption): Point {
  return {
    key: option.key,
    name: option.pkg.displayName,
    price: Math.round(shelfUnitCents(option.normalized) * 10) / 10,
    stars: Math.round((option.quality ?? 0) * 50) / 10,
    label: `${formatShelfUnit(option.normalized)} · ${option.retailerName}`,
  }
}

/** Options no other option beats on both price and reviews, cheapest first. */
function frontier(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.price - b.price || b.stars - a.stars)
  const kept: Point[] = []
  for (const p of sorted) {
    if (kept.length === 0 || p.stars > kept[kept.length - 1].stars) kept.push(p)
  }
  return kept
}

export default function ValueFrontier({ comparison }: { comparison: Comparison }) {
  const points = comparison.options.filter((o) => o.quality !== null && !o.memberLocked).map(toPoint)
  if (points.length < 3) return null
  const pickKey = comparison.bestValue?.key
  // Whole-cent ticks at a fixed 2¢ step, padded past the data so no point sits on an axis.
  const prices = points.map((p) => p.price)
  const start = Math.floor(Math.min(...prices)) - 1
  const xTicks: number[] = []
  for (let t = start; t <= Math.ceil(Math.max(...prices)) + 1; t += 2) xTicks.push(t)
  if (xTicks[xTicks.length - 1] < Math.max(...prices) + 1) xTicks.push(xTicks[xTicks.length - 1] + 2)
  const pick = points.filter((p) => p.key === pickKey)
  const rest = points.filter((p) => p.key !== pickKey)

  return (
    <figure className="sheet m-0 p-5">
      <figcaption className="section-title text-base">Price against reviews</figcaption>
      <p className="mt-0.5 text-sm text-ink-muted">The line joins options nothing beats on both.</p>
      <div className="mt-3 h-52" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 12, bottom: 4, left: -16 }}>
            <CartesianGrid className="stroke-rule" strokeDasharray="2 4" />
            <XAxis
              type="number"
              dataKey="price"
              name="Price"
              unit="¢"
              domain={[xTicks[0], xTicks[xTicks.length - 1]]}
              ticks={xTicks}
              tickLine={false}
              axisLine={{ className: 'stroke-ink' }}
              tick={{ className: 'fill-ink-muted font-mono text-[11px]' }}
            />
            <YAxis
              type="number"
              dataKey="stars"
              name="Reviews"
              domain={[2.5, 5]}
              ticks={[2.5, 3, 3.5, 4, 4.5, 5]}
              tickLine={false}
              axisLine={{ className: 'stroke-ink' }}
              tick={{ className: 'fill-ink-muted font-mono text-[11px]' }}
            />
            <Tooltip cursor={false} content={<PointTooltip />} />
            <Scatter
              data={frontier(points)}
              line={{ className: 'stroke-ink', strokeWidth: 1.5 }}
              shape={() => <g />}
              isAnimationActive={false}
            />
            <Scatter data={rest} className="fill-ink" isAnimationActive={false} />
            <Scatter
              data={pick}
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number }) => (
                <circle cx={props.cx} cy={props.cy} r={7} className="fill-teal stroke-paper-raised" strokeWidth={2} />
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

function PointTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  const point = payload?.[0]?.payload as Point | undefined
  if (!active || !point) return null
  return (
    <div className="rounded-tag border-[1.5px] border-ink bg-paper-raised px-3 py-2 text-sm">
      <p className="font-semibold">{point.name}</p>
      <p className="font-mono text-xs text-ink-muted">
        {point.label} · {point.stars.toFixed(1)} of 5
      </p>
    </div>
  )
}
