/**
 * The comparison screen.
 *
 * A camera barcode scanner belongs here eventually, but it needs a phone to
 * check. Until then the same code path is driven by picking a package or typing
 * a GTIN by hand -- `compareByPackage` cannot tell the difference, so what you
 * see here is the real ranking, not a mock of it.
 *
 * Styling is deliberately plain; design comes later.
 */
import { useMemo, useState } from 'react'
import {
  compareByPackage,
  formatAge,
  formatCents,
  formatPerUnit,
  isStale,
  type CompareOption,
} from '../lib/compare'
import { createInMemoryRepository } from '../lib/repository'
import * as seed from '../data/seed'

const repo = createInMemoryRepository(seed)

export function Scan() {
  const [packageId, setPackageId] = useState('p-heinz-20')
  const [gtin, setGtin] = useState('')
  const [gtinError, setGtinError] = useState<string | null>(null)
  const [qualityWeight, setQualityWeight] = useState(0.5)

  const comparison = useMemo(
    () => compareByPackage(repo, packageId, { qualityWeight, now: seed.SEED_NOW }),
    [packageId, qualityWeight],
  )

  function lookUpGtin(event: React.FormEvent) {
    event.preventDefault()
    const found = repo.getPackageByGtin(gtin.trim())
    if (found) {
      setPackageId(found.id)
      setGtinError(null)
    } else {
      // The real app routes this to the "add a product" flow rather than
      // dead-ending, which is the whole point of the community catalog.
      setGtinError(`No package with GTIN ${gtin.trim()} -- it would be added by hand.`)
    }
  }

  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold">Scan</h1>
      <p className="mt-1 max-w-prose text-sm text-gray-600">
        Standing in for the camera: pick a product or enter a barcode. Prices are
        local seed data, not a live store feed.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-6">
        <label className="text-sm">
          <span className="block text-gray-600">Product</span>
          <select
            className="mt-1 border p-1"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
          >
            {seed.packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </label>

        <form className="text-sm" onSubmit={lookUpGtin}>
          <span className="block text-gray-600">Barcode (GTIN-14)</span>
          <input
            className="mt-1 border p-1 font-mono"
            placeholder="00013000006415"
            value={gtin}
            onChange={(e) => setGtin(e.target.value)}
          />
          <button className="ml-2 border px-2 py-1" type="submit">
            Look up
          </button>
        </form>

        <label className="text-sm">
          <span className="block text-gray-600">
            Quality vs. price: {Math.round(qualityWeight * 100)}% quality
          </span>
          <input
            className="mt-1 w-56"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={qualityWeight}
            onChange={(e) => setQualityWeight(Number(e.target.value))}
          />
        </label>
      </div>

      {gtinError && <p className="mt-2 text-sm text-red-700">{gtinError}</p>}

      {!comparison ? (
        <p className="mt-6 text-sm">No such product.</p>
      ) : comparison.options.length === 0 ? (
        <p className="mt-6 text-sm">No prices recorded for this product yet.</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-gray-600">
            Comparing every <strong>{comparison.conceptName.toLowerCase()}</strong> in
            the catalog -- {comparison.options.length} price
            {comparison.options.length === 1 ? '' : 's'} across brands, sizes and
            stores, ranked per{' '}
            {comparison.dimension === 'count' ? 'item' : '100 canonical units'}.
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            <Recommendation label="Cheapest per unit" option={comparison.cheapest} />
            <Recommendation
              label={`Best value at ${Math.round(qualityWeight * 100)}% quality`}
              option={comparison.bestValue}
            />
          </div>

          <table className="mt-6 w-full max-w-4xl border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-4">Product</th>
                <th className="py-1 pr-4">Store</th>
                <th className="py-1 pr-4">Price</th>
                <th className="py-1 pr-4">Per unit</th>
                <th className="py-1 pr-4">Quality</th>
                <th className="py-1">Source</th>
              </tr>
            </thead>
            <tbody>
              {comparison.options.map((option) => (
                <tr
                  key={option.key}
                  className={
                    option.key === comparison.bestValue?.key
                      ? 'border-b bg-yellow-50'
                      : 'border-b'
                  }
                >
                  <td className="py-1 pr-4">
                    {option.pkg.displayName}
                    {option.pkg.verifiedAt === null && (
                      <span className="ml-1 text-xs text-gray-500">(unverified)</span>
                    )}
                  </td>
                  <td className="py-1 pr-4">
                    {option.retailerName}
                    {option.isMemberPrice && (
                      <span className="ml-1 text-xs text-gray-500">(member)</span>
                    )}
                  </td>
                  <td className="py-1 pr-4">{formatCents(option.priceCents)}</td>
                  <td className="py-1 pr-4 font-medium">
                    {formatPerUnit(option.normalized)}
                  </td>
                  <td className="py-1 pr-4">
                    {option.quality === null
                      ? '--'
                      : `${Math.round(option.quality * 100)}% (${option.reviewCount})`}
                  </td>
                  <td className="py-1 text-xs text-gray-600">
                    {option.sourceLabel}, {formatAge(option.ageDays)}
                    {isStale(option) && (
                      <span className="ml-1 text-amber-700">stale</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

function Recommendation({
  label,
  option,
}: {
  label: string
  option: CompareOption | null
}) {
  if (!option) return null
  return (
    <div className="border p-3 text-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 font-medium">{option.pkg.displayName}</div>
      <div className="text-gray-600">
        {formatCents(option.priceCents)} at {option.retailerName}
        {option.isMemberPrice && ' (member)'} -- {formatPerUnit(option.normalized)}
      </div>
    </div>
  )
}
