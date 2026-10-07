/**
 * Provenance travels with every price: where it came from, how old it is, and
 * whether it needs a store card.
 */
import { Link } from 'react-router-dom'
import { BadgeCheck, Clock, CreditCard, Globe, Lock, ReceiptText, TriangleAlert, Users } from 'lucide-react'
import { formatAge, isStale, type CompareOption } from '../../lib/compare'
import type { PriceSource } from '../../lib/catalog'
import { Badge, type BadgeTone } from '../ui/Badge'

const SOURCE: Record<PriceSource, { label: string; tone: BadgeTone; icon: typeof Globe }> = {
  scrape: { label: 'Store site', tone: 'neutral', icon: Globe },
  loyalty_sync: { label: 'Member price', tone: 'leaf', icon: CreditCard },
  receipt: { label: 'Receipt', tone: 'neutral', icon: ReceiptText },
  user_report: { label: 'Community', tone: 'community', icon: Users },
}

const iconClass = 'size-3.5'

export function PriceBadges({ option }: { option: CompareOption }) {
  const source = SOURCE[option.source]
  const stale = isStale(option)

  return (
    <>
      {option.memberLocked ? (
        <Link to="/profile" className="rounded-full">
          <Badge tone="neutral" icon={<Lock className={iconClass} aria-hidden="true" />}>
            Member price · link {option.retailerName} card
          </Badge>
        </Link>
      ) : (
        <Badge tone={source.tone} icon={<source.icon className={iconClass} aria-hidden="true" />}>
          {source.label}
        </Badge>
      )}
      {option.isMemberPrice && option.source !== 'loyalty_sync' && !option.memberLocked && (
        <Badge tone="leaf">Member price</Badge>
      )}
      <Badge
        tone={stale ? 'warn' : 'neutral'}
        icon={
          stale ? (
            <TriangleAlert className={iconClass} aria-hidden="true" />
          ) : (
            <Clock className={iconClass} aria-hidden="true" />
          )
        }
      >
        {stale ? `Stale · ${formatAge(option.ageDays)}` : formatAge(option.ageDays)}
      </Badge>
      {option.pkg.verifiedAt === null && (
        <Badge tone="warn" icon={<BadgeCheck className={iconClass} aria-hidden="true" />}>
          Unverified product
        </Badge>
      )}
    </>
  )
}
