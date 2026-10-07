/**
 * Compare: one product against every brand, size and store that sells it,
 * ranked per unit and weighed against reviews.
 *
 * The camera, a typed barcode and the product picker all drive the same
 * `compareByPackage`, so what shows is the real ranking either way.
 */
import { lazy, Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { compareByPackage } from '../lib/compare'
import { useCatalog, useLinkedRetailers } from '../lib/useCatalog'
import { useMediaQuery } from '../lib/useMediaQuery'
import { SEED_NOW } from '../data/seed'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { AddProductForm } from '../components/compare/AddProductForm'
import { PriceTag } from '../components/compare/PriceTag'
import { ProductFinder } from '../components/compare/ProductFinder'
import { QualitySlider } from '../components/compare/QualitySlider'
import { ShelfRow } from '../components/compare/ShelfRow'

// The chart library only loads on screens wide enough to show the chart.
const ValueFrontier = lazy(() => import('../components/compare/ValueFrontier'))

const DEFAULT_PRODUCT = 'p-heinz-20'

export function Compare() {
  const repo = useCatalog()
  const linked = useLinkedRetailers()
  const [params, setParams] = useSearchParams()
  const packageId = params.get('product') ?? DEFAULT_PRODUCT
  const [qualityWeight, setQualityWeight] = useState(0.5)
  const [unknownGtin, setUnknownGtin] = useState<string | null>(null)
  const wide = useMediaQuery('(min-width: 1024px)')

  const comparison = useMemo(
    () => compareByPackage(repo, packageId, { qualityWeight, now: SEED_NOW, memberRetailerIds: linked }),
    [repo, packageId, qualityWeight, linked],
  )

  function select(id: string) {
    setUnknownGtin(null)
    setParams({ product: id }, { replace: true })
  }

  const priciest = comparison ? Math.max(...comparison.options.map((o) => o.normalized.perUnit)) : 1

  return (
    <>
      <PageHeader title="Compare" description="Every brand, size and nearby store, ranked by what you pay per ounce." />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
          {unknownGtin ? (
            <AddProductForm
              key={unknownGtin}
              repo={repo}
              gtin={unknownGtin}
              onAdded={select}
              onCancel={() => setUnknownGtin(null)}
            />
          ) : (
            comparison && (
              <>
                <PriceTag repo={repo} comparison={comparison} />
                {comparison.options.length > 1 && (
                  <QualitySlider value={qualityWeight} onChange={setQualityWeight} />
                )}
              </>
            )
          )}
          <ProductFinder repo={repo} packageId={packageId} onSelect={select} onUnknown={setUnknownGtin} />
          {wide && comparison && !unknownGtin && (
            <Suspense fallback={null}>
              <ValueFrontier comparison={comparison} />
            </Suspense>
          )}
        </div>

        {!comparison || comparison.options.length === 0 ? (
          <Panel>
            <EmptyState title="Nothing on this shelf yet">
              No one has recorded a price for this product nearby. Add a receipt with it and it shows up
              here.
            </EmptyState>
          </Panel>
        ) : (
          <section aria-labelledby="all-prices">
            <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-2">
              <h2 id="all-prices" className="section-title">
                {comparison.conceptName} on the shelf
              </h2>
              <span className="font-mono text-sm text-ink-muted">
                {comparison.options.length} prices · per oz
              </span>
            </div>
            <ol key={packageId} aria-label="All prices">
              {comparison.options.map((option, index) => (
                <ShelfRow
                  key={option.key}
                  repo={repo}
                  option={option}
                  isPick={option.key === comparison.bestValue?.key}
                  share={option.normalized.perUnit / priciest}
                  index={index}
                />
              ))}
            </ol>
          </section>
        )}
      </div>
    </>
  )
}
