/**
 * Home: the month's savings, and the three things a shopper comes here to do.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ReceiptText, Route, ScanBarcode, type LucideIcon } from 'lucide-react'
import { formatCents } from '../lib/compare'
import { plural } from '../lib/labels'
import { savingsInMonth } from '../lib/savings'
import { longMonthName, monthOf, summarizeSpending } from '../lib/spending'
import { useCatalog, useReceipts } from '../lib/useCatalog'
import { SEED_NOW } from '../data/seed'

interface QuickAction {
  to: string
  title: string
  body: string
  icon: LucideIcon
}

const ACTIONS: QuickAction[] = [
  {
    to: '/compare?product=p-heinz-20',
    title: 'Compare a product',
    body: 'See the real price per ounce across brands, sizes and stores.',
    icon: ScanBarcode,
  },
  {
    to: '/trip',
    title: 'Plan a trip',
    body: 'Find out whether the cheaper store is worth the drive.',
    icon: Route,
  },
  {
    to: '/receipts',
    title: 'Add a receipt',
    body: 'Your receipt keeps prices current for everyone nearby.',
    icon: ReceiptText,
  },
]

export function Home() {
  const repo = useCatalog()
  const receipts = useReceipts()
  const month = monthOf(SEED_NOW.toISOString())

  const saved = useMemo(() => savingsInMonth(repo, receipts, month), [repo, receipts, month])
  const spent = useMemo(() => summarizeSpending(receipts, SEED_NOW).thisMonthCents, [receipts])
  const monthReceipts = receipts.filter((r) => monthOf(r.purchasedAt) === month).length
  const monthName = longMonthName(month).split(' ')[0]

  return (
    <div className="mx-auto max-w-3xl">
      <section aria-labelledby="home-title" className="animate-rise pt-2 pb-8 lg:pt-6">
        <h1 id="home-title" className="font-display text-[40px] leading-[1.05] font-extrabold lg:text-6xl">
          Saved <span className="text-savings-ink tabular">{formatCents(saved)}</span> this month
        </h1>
        <p className="mt-3 max-w-[52ch] text-lg text-ink-muted">
          {monthReceipts > 0 ? (
            <>
              By paying less per ounce than the typical price on {plural(monthReceipts, 'receipt')} in{' '}
              {monthName}. You've spent <span className="font-semibold text-ink tabular">{formatCents(spent)}</span>{' '}
              so far.{' '}
              <Link to="/spending" className="font-semibold text-leaf-ink underline">
                See spending
              </Link>
            </>
          ) : (
            <>No receipts in {monthName} yet. Add one and CartWise starts counting what you save.</>
          )}
        </p>
      </section>

      <nav aria-label="Quick actions">
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {ACTIONS.map(({ to, title, body, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-sunken/60">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-ink">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">{title}</span>
                  <span className="block text-sm text-ink-muted">{body}</span>
                </span>
                <ArrowRight
                  className="size-5 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-ink"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-8 text-xs text-ink-faint">
        Demo build: stores, prices and receipts are sample data for the Westwood area of Los Angeles.
      </p>
    </div>
  )
}
