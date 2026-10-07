/**
 * Spending: receipts rolled up by month, year and store. Every number is
 * derived from saved receipts on the fly, so deleting one corrects it.
 */
import { useMemo } from 'react'
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
import { Ledger } from '../components/print/Ledger'
import { Leader } from '../components/print/Leader'
import { PriceNumeral } from '../components/print/Numeral'
import { ReceiptBlock, ReceiptTotal } from '../components/print/ReceiptBlock'
import { SaleTag } from '../components/print/SaleTag'
import { MonthlyChart } from '../components/spending/MonthlyChart'

export function Spending() {
  const repo = useCatalog()
  const receipts = useReceipts()
  const thisMonth = monthOf(SEED_NOW.toISOString())
  const monthName = longMonthName(thisMonth).split(' ')[0]

  const summary = useMemo(() => summarizeSpending(receipts, SEED_NOW), [receipts])
  const saved = useMemo(() => savingsInMonth(repo, receipts, thisMonth), [repo, receipts, thisMonth])

  const header = <PageHeader title="Spending" description="What groceries cost you, from the receipts you've saved." />

  if (receipts.length === 0) {
    return (
      <>
        {header}
        <Panel>
          <EmptyState title="No receipts, no ledger" action={<ButtonLink to="/receipts">Add a receipt</ButtonLink>}>
            Spending is built from your receipts. Add one and this page fills in.
          </EmptyState>
        </Panel>
      </>
    )
  }

  const lastMonth = summary.months[summary.months.length - 2]
  const year = SEED_NOW.getUTCFullYear()
  const yearTotal = summary.thisYearCents || 1

  return (
    <>
      {header}

      <section aria-label="Saved this month" className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <p className="font-mono text-sm text-ink-muted">Saved in {monthName}</p>
          <PriceNumeral value={formatCents(saved)} className="mt-2 hero-numeral" />
        </div>
        <SaleTag tilt={-3} className="mb-3">
          vs. typical per-oz prices
        </SaleTag>
      </section>

      <Ledger
        className="mt-8"
        entries={[
          { label: `${monthName} so far`, value: formatCents(summary.thisMonthCents) },
          {
            label: lastMonth ? longMonthName(lastMonth.period).split(' ')[0] : 'Last month',
            value: formatCents(summary.lastMonthCents),
          },
          { label: `${year} total`, value: formatCents(summary.thisYearCents) },
          { label: 'Monthly average', value: formatCents(summary.monthlyAverageCents), detail: 'last six months' },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <section aria-labelledby="by-month">
          <h2 id="by-month" className="section-title">
            Spent per month
          </h2>
          <p className="mb-4 text-sm text-ink-muted">Last six months, this month to date.</p>
          <MonthlyChart months={summary.months} />
        </section>

        <ReceiptBlock aria-labelledby="by-store">
          <h2 id="by-store" className="text-center font-mono text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
            Where it went, {year}
          </h2>
          <div className="my-4 border-t border-dashed border-ink" />
          <ul className="flex flex-col gap-4 text-sm">
            {summary.topStores.map((store) => (
              <li key={store.storeId}>
                <Leader label={<span className="font-sans font-semibold">{storeLabel(repo, store.storeId)}</span>} value={formatCents(store.cents)} />
                <div className="mt-1.5 h-1.5 bg-paper-sunken" aria-hidden="true">
                  <div className="h-full bg-ink" style={{ width: `${(store.cents / yearTotal) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {Math.round((store.cents / yearTotal) * 100)}% · {plural(store.receiptCount, 'trip')}
                </p>
              </li>
            ))}
          </ul>
          <ReceiptTotal label="Total">{formatCents(summary.thisYearCents)}</ReceiptTotal>
        </ReceiptBlock>
      </div>
    </>
  )
}
