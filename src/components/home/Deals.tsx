/**
 * Deals near you: the catalog's biggest per-unit gaps, each the same pick
 * Compare would make. Every row opens that product in Compare.
 */
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatAge, formatShelfUnit, packageSize } from '../../lib/compare'
import type { Deal } from '../../lib/deals'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { SaleTag } from '../print/SaleTag'

export function Deals({ repo, deals }: { repo: CatalogRepository; deals: Deal[] }) {
  if (deals.length === 0) return null
  return (
    <section aria-labelledby="deals-title">
      <h2 id="deals-title" className="section-title">
        Deals near you
      </h2>
      <p className="mt-1 mb-4 text-sm text-ink-muted">Best value per ounce, measured against the typical price.</p>
      <ul className="border-t-2 border-ink">
        {deals.map(({ conceptName, option, percentLess }) => (
          <li key={option.key}>
            <Link
              to={`/compare?product=${option.pkg.id}`}
              viewTransition
              className="group flex items-center gap-3 border-b border-rule py-3.5 hover:bg-paper-raised"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-tight font-bold tracking-[-0.02em]">
                  {conceptName}, {packageSize(option.pkg)}
                </span>
                <span className="block truncate text-sm text-ink-muted">
                  {storeLabel(repo, option.store)} · {formatAge(option.ageDays)}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="font-mono text-[17px] font-medium tabular">{formatShelfUnit(option.normalized)}</span>
                <SaleTag size="sm">{percentLess}% below typical</SaleTag>
              </span>
              <ArrowRight
                className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
