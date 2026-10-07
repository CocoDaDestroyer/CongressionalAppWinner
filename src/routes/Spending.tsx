/**
 * Spending: receipts rolled up by month, year and store. Every number here is
 * derived from saved receipts on the fly, so deleting one corrects it.
 */
import { useMemo } from 'react'
import { ReceiptText } from 'lucide-react'
import { formatCents } from '../lib/compare'
import { plural, storeLabel } from '../lib/labels'
import { savingsInMonth } from '../lib/savings'
import { longMonthName, monthOf, summarizeSpending } from '../lib/spending'
import { useCatalog, useReceipts } from '../lib/useCatalog'
import { SEED_NOW } from '../data/seed'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { StatTile } from '../components/ui/StatTile'
import { MonthlyChart } from '../components/spending/MonthlyChart'

export function Spending() {
  const repo = useCatalog()
  const receipts = useReceipts()
  const thisMonth = monthOf(SEED_NOW.toISOString())

  const summary = useMemo(() => summarizeSpending(receipts, SEED_NOW), [receipts])
  const saved = useMemo(() => savingsInMonth(repo, receipts, thisMonth), [repo, receipts, thisMonth])

  const header = (
    <PageHeader title="Spending" description="What groceries cost you, from the receipts you've saved." />
  )

  if (receipts.length === 0) {
    return (
      <>
        {header}
        <Panel>
          <EmptyState
            icon={<ReceiptText className="size-6" aria-hidden="true" />}
            title="No receipts yet"
            action={<ButtonLink to="/receipts">Add a receipt</ButtonLink>}
          >
            Spending is built from your receipts. Add one and this page fills in.
          </EmptyState>
        </Panel>
      </>
    )
  }

  const lastMonth = summary.months[summary.months.length - 2]?.period ?? thisMonth
  const yearTotal = summary.thisYearCents || 1

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile
          label={`${longMonthName(thisMonth).split(' ')[0]} so far`}
          value={formatCents(summary.thisMonthCents)}
          detail={`${longMonthName(lastMonth).split(' ')[0]} was ${formatCents(summary.lastMonthCents)}`}
        />
        <StatTile label="Saved this month" value={formatCents(saved)} detail="vs. typical per-unit prices" tone="savings" />
        <StatTile label={`${SEED_NOW.getUTCFullYear()} total`} value={formatCents(summary.thisYearCents)} />
        <StatTile label="Monthly average" value={formatCents(summary.monthlyAverageCents)} detail="last six months" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
        <Panel aria-labelledby="by-month" className="p-5">
          <h2 id="by-month" className="font-semibold">
            Spent per month
          </h2>
          <p className="mb-4 text-sm text-ink-muted">Last six months, this month to date.</p>
          <MonthlyChart months={summary.months} />
        </Panel>

        <Panel aria-labelledby="by-store" className="p-5">
          <h2 id="by-store" className="font-semibold">
            Where it went
          </h2>
          <p className="mb-4 text-sm text-ink-muted">Stores by spend, {SEED_NOW.getUTCFullYear()}.</p>
          <ul className="flex flex-col gap-4">
            {summary.topStores.map((store) => (
              <li key={store.storeId}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{storeLabel(repo, store.storeId)}</span>
                  <span className="tabular">{formatCents(store.cents)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div
                    className="h-full rounded-full bg-leaf"
                    style={{ width: `${(store.cents / yearTotal) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {Math.round((store.cents / yearTotal) * 100)}% · {plural(store.receiptCount, 'trip')}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
