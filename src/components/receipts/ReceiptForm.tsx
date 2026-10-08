/**
 * Receipt entry, laid out like the paper it transcribes. A photo of the paper
 * can be attached for the shopper's records (no OCR); a saved receipt writes price observations every other screen reads.
 */
import { useState, type FormEvent } from 'react'
import { Camera, Plus, X } from 'lucide-react'
import { formatCents } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { canUseCamera } from '../../lib/camera'
import { receiptPhotoDataUrl } from '../../lib/photo'
import { catalogStore, type NewReceipt } from '../../lib/store'
import type { Receipt } from '../../lib/catalog'
import { Button } from '../ui/Button'
import { inputClass } from '../ui/Field'
import { ReceiptCamera } from './ReceiptCamera'

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
  const [photo, setPhoto] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)

  const total = lines.reduce((sum, line) => sum + cents(line.price) * line.quantity, 0)

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  async function attach(file: File | undefined) {
    if (!file) return
    try {
      setPhoto(await receiptPhotoDataUrl(file))
      setError(null)
    } catch {
      setError('That photo could not be read. Try another one.')
    }
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
      photo: photo ?? undefined,
    })
    setLines([blankLine()])
    setPhoto(null)
    setError(null)
    onSaved(receipt)
  }

  return (
    <div>
      <form
        onSubmit={save}
        noValidate
        aria-label="New receipt"
        className="receipt-edge bg-paper-raised px-5 pt-6 sm:px-7"
      >
        <p className="mb-5 text-center section-title">New receipt</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Store</span>
            <select className={`${inputClass} font-semibold`} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {storeLabel(repo, store)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Purchased</span>
            <input
              className={`${inputClass} font-mono`}
              type="date"
              value={purchasedOn}
              onChange={(e) => setPurchasedOn(e.target.value)}
            />
          </label>
        </div>

        <hr className="my-5 border-t border-dashed border-ink" />

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
                  className={`${inputClass} text-center font-mono`}
                  aria-label={`Quantity ${n}`}
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: Math.max(1, Number(e.target.value)) })}
                />
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-ink-faint">$</span>
                  <input
                    className={`${inputClass} pl-7 font-mono`}
                    aria-label={`Price ${n}`}
                    inputMode="decimal"
                    placeholder="4.29"
                    value={line.price}
                    onChange={(e) => updateLine(index, { price: e.target.value })}
                  />
                </div>
                <div className="flex h-12 items-center gap-1">
                  <span className="w-16 text-right font-mono font-medium">
                    {formatCents(cents(line.price) * line.quantity)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove line ${n}`}
                    disabled={lines.length === 1}
                    onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                    className="grid size-8 place-items-center rounded-full text-ink-faint hover:bg-paper-sunken hover:text-ink disabled:invisible"
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

        <hr className="my-5 border-t border-dashed border-ink" />

        {cameraOpen ? (
          <ReceiptCamera
            onCapture={(dataUrl) => {
              setPhoto(dataUrl)
              setCameraOpen(false)
              setError(null)
            }}
            onClose={() => setCameraOpen(false)}
          />
        ) : photo ? (
          <div className="flex items-center gap-3">
            <img src={photo} alt="Attached receipt" className="size-16 rounded-control border-[1.5px] border-ink object-cover" />
            <span className="flex-1 text-sm text-ink-muted">Photo attached. It stays with this receipt.</span>
            <Button variant="ghost" size="sm" onClick={() => setPhoto(null)}>
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {canUseCamera() && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Camera className="size-4" aria-hidden="true" />}
                onClick={() => setCameraOpen(true)}
              >
                Take a photo of the receipt
              </Button>
            )}
            <label className="inline-flex h-9 cursor-pointer items-center rounded-control px-3 text-sm font-semibold text-ink-muted transition-colors has-focus-visible:outline-2 has-focus-visible:outline-teal hover:bg-paper-sunken hover:text-ink">
              {canUseCamera() ? 'or choose a photo' : 'Attach a photo of the receipt'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  void attach(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        )}

        <hr className="my-5 border-t border-dashed border-ink" />

        <div className="flex items-baseline justify-between border-t-4 border-double border-ink pt-3">
          <span className="font-mono font-medium tracking-wide uppercase">Total</span>
          <output aria-label="Receipt total" className="font-display text-[34px] leading-none font-extrabold tracking-[-0.03em] tabular">
            {formatCents(total)}
          </output>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-brick">
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
