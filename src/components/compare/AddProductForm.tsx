import { useState, type FormEvent } from 'react'
import { PackagePlus, Users } from 'lucide-react'
import type { CatalogRepository } from '../../lib/repository'
import { catalogStore } from '../../lib/store'
import { storeLabel } from '../../lib/labels'
import type { Dimension, Unit } from '../../lib/units'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/Field'

const UNITS: Record<Dimension, { value: Unit; label: string }[]> = {
  mass: [
    { value: 'oz', label: 'oz' },
    { value: 'lb', label: 'lb' },
    { value: 'g', label: 'g' },
    { value: 'kg', label: 'kg' },
  ],
  volume: [
    { value: 'floz', label: 'fl oz' },
    { value: 'gal', label: 'gal' },
    { value: 'ml', label: 'ml' },
    { value: 'l', label: 'L' },
  ],
  count: [{ value: 'ct', label: 'count' }],
}

interface AddProductFormProps {
  repo: CatalogRepository
  gtin: string
  onAdded: (packageId: string) => void
  onCancel: () => void
}

/**
 * The unknown-barcode flow. Instead of a dead end, the shopper describes what
 * they are holding and the price on the shelf; it joins the catalog as an
 * unverified package with a Community price, which any later scrape outranks.
 */
export function AddProductForm({ repo, gtin, onAdded, onCancel }: AddProductFormProps) {
  const concepts = repo.getConcepts()
  const stores = repo.getStores()

  const [name, setName] = useState('')
  const [conceptId, setConceptId] = useState(concepts[0]?.id ?? '')
  const [size, setSize] = useState('')
  const [unit, setUnit] = useState<Unit>('oz')
  const [storeId, setStoreId] = useState(stores[0]?.id ?? '')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dimension = concepts.find((c) => c.id === conceptId)?.dimension ?? 'mass'

  function changeConcept(id: string) {
    setConceptId(id)
    const next = concepts.find((c) => c.id === id)?.dimension ?? 'mass'
    setUnit(UNITS[next][0].value)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const sizeValue = Number(size)
    const priceCents = Math.round(Number(price) * 100)
    if (name.trim() === '') return setError('Give the product a name, as printed on the label.')
    if (!(sizeValue > 0)) return setError('Enter the package size, like 20 for a 20 oz bottle.')
    if (!(priceCents > 0)) return setError('Enter the shelf price, like 4.29.')

    const pkg = catalogStore.contributeProduct({
      gtin,
      displayName: name.trim(),
      conceptId,
      size: sizeValue,
      unit,
      storeId,
      priceCents,
    })
    onAdded(pkg.id)
  }

  return (
    <section
      aria-labelledby="add-product"
      className="animate-tag-print rounded-tag border-[1.5px] border-ink bg-paper-raised p-5 tag-shadow sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-sunken text-community">
          <PackagePlus className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="add-product" className="section-title">
            Barcode {gtin} isn't in the catalog yet
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Add it and your price shows up for everyone, marked{' '}
            <Users className="inline size-3.5 align-[-2px]" aria-hidden="true" /> Community until a
            store confirms it.
          </p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Product name" className="sm:col-span-2">
          <input
            className={inputClass}
            placeholder="Sir Kensington's Ketchup, 20 oz"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Compare it with">
          <select className={inputClass} value={conceptId} onChange={(e) => changeConcept(e.target.value)}>
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          <Field label="Size">
            <input
              className={`${inputClass} tabular`}
              inputMode="decimal"
              placeholder="20"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </Field>
          <Field label="Unit">
            <select className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
              {UNITS[dimension].map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Store">
          <select className={inputClass} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {storeLabel(repo, s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Shelf price ($)">
          <input
            className={`${inputClass} tabular`}
            inputMode="decimal"
            placeholder="4.29"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-brick sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" icon={<PackagePlus className="size-4" aria-hidden="true" />}>
            Add product
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  )
}
