import { CreditCard } from 'lucide-react'
import type { Retailer } from '../../lib/catalog'
import { plural } from '../../lib/labels'
import { catalogStore } from '../../lib/store'
import { Switch } from '../ui/Switch'

const FILLS = ['bg-card-1', 'bg-card-2', 'bg-card-3']

interface StoreCardProps {
  retailer: Retailer
  index: number
  linked: boolean
  memberPriceCount: number
}

/** A wallet card. Linking it lets that chain's member prices into every plan. */
export function StoreCard({ retailer, index, linked, memberPriceCount }: StoreCardProps) {
  // A stable, obviously fake card number per retailer.
  const lastFour = String(
    [...retailer.id].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 10_000, 7),
  ).padStart(4, '0')

  return (
    <article
      aria-label={`${retailer.name} card`}
      className={`relative flex h-36 flex-col justify-between overflow-hidden rounded-card border-[1.5px] border-ink p-5 text-on-card ${FILLS[index % FILLS.length]} ${retailer.supportsLoyalty ? '' : 'opacity-80'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em]">{retailer.name}</h3>
          <p className="font-mono text-xs text-on-card/75">
            {retailer.supportsLoyalty ? 'Rewards card' : 'No member pricing'}
          </p>
        </div>
        {retailer.supportsLoyalty && (
          <Switch
            tone="inverse"
            checked={linked}
            label={`Link ${retailer.name} card`}
            onChange={(on) => catalogStore.setCardLinked(retailer.id, on)}
          />
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-mono text-[15px] tracking-[0.15em] opacity-90">•••• {lastFour}</span>
        {retailer.supportsLoyalty && (
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <CreditCard className="size-4" aria-hidden="true" />
            {linked ? `${plural(memberPriceCount, 'member price')} on` : 'Not linked'}
          </span>
        )}
      </div>
    </article>
  )
}
