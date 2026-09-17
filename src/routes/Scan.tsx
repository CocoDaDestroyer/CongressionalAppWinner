/**
 * The comparison screen.
 *
 * A camera barcode scanner belongs here eventually, but it needs a phone to
 * check. Until then the same code path is driven by picking a package or typing
 * a GTIN by hand -- `compareByPackage` cannot tell the difference, so what you
 * see here is the real ranking, not a mock of it.
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
import { useCatalog } from '../lib/useCatalog'
import * as seed from '../data/seed'
import {
  BUTTON_SECONDARY,
  CARD,
  FIELD_LABEL,
  HEADING,
  INPUT,
  INTRO,
  MUTED_SMALL,
  PAGE,
  SLIDER,
  sliderFill,
  STAT_LABEL,
  TABLE,
  TABLE_CELL,
  TABLE_HEAD_CELL,
  TABLE_HEAD_ROW,
  TABLE_ROW,
  TABLE_ROW_HIGHLIGHT,
  TABLE_WRAP,
} from '../lib/ui'

export function Scan() {
  const repo = useCatalog()
  const [packageId, setPackageId] = useState('p-heinz-20')
  const [gtin, setGtin] = useState('')
  const [gtinError, setGtinError] = useState<string | null>(null)
  const [qualityWeight, setQualityWeight] = useState(0.5)

  const comparison = useMemo(
    () => compareByPackage(repo, packageId, { qualityWeight, now: seed.SEED_NOW }),
    [repo, packageId, qualityWeight],
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
    <section className={PAGE}>
      <h1 className={HEADING}>Scan</h1>
      <p className={INTRO}>
        Standing in for the camera: pick a product or enter a barcode. Prices come
        from the local catalog, including any receipts you have entered.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-6">
        <label className="text-sm">
          <span className={FIELD_LABEL}>Product</span>
          <select
            className={`mt-1 ${INPUT}`}
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
          <span className={FIELD_LABEL}>Barcode (GTIN-14)</span>
          <div className="mt-1 flex gap-2">
            <input
              className={`${INPUT} font-mono`}
              placeholder="00013000006415"
              value={gtin}
              onChange={(e) => setGtin(e.target.value)}
            />
            <button className={BUTTON_SECONDARY} type="submit">
              Look up
            </button>
          </div>
        </form>

        <label className="text-sm">
          <span className={FIELD_LABEL}>
            Quality vs. price: {Math.round(qualityWeight * 100)}% quality
          </span>
          <input
            className={`mt-3 w-56 ${SLIDER}`}
            style={sliderFill(qualityWeight * 100)}
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
          <p className={`${INTRO} mt-5`}>
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

          <div className={`mt-6 max-w-4xl ${TABLE_WRAP}`}>
            <table className={TABLE}>
              <thead>
                <tr className={TABLE_HEAD_ROW}>
                  <th className={TABLE_HEAD_CELL}>Product</th>
                  <th className={TABLE_HEAD_CELL}>Store</th>
                  <th className={TABLE_HEAD_CELL}>Price</th>
                  <th className={TABLE_HEAD_CELL}>Per unit</th>
                  <th className={TABLE_HEAD_CELL}>Quality</th>
                  <th className={TABLE_HEAD_CELL}>Source</th>
                </tr>
              </thead>
              <tbody>
                {comparison.options.map((option) => (
                  <tr
                    key={option.key}
                    className={
                      option.key === comparison.bestValue?.key
                        ? TABLE_ROW_HIGHLIGHT
                        : TABLE_ROW
                    }
                  >
                    <td className={TABLE_CELL}>
                      {option.pkg.displayName}
                      {option.pkg.verifiedAt === null && (
                        <span className={`ml-1 ${MUTED_SMALL}`}>(unverified)</span>
                      )}
                    </td>
                    <td className={TABLE_CELL}>
                      {option.retailerName}
                      {option.isMemberPrice && (
                        <span className={`ml-1 ${MUTED_SMALL}`}>(member)</span>
                      )}
                    </td>
                    <td className={TABLE_CELL}>{formatCents(option.priceCents)}</td>
                    <td className={`${TABLE_CELL} font-medium`}>
                      {formatPerUnit(option.normalized)}
                    </td>
                    <td className={TABLE_CELL}>
                      {option.quality === null
                        ? '--'
                        : `${Math.round(option.quality * 100)}% (${option.reviewCount})`}
                    </td>
                    <td className={`${TABLE_CELL} ${MUTED_SMALL}`}>
                      {option.sourceLabel}, {formatAge(option.ageDays)}
                      {isStale(option) && (
                        <span className="ml-1 text-amber-700">stale</span>
                      )}
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

function Recommendation({
  label,
  option,
}: {
  label: string
  option: CompareOption | null
}) {
  if (!option) return null
  return (
    <div className={CARD}>
      <div className={STAT_LABEL}>{label}</div>
      <div className="mt-1 font-medium">{option.pkg.displayName}</div>
      <div className="text-ink/70">
        {formatCents(option.priceCents)} at {option.retailerName}
        {option.isMemberPrice && ' (member)'} -- {formatPerUnit(option.normalized)}
      </div>
    </div>
  )
}
