import { formatAge, formatCents, type CompareOption } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { Badge } from '../ui/Badge'
import { Stars } from '../Stars'
import { UnitPrice } from '../UnitPrice'
import { PriceBadges } from './PriceBadges'

interface OptionRowProps {
  repo: CatalogRepository
  option: CompareOption
  isPick: boolean
  isCheapest: boolean
}

export function OptionRow({ repo, option, isPick, isCheapest }: OptionRowProps) {
  return (
    <li className={`flex gap-4 px-4 py-3.5 sm:px-5 ${isPick ? 'bg-leaf-soft' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className={`leading-snug font-medium ${option.memberLocked ? 'text-ink-muted' : 'text-ink'}`}>
          {option.pkg.displayName}
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {storeLabel(repo, option.store)} · <span className="tabular">{formatCents(option.priceCents)}</span>
          <span className="whitespace-nowrap text-ink-faint"> · {formatAge(option.ageDays)}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 empty:hidden">
          {isPick && <Badge tone="leaf">Best value</Badge>}
          {isCheapest && !isPick && <Badge>Lowest per unit</Badge>}
          <PriceBadges option={option} />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <UnitPrice
          price={option.normalized}
          tone={isPick ? 'leaf' : option.memberLocked ? 'faint' : 'ink'}
        />
        <Stars quality={option.quality} reviewCount={option.reviewCount} />
      </div>
    </li>
  )
}
