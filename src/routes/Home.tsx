/**
 * Home: the story in one band ("the sticker price lies"), the proof printed as
 * a live shelf tag, and the shopper's own numbers as a ledger line.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ReceiptText, Route, ScanBarcode } from 'lucide-react'
import { compareByPackage, formatCents } from '../lib/compare'
import { plural } from '../lib/labels'
import { savingsInMonth } from '../lib/savings'
import { longMonthName, monthOf, summarizeSpending } from '../lib/spending'
import { useCatalog, useLinkedRetailers, useReceipts } from '../lib/useCatalog'
import { useMediaQuery } from '../lib/useMediaQuery'
import { SEED_NOW } from '../data/seed'
import { PriceTag } from '../components/compare/PriceTag'
import { Ledger } from '../components/print/Ledger'

const DEMO_PRODUCT = 'p-heinz-20'

export function Home() {
  const repo = useCatalog()
  const receipts = useReceipts()
  const linked = useLinkedRetailers()
  const month = monthOf(SEED_NOW.toISOString())
  const monthName = longMonthName(month).split(' ')[0]

  const saved = useMemo(() => savingsInMonth(repo, receipts, month), [repo, receipts, month])
  const summary = useMemo(() => summarizeSpending(receipts, SEED_NOW), [receipts])
  const demo = useMemo(
    () => compareByPackage(repo, DEMO_PRODUCT, { now: SEED_NOW, memberRetailerIds: linked }),
    [repo, linked],
  )
  const monthReceipts = receipts.filter((r) => monthOf(r.purchasedAt) === month).length
  // On a laptop the proof hangs in the band itself; on a phone it follows it.
  const wide = useMediaQuery('(min-width: 1024px)')

  const proof = demo && (
    <Link to={`/compare?product=${DEMO_PRODUCT}`} viewTransition aria-label="Open the ketchup comparison" className="block text-ink">
      <PriceTag repo={repo} comparison={demo} />
    </Link>
  )

  return (
    <>
      <section
        aria-labelledby="home-title"
        className="-mx-4 -mt-3 bg-teal px-4 pt-10 pb-12 text-on-teal sm:-mx-6 sm:px-6 lg:-mx-14 lg:-mt-12 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12 lg:px-14 lg:pt-16 lg:pb-20 dark:bg-card-1 dark:text-ink"
      >
        <div>
          <h1
            id="home-title"
            className="max-w-[14ch] animate-fade-up font-display text-[clamp(2.75rem,1.6rem+5vw,5.25rem)] leading-[0.92] font-extrabold tracking-[-0.04em]"
          >
            The sticker price lies.
          </h1>
          <p className="mt-5 max-w-[46ch] animate-fade-up text-lg opacity-90 [animation-delay:80ms]">
            CartWise shows what groceries really cost per ounce, across every brand and nearby store, and
            whether the cheap store is worth the drive.
          </p>
          <Link
            to={`/compare?product=${DEMO_PRODUCT}`}
            viewTransition
            className="mt-8 inline-flex h-12 animate-fade-up items-center gap-2 rounded-control border-[1.5px] border-ink bg-paper-raised px-5 font-semibold text-ink transition-[translate,box-shadow] [animation-delay:160ms] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)]"
          >
            <ScanBarcode className="size-5" aria-hidden="true" />
            Scan or look up a product
          </Link>
        </div>
        {wide && <div className="animate-fade-up [animation-delay:240ms]">{proof}</div>}
      </section>

      <div className="mt-10 grid gap-10 lg:mt-14">
        {!wide && demo && (
          <section aria-labelledby="demo-title">
            <h2 id="demo-title" className="section-title">
              On the shelf today
            </h2>
            <p className="mt-1 mb-4 text-sm text-ink-muted">
              The 64 oz bottle costs more and wins per ounce.
            </p>
            {proof}
          </section>
        )}

        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <section aria-labelledby="ledger-title">
            <h2 id="ledger-title" className="section-title mb-4">
              Your {monthName}
            </h2>
            <Ledger
              entries={[
                { label: 'Saved this month', value: formatCents(saved), saved: true, detail: 'vs. typical per-oz prices' },
                { label: `Spent in ${monthName}`, value: formatCents(summary.thisMonthCents), detail: plural(monthReceipts, 'receipt') },
              ]}
            />
            <Link to="/spending" viewTransition className="mt-3 inline-block text-sm font-semibold text-teal hover:underline">
              See all spending
            </Link>
          </section>

          <nav aria-label="Quick actions" className="flex flex-col border-t-2 border-ink">
            <QuickAction to="/trip" icon={<Route className="size-5" aria-hidden="true" />} title="Plan a trip">
              Is the cheaper store worth the drive?
            </QuickAction>
            <QuickAction to="/receipts" icon={<ReceiptText className="size-5" aria-hidden="true" />} title="Add a receipt">
              Your receipt keeps prices honest for everyone nearby.
            </QuickAction>
          </nav>
        </div>
      </div>

      <p className="mt-12 text-xs text-ink-faint">
        Demo build: stores, prices and receipts are sample data for Westwood, Los Angeles.
      </p>
    </>
  )
}

function QuickAction({
  to,
  icon,
  title,
  children,
}: {
  to: string
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Link to={to} viewTransition className="group flex items-center gap-4 border-b border-rule py-4 hover:bg-paper-raised">
      <span className="grid size-10 shrink-0 place-items-center rounded-tag border-[1.5px] border-ink">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-bold tracking-[-0.02em]">{title}</span>
        <span className="block text-sm text-ink-muted">{children}</span>
      </span>
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  )
}
