import { formatCents, type CompareOption } from '../../lib/compare'
import { storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { Badge } from '../ui/Badge'
import { Stars } from '../Stars'
import { Sticker } from '../Sticker'
import { PriceBadges } from './PriceBadges'

interface OptionRowProps {
  repo: CatalogRepository
  option: CompareOption
  isPick: boolean
  isCheapest: boolean
}

export function OptionRow({ repo, option, isPick, isCheapest }: OptionRowProps) {
  return (
    <li
      className={`flex gap-4 px-4 py-4 sm:px-5 ${option.memberLocked ? 'opacity-75' : ''} ${isPick ? 'bg-leaf-soft/50' : ''}`}
    >
      <Sticker
        price={option.normalized}
        variant={isPick ? 'winner' : option.memberLocked ? 'locked' : 'plain'}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="leading-snug font-semibold text-ink">{option.pkg.displayName}</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              {storeLabel(repo, option.store)} ·{' '}
              <span className="tabular">{formatCents(option.priceCents)}</span>
            </p>
          </div>
          <Stars quality={option.quality} reviewCount={option.reviewCount} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {isPick && <Badge tone="leaf">Top pick</Badge>}
          {isCheapest && !isPick && <Badge tone="savings">Lowest per unit</Badge>}
          <PriceBadges option={option} />
        </div>
      </div>
    </li>
  )
}
