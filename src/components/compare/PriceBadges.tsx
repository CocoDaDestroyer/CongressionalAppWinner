/**
 * Provenance stamps. A fresh store-site price needs none; only what a shopper
 * should notice gets one: member pricing, receipt or community evidence,
 * staleness, and an unverified package.
 */
import { Link } from 'react-router-dom'
import { CreditCard, Lock } from 'lucide-react'
import { isStale, type CompareOption } from '../../lib/compare'
import { Stamp } from '../print/Stamp'

const icon = 'size-3'

export function PriceBadges({ option }: { option: CompareOption }) {
  return (
    <>
      {option.memberLocked ? (
        <Link to="/profile" viewTransition className="rounded-tag hover:opacity-80">
          <Stamp icon={<Lock className={icon} aria-hidden="true" />} tilt={-1}>
            Member price · link {option.retailerName} card
          </Stamp>
        </Link>
      ) : (
        option.isMemberPrice && (
          <Stamp tone="teal" icon={<CreditCard className={icon} aria-hidden="true" />} tilt={-2}>
            Member price
          </Stamp>
        )
      )}
      {option.source === 'receipt' && <Stamp tilt={2}>Receipt</Stamp>}
      {option.source === 'user_report' && (
        <Stamp tone="community" tilt={-2}>
          Community
        </Stamp>
      )}
      {isStale(option) && (
        <Stamp tone="brick" tilt={2}>
          Stale · {option.ageDays} days old
        </Stamp>
      )}
      {option.pkg.verifiedAt === null && (
        <Stamp tone="amber" tilt={-1}>
          Unverified
        </Stamp>
      )}
    </>
  )
}
