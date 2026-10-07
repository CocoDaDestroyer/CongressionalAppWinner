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
      className={`relative flex aspect-[1.7] max-h-52 flex-col justify-between overflow-hidden rounded-2xl p-5 text-on-card ${FILLS[index % FILLS.length]} ${retailer.supportsLoyalty ? '' : 'opacity-80'}`}
    >
      {/* The sticker motif, oversized and faint, as the card's only ornament. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -bottom-14 h-40 w-52 -rotate-12 rounded-[50%] border-[14px] border-on-card/10"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-extrabold">{retailer.name}</h3>
          <p className="text-sm text-on-card/75">
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
        <span className="font-display text-lg tracking-[0.2em] tabular">•••• {lastFour}</span>
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
