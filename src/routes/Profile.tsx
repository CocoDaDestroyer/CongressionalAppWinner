/**
 * Profile: store cards (which unlock member prices everywhere), appearance,
 * and a reset for the demo.
 */
import { useMemo, useState } from 'react'
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react'
import { catalogStore } from '../lib/store'
import { themeStore, useThemePreference, type ThemePreference } from '../lib/theme'
import { useCatalog, useLinkedRetailers } from '../lib/useCatalog'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { StoreCard } from '../components/profile/StoreCard'

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function Profile() {
  const repo = useCatalog()
  const linked = useLinkedRetailers()
  const theme = useThemePreference()
  const [confirmReset, setConfirmReset] = useState(false)

  const memberPrices = useMemo(() => {
    const counts = new Map<string, number>()
    const prices = repo.getCurrentPrices(repo.getPackages().map((p) => p.id))
    for (const price of prices.filter((p) => p.isMemberPrice)) {
      const retailerId = repo.getStore(price.storeId)?.retailerId
      if (retailerId) counts.set(retailerId, (counts.get(retailerId) ?? 0) + 1)
    }
    return counts
  }, [repo])

  return (
    <>
      <PageHeader title="Profile" />

      <section aria-labelledby="cards-title">
        <h2 id="cards-title" className="text-lg font-semibold">
          Store cards
        </h2>
        <p className="mt-1 max-w-[60ch] text-sm text-ink-muted">
          Link a card and its member prices count in Compare and Trip. Cards here are samples; nothing
          connects to a real account.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {repo.getRetailers().map((retailer, index) => (
            <StoreCard
              key={retailer.id}
              retailer={retailer}
              index={index}
              linked={linked.includes(retailer.id)}
              memberPriceCount={memberPrices.get(retailer.id) ?? 0}
            />
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Panel aria-labelledby="appearance-title" className="p-5">
          <h2 id="appearance-title" className="font-semibold">
            Appearance
          </h2>
          <div role="radiogroup" aria-labelledby="appearance-title" className="mt-3 grid grid-cols-3 gap-1 rounded-control bg-sunken p-1">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => themeStore.setPreference(value)}
                className={`flex h-9 items-center justify-center gap-2 rounded-[8px] text-sm font-medium transition-colors ${
                  theme === value ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel aria-labelledby="demo-title" className="p-5">
          <h2 id="demo-title" className="font-semibold">
            Demo data
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Restore the sample receipts and prices, unlink every card, and remove community additions.
          </p>
          {confirmReset ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="danger"
                icon={<RotateCcw className="size-4" aria-hidden="true" />}
                onClick={() => {
                  catalogStore.resetDemoData()
                  setConfirmReset(false)
                }}
              >
                Yes, reset everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="mt-3"
              icon={<RotateCcw className="size-4" aria-hidden="true" />}
              onClick={() => setConfirmReset(true)}
            >
              Reset demo data
            </Button>
          )}
        </Panel>
      </div>
    </>
  )
}
