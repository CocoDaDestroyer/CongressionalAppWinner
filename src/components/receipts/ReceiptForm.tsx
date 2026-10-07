/**
 * Receipt entry, laid out like the paper it transcribes. The photo-and-OCR
 * step needs a phone camera; everything after the typing is the real thing:
 * a saved receipt writes price observations every other screen reads.
 */
import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { formatCents } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { catalogStore, type NewReceipt } from '../../lib/store'
import type { Receipt } from '../../lib/catalog'
import { Button } from '../ui/Button'
import { inputClass } from '../ui/Field'

interface DraftLine {
  packageId: string
  quantity: number
  /** Kept as typed text so a half-entered "4." does not fight the input. */
  price: string
}

interface ReceiptFormProps {
  repo: CatalogRepository
  defaultDate: string
  onSaved: (receipt: Receipt) => void
}

const cents = (price: string) => Math.round(Number(price || 0) * 100)

export function ReceiptForm({ repo, defaultDate, onSaved }: ReceiptFormProps) {
  const packages = repo.getPackages()
  const stores = repo.getStores()
  const blankLine = (): DraftLine => ({ packageId: packages[0].id, quantity: 1, price: '' })

  const [storeId, setStoreId] = useState(stores[0].id)
  const [purchasedOn, setPurchasedOn] = useState(defaultDate)
  const [lines, setLines] = useState<DraftLine[]>([blankLine()])
  const [error, setError] = useState<string | null>(null)

  const total = lines.reduce((sum, line) => sum + cents(line.price) * line.quantity, 0)

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  function save(event: FormEvent) {
    event.preventDefault()
    const parsed: NewReceipt['lines'] = lines.map((line) => ({
      packageId: line.packageId,
      quantity: line.quantity,
      unitPriceCents: Math.round(Number(line.price) * 100),
    }))

    // A blank price parses to 0, which would otherwise fall through to the
    // "greater than zero" message and read as a complaint about a number the
    // shopper never typed.
    if (lines.some((l) => l.price.trim() === '') || parsed.some((l) => !Number.isFinite(l.unitPriceCents))) {
      setError('Every line needs a quantity and a price.')
      return
    }
    if (parsed.some((l) => l.unitPriceCents <= 0)) {
      setError('Prices must be greater than zero.')
      return
    }

    const receipt = catalogStore.recordReceipt({
      storeId,
      // Stored as an instant; the form only collects a date.
      purchasedAt: new Date(`${purchasedOn}T12:00:00Z`).toISOString(),
      lines: parsed,
    })
    setLines([blankLine()])
    setError(null)
    onSaved(receipt)
  }

  return (
    <div className="drop-shadow-[0_1px_2px_var(--color-line-strong)]">
      <form
        onSubmit={save}
        noValidate
        aria-label="New receipt"
        className="receipt-edge bg-surface px-5 pt-6 pb-10 sm:px-7"
      >
        <div className="grid gap-3 text-center sm:grid-cols-2 sm:text-left">
          <label className="block">
            <span className="mb-1 block text-xs font-bold tracking-wide text-ink-faint uppercase">Store</span>
            <select className={`${inputClass} font-semibold`} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {storeLabel(repo, store)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold tracking-wide text-ink-faint uppercase">Purchased</span>
            <input
              className={`${inputClass} tabular`}
              type="date"
              value={purchasedOn}
              onChange={(e) => setPurchasedOn(e.target.value)}
            />
          </label>
        </div>

        <hr className="my-5 border-t-2 border-dashed border-line" />

        <ol className="flex flex-col gap-4">
          {lines.map((line, index) => {
            const n = index + 1
            return (
              <li key={index} className="grid grid-cols-[4.5rem_1fr_auto] items-end gap-2">
                <select
                  className={`${inputClass} col-span-3`}
                  aria-label={`Item ${n}`}
                  value={line.packageId}
                  onChange={(e) => updateLine(index, { packageId: e.target.value })}
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.displayName}
                    </option>
                  ))}
                </select>
                <input
                  className={`${inputClass} text-center tabular`}
                  aria-label={`Quantity ${n}`}
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: Math.max(1, Number(e.target.value)) })}
                />
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint">$</span>
                  <input
                    className={`${inputClass} pl-7 tabular`}
                    aria-label={`Price ${n}`}
                    inputMode="decimal"
                    placeholder="4.29"
                    value={line.price}
                    onChange={(e) => updateLine(index, { price: e.target.value })}
                  />
                </div>
                <div className="flex h-11 items-center gap-1">
                  <span className="w-16 text-right font-semibold tabular">
                    {formatCents(cents(line.price) * line.quantity)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove line ${n}`}
                    disabled={lines.length === 1}
                    onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                    className="grid size-8 place-items-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink disabled:invisible"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ol>

        <Button
          variant="ghost"
          size="sm"
          className="mt-3 -ml-3"
          icon={<Plus className="size-4" aria-hidden="true" />}
          onClick={() => setLines((current) => [...current, blankLine()])}
        >
          Add line
        </Button>

        <hr className="my-5 border-t-2 border-dashed border-line" />

        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg font-extrabold tracking-wide uppercase">Total</span>
          <output aria-label="Receipt total" className="font-display text-3xl font-extrabold tabular">
            {formatCents(total)}
          </output>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-danger-ink">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-5 w-full">
          Save receipt
        </Button>
      </form>
    </div>
  )
}
