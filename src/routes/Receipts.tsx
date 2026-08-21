/**
 * Receipt entry.
 *
 * The real feature photographs a receipt and reads it. OCR needs a phone camera
 * to check properly, so the transcription step is typed here instead -- but
 * everything downstream is real: a saved receipt writes price observations,
 * which immediately change what Scan and List recommend.
 *
 * Styling is deliberately plain; design comes later.
 */
import { useMemo, useState } from 'react'
import { formatCents } from '../lib/compare'
import { catalogStore, receiptTotalCents } from '../lib/store'
import { useCatalog, useReceipts } from '../lib/useCatalog'
import * as seed from '../data/seed'

interface DraftLine {
  packageId: string
  quantity: number
  /** Kept as typed text so a half-entered "4." does not fight the input. */
  price: string
}

const BLANK_LINE: DraftLine = { packageId: seed.packages[0].id, quantity: 1, price: '' }

const isoDate = (date: Date) => date.toISOString().slice(0, 10)

export function Receipts() {
  const repo = useCatalog()
  const receipts = useReceipts()

  const [storeId, setStoreId] = useState(seed.stores[0].id)
  const [purchasedOn, setPurchasedOn] = useState(isoDate(seed.SEED_NOW))
  const [lines, setLines] = useState<DraftLine[]>([{ ...BLANK_LINE }])
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const draftTotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + Math.round(Number(line.price || 0) * 100) * line.quantity,
        0,
      ),
    [lines],
  )

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    )
  }

  function save() {
    const parsed = lines
      .map((line) => ({
        packageId: line.packageId,
        quantity: line.quantity,
        unitPriceCents: Math.round(Number(line.price) * 100),
      }))
      .filter((line) => line.quantity > 0)

    // A blank price parses to 0, which would otherwise fall through to the
    // "greater than zero" message and read as a complaint about a number the
    // shopper never typed.
    const blank = lines.some((line) => line.price.trim() === '')
    if (
      parsed.length === 0 ||
      blank ||
      parsed.some((l) => !Number.isFinite(l.unitPriceCents))
    ) {
      setError('Every line needs a quantity and a price.')
      return
    }
    if (parsed.some((l) => l.unitPriceCents <= 0)) {
      setError('Prices must be greater than zero.')
      return
    }

    catalogStore.recordReceipt({
      storeId,
      // Stored as an instant; the form only collects a date.
      purchasedAt: new Date(`${purchasedOn}T12:00:00Z`).toISOString(),
      lines: parsed,
    })

    setLines([{ ...BLANK_LINE }])
    setError(null)
    setSaved(`Saved. ${parsed.length} price${parsed.length === 1 ? '' : 's'} updated.`)
  }

  const storeName = (id: string) => {
    const store = repo.getStore(id)
    if (!store) return 'Unknown store'
    const retailer = repo.getRetailer(store.retailerId)?.name ?? 'Store'
    const city = store.address.split(',').slice(-2, -1)[0]?.trim() ?? ''
    return city ? `${retailer} (${city})` : retailer
  }

  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold">Receipts</h1>
      <p className="mt-1 max-w-prose text-sm text-gray-600">
        Entering a receipt updates prices for everyone and records what you spent.
        Photo capture needs a phone, so type the lines for now -- everything after
        that step is the real thing.
      </p>

      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <label>
          <span className="block text-gray-600">Store</span>
          <select
            className="mt-1 border p-1"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          >
            {seed.stores.map((store) => (
              <option key={store.id} value={store.id}>
                {storeName(store.id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-gray-600">Purchased</span>
          <input
            className="mt-1 border p-1"
            type="date"
            value={purchasedOn}
            onChange={(e) => setPurchasedOn(e.target.value)}
          />
        </label>
      </div>

      <table className="mt-4 w-full max-w-3xl border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-1 pr-2">Item</th>
            <th className="py-1 pr-2 w-20">Qty</th>
            <th className="py-1 pr-2 w-28">Unit price</th>
            <th className="py-1 w-24 text-right">Line</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index} className="border-b">
              <td className="py-1 pr-2">
                <select
                  className="w-full border p-1"
                  aria-label={`Item ${index + 1}`}
                  value={line.packageId}
                  onChange={(e) => updateLine(index, { packageId: e.target.value })}
                >
                  {seed.packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.displayName}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-1 pr-2">
                <input
                  className="w-full border p-1"
                  aria-label={`Quantity ${index + 1}`}
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(index, { quantity: Math.max(1, Number(e.target.value)) })
                  }
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  className="w-full border p-1"
                  aria-label={`Price ${index + 1}`}
                  inputMode="decimal"
                  placeholder="4.29"
                  value={line.price}
                  onChange={(e) => updateLine(index, { price: e.target.value })}
                />
              </td>
              <td className="py-1 text-right tabular-nums">
                {formatCents(Math.round(Number(line.price || 0) * 100) * line.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-center gap-3 text-sm">
        <button
          className="border px-2 py-1"
          onClick={() => setLines((l) => [...l, { ...BLANK_LINE }])}
        >
          Add line
        </button>
        <button className="border px-3 py-1 font-medium" onClick={save}>
          Save receipt
        </button>
        <span className="tabular-nums">Total {formatCents(draftTotal)}</span>
      </div>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      {saved && !error && <p className="mt-2 text-sm text-green-700">{saved}</p>}

      <h2 className="mt-8 text-sm font-medium">
        Saved receipts {receipts.length > 0 && `(${receipts.length})`}
      </h2>
      {receipts.length === 0 ? (
        <p className="mt-1 text-sm text-gray-600">
          Nothing yet. Saved receipts persist in this browser.
        </p>
      ) : (
        <ul className="mt-2 space-y-3">
          {receipts.map((receipt) => (
            <li key={receipt.id} className="max-w-3xl border p-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{storeName(receipt.storeId)}</span>
                <span className="tabular-nums">
                  {formatCents(receiptTotalCents(receipt))}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {receipt.purchasedAt.slice(0, 10)}
              </div>
              <ul className="mt-2 space-y-0.5">
                {receipt.lines.map((line) => (
                  <li key={line.id} className="flex justify-between">
                    <span>
                      {line.quantity}x{' '}
                      {repo.getPackage(line.packageId)?.displayName ?? line.packageId}
                    </span>
                    <span className="tabular-nums">
                      {formatCents(line.unitPriceCents * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-2 border px-2 py-0.5 text-xs"
                onClick={() => catalogStore.deleteReceipt(receipt.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
