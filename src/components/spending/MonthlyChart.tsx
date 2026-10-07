/**
 * Spend per month as bars. One series, so no legend: the heading names it.
 * The current month is the full leaf; past months sit a step lighter so the
 * eye lands on "now" first. A hidden table carries the same numbers for
 * screen readers.
 */
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { formatCents } from '../../lib/compare'
import { longMonthName, shortMonthName, type PeriodTotal } from '../../lib/spending'
import { plural } from '../../lib/labels'

interface MonthlyChartProps {
  months: PeriodTotal[]
}

export function MonthlyChart({ months }: MonthlyChartProps) {
  const data = months.map((m) => ({ ...m, label: shortMonthName(m.period), dollars: m.cents / 100 }))
  const last = data.length - 1

  return (
    <>
      <div className="h-56 sm:h-64" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap="28%">
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ className: 'stroke-line' }}
              tick={{ className: 'fill-ink-muted text-xs font-semibold' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v: number) => `$${v}`}
              tick={{ className: 'fill-ink-faint text-xs' }}
            />
            <Tooltip cursor={{ className: 'fill-sunken' }} content={<MonthTooltip />} />
            <Bar dataKey="dollars" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((m, i) => (
                <Cell key={m.period} className={i === last ? 'fill-leaf' : 'fill-leaf/45'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Grocery spending by month</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Spent</th>
            <th scope="col">Receipts</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.period}>
              <th scope="row">{longMonthName(m.period)}</th>
              <td>{formatCents(m.cents)}</td>
              <td>{m.receiptCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function MonthTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  const month = payload?.[0]?.payload as (PeriodTotal & { label: string }) | undefined
  if (!active || !month) return null
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-float">
      <p className="font-semibold">{longMonthName(month.period)}</p>
      <p className="tabular">
        {formatCents(month.cents)} · {plural(month.receiptCount, 'receipt')}
      </p>
    </div>
  )
}
