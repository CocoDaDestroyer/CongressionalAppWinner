/**
 * One option on the shelf: name, a dotted leader to its per-unit price, and a
 * bar whose length is that price (shorter is better). Provenance is stamped
 * underneath and inked into the price itself.
 */
import type { CSSProperties } from 'react'
import { formatAge, formatCents, type CompareOption } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { InkPrice } from '../print/InkPrice'
import { Stars } from '../Stars'
import { PriceBadges } from './PriceBadges'

interface ShelfRowProps {
  repo: CatalogRepository
  option: CompareOption
  isPick: boolean
  /** Bar length, 0..1, relative to the priciest option on the shelf. */
  share: number
  index: number
}

export function ShelfRow({ repo, option, isPick, share, index }: ShelfRowProps) {
  const bar = isPick ? 'bg-teal' : option.memberLocked ? 'bg-rule' : 'bg-ink'
  return (
    <li
      style={{ animationDelay: `${index * 40}ms` } as CSSProperties}
      className={`animate-fade-up border-b border-dotted border-b-rule border-l-[3px] [border-left-style:solid] px-4 py-3.5 sm:px-5 ${isPick ? 'border-l-teal bg-teal-wash' : 'border-l-transparent'}`}
    >
      <div className="flex items-baseline gap-2">
        <p className={`min-w-0 flex-1 font-semibold leading-snug sm:flex-none ${option.memberLocked ? 'text-ink-muted' : ''}`}>
          {option.pkg.displayName}
        </p>
        <span className="leader hidden sm:block" aria-hidden="true" />
        <InkPrice price={option.normalized} ageDays={option.ageDays} pick={isPick} locked={option.memberLocked} />
      </div>
      <div className="mt-2 h-1.5 rounded-[1px] bg-paper-sunken" aria-hidden="true">
        <div className={`h-full rounded-[1px] ${bar}`} style={{ width: `${Math.max(share * 100, 4)}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-ink-muted">
        <span>
          {storeLabel(repo, option.store)} · {formatCents(option.priceCents)} ·{' '}
          <span className="whitespace-nowrap">{formatAge(option.ageDays)}</span>
        </span>
        <Stars quality={option.quality} reviewCount={option.reviewCount} />
        <PriceBadges option={option} />
      </div>
    </li>
  )
}
