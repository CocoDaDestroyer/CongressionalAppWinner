/**
 * Provenance labels. A fresh store-site price needs none; only the facts a
 * shopper should notice get one: member pricing, community or receipt
 * evidence, staleness, and an unverified package.
 */
import { Link } from 'react-router-dom'
import { CircleAlert, CreditCard, Lock, ReceiptText, Users } from 'lucide-react'
import { isStale, type CompareOption } from '../../lib/compare'
import { Badge } from '../ui/Badge'

const icon = 'size-3.5'

export function PriceBadges({ option }: { option: CompareOption }) {
  return (
    <>
      {option.memberLocked ? (
        <Link to="/profile" className="rounded-sm hover:underline">
          <Badge icon={<Lock className={icon} aria-hidden="true" />}>
            Member price · link {option.retailerName} card
          </Badge>
        </Link>
      ) : (
        option.isMemberPrice && (
          <Badge tone="leaf" icon={<CreditCard className={icon} aria-hidden="true" />}>
            Member price
          </Badge>
        )
      )}
      {option.source === 'receipt' && (
        <Badge icon={<ReceiptText className={icon} aria-hidden="true" />}>Receipt</Badge>
      )}
      {option.source === 'user_report' && (
        <Badge tone="community" icon={<Users className={icon} aria-hidden="true" />}>
          Community
        </Badge>
      )}
      {isStale(option) && (
        <Badge tone="warn" icon={<CircleAlert className={icon} aria-hidden="true" />}>
          Stale
        </Badge>
      )}
      {option.pkg.verifiedAt === null && <Badge tone="warn">Unverified</Badge>}
    </>
  )
}
