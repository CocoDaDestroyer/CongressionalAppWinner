/**
 * Compare: one product against every brand, size and store that sells it,
 * ranked per unit and weighed against reviews.
 *
 * A camera scanner belongs here eventually; until then the same code path is
 * driven by picking a product or typing its barcode. `compareByPackage` cannot
 * tell the difference, so the ranking shown is the real one.
 */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { compareByPackage } from '../lib/compare'
import { useCatalog, useLinkedRetailers } from '../lib/useCatalog'
import { SEED_NOW } from '../data/seed'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { AddProductForm } from '../components/compare/AddProductForm'
import { BestValueCard } from '../components/compare/BestValueCard'
import { OptionRow } from '../components/compare/OptionRow'
import { ProductFinder } from '../components/compare/ProductFinder'
import { QualitySlider } from '../components/compare/QualitySlider'

const DEFAULT_PRODUCT = 'p-heinz-20'

export function Compare() {
  const repo = useCatalog()
  const linked = useLinkedRetailers()
  const [params, setParams] = useSearchParams()
  const packageId = params.get('product') ?? DEFAULT_PRODUCT
  const [qualityWeight, setQualityWeight] = useState(0.5)
  const [unknownGtin, setUnknownGtin] = useState<string | null>(null)

  const comparison = useMemo(
    () =>
      compareByPackage(repo, packageId, {
        qualityWeight,
        now: SEED_NOW,
        memberRetailerIds: linked,
      }),
    [repo, packageId, qualityWeight, linked],
  )

  function select(id: string) {
    setUnknownGtin(null)
    setParams({ product: id }, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Compare"
        description="Every brand, size and nearby store for one product, ranked by what you actually pay per ounce."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5 lg:sticky lg:top-10">
          <ProductFinder
            repo={repo}
            packageId={packageId}
            onSelect={select}
            onUnknown={setUnknownGtin}
          />
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
                <BestValueCard repo={repo} comparison={comparison} />
                {comparison.options.length > 1 && (
                  <QualitySlider value={qualityWeight} onChange={setQualityWeight} />
                )}
              </>
            )
          )}
        </div>

        {!comparison || comparison.options.length === 0 ? (
          <Panel>
            <EmptyState icon={<SearchX className="size-6" aria-hidden="true" />} title="No prices yet">
              Nobody has recorded a price for this product near you. Add a receipt that includes it
              and it will show up here.
            </EmptyState>
          </Panel>
        ) : (
          <Panel aria-labelledby="all-prices" className="overflow-hidden">
            <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
              <h2 id="all-prices" className="text-lg font-bold">
                Every {comparison.conceptName.toLowerCase()} nearby
              </h2>
              <span className="text-sm text-ink-muted tabular">
                {comparison.options.length} prices · cheapest per unit first
              </span>
            </div>
            <ol aria-label="All prices" className="divide-y divide-line">
              {comparison.options.map((option) => (
                <OptionRow
                  key={option.key}
                  repo={repo}
                  option={option}
                  isPick={option.key === comparison.bestValue?.key}
                  isCheapest={option.key === comparison.cheapest?.key}
                />
              ))}
            </ol>
          </Panel>
        )}
      </div>
    </>
  )
}
