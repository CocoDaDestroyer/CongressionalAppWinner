/**
 * Spend tracking.
 *
 * Entirely derived from saved receipts -- no new storage, no new repository
 * calls. `receiptTotalCents` is already the source of truth for what a
 * receipt cost, so this screen only groups receipts by month and by store.
 */
import { useMemo } from 'react'
import { formatCents } from '../lib/compare'
import { receiptTotalCents } from '../lib/store'
import { useCatalog, useReceipts } from '../lib/useCatalog'
import {
  CARD,
  HEADING,
  INTRO,
  MUTED,
  PAGE,
  STAT_LABEL,
  SUBHEADING,
  TABLE,
  TABLE_CELL,
  TABLE_HEAD_CELL,
  TABLE_HEAD_ROW,
  TABLE_ROW,
  TABLE_WRAP,
} from '../lib/ui'

interface MonthGroup {
  key: string
  label: string
  totalCents: number
  receiptCount: number
}

const MONTH_LABEL = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

function monthKey(isoDate: string) {
  return isoDate.slice(0, 7)
}

export function Spending() {
  const repo = useCatalog()
  const receipts = useReceipts()

  const months = useMemo<MonthGroup[]>(() => {
    const byMonth = new Map<string, MonthGroup>()
    for (const receipt of receipts) {
      const key = monthKey(receipt.purchasedAt)
      const existing = byMonth.get(key)
      const totalCents = receiptTotalCents(receipt)
      if (existing) {
        existing.totalCents += totalCents
        existing.receiptCount += 1
      } else {
        byMonth.set(key, {
          key,
          label: MONTH_LABEL.format(new Date(`${key}-01T00:00:00Z`)),
          totalCents,
          receiptCount: 1,
        })
      }
    }
    return [...byMonth.values()].sort((a, b) => b.key.localeCompare(a.key))
  }, [receipts])

  const currentYear = new Date().getUTCFullYear().toString()
  const yearTotalCents = months
    .filter((m) => m.key.startsWith(currentYear))
    .reduce((sum, m) => sum + m.totalCents, 0)
  const allTimeTotalCents = months.reduce((sum, m) => sum + m.totalCents, 0)

  const byStore = useMemo(() => {
    const totals = new Map<string, number>()
    for (const receipt of receipts) {
      totals.set(
        receipt.storeId,
        (totals.get(receipt.storeId) ?? 0) + receiptTotalCents(receipt),
      )
    }
    return [...totals.entries()]
      .map(([storeId, totalCents]) => ({ storeId, totalCents }))
      .sort((a, b) => b.totalCents - a.totalCents)
  }, [receipts])

  const storeName = (id: string) => {
    const store = repo.getStore(id)
    if (!store) return 'Unknown store'
    const retailer = repo.getRetailer(store.retailerId)?.name ?? 'Store'
    const city = store.address.split(',').slice(-2, -1)[0]?.trim() ?? ''
    return city ? `${retailer} (${city})` : retailer
  }

  return (
    <section className={PAGE}>
      <h1 className={HEADING}>Spending</h1>
      <p className={INTRO}>
        Monthly and annual grocery spend, derived from the receipts you have
        entered. Nothing here is tracked separately -- deleting or correcting a
        receipt changes these totals too.
      </p>

      {receipts.length === 0 ? (
        <p className={`mt-4 text-sm ${MUTED}`}>
          Nothing yet. Enter a receipt to start tracking spend.
        </p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-4">
            <div className={CARD}>
              <span className={STAT_LABEL}>This year</span>
              <span className="mt-1 block text-lg font-medium tabular-nums">
                {formatCents(yearTotalCents)}
              </span>
            </div>
            <div className={CARD}>
              <span className={STAT_LABEL}>All time</span>
              <span className="mt-1 block text-lg font-medium tabular-nums">
                {formatCents(allTimeTotalCents)}
              </span>
            </div>
          </div>

          <h2 className={`mt-6 ${SUBHEADING}`}>By month</h2>
          <div className={`mt-2 max-w-xl ${TABLE_WRAP}`}>
            <table className={TABLE}>
              <thead>
                <tr className={TABLE_HEAD_ROW}>
                  <th className={TABLE_HEAD_CELL}>Month</th>
                  <th className={`${TABLE_HEAD_CELL} w-24 text-right`}>Receipts</th>
                  <th className={`${TABLE_HEAD_CELL} w-28 text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr key={month.key} className={TABLE_ROW}>
                    <td className={TABLE_CELL}>{month.label}</td>
                    <td className={`${TABLE_CELL} text-right tabular-nums`}>
                      {month.receiptCount}
                    </td>
                    <td className={`${TABLE_CELL} text-right tabular-nums`}>
                      {formatCents(month.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className={`mt-6 ${SUBHEADING}`}>By store</h2>
          <div className={`mt-2 max-w-xl ${TABLE_WRAP}`}>
            <table className={TABLE}>
              <thead>
                <tr className={TABLE_HEAD_ROW}>
                  <th className={TABLE_HEAD_CELL}>Store</th>
                  <th className={`${TABLE_HEAD_CELL} w-28 text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {byStore.map((row) => (
                  <tr key={row.storeId} className={TABLE_ROW}>
                    <td className={TABLE_CELL}>{storeName(row.storeId)}</td>
                    <td className={`${TABLE_CELL} text-right tabular-nums`}>
                      {formatCents(row.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
