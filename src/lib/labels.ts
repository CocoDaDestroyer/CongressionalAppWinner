/** Display names shared by every screen, so a store reads the same everywhere. */
import type { Store } from './catalog'
import type { CatalogRepository } from './repository'

export function retailerName(repo: CatalogRepository, store: Store): string {
  return repo.getRetailer(store.retailerId)?.name ?? 'Store'
}

/** "Ralphs Westwood": the chain plus the neighborhood that tells two apart. */
export function storeLabel(repo: CatalogRepository, storeOrId: Store | string): string {
  const store = typeof storeOrId === 'string' ? repo.getStore(storeOrId) : storeOrId
  if (!store) return 'Unknown store'
  return store.area ? `${retailerName(repo, store)} ${store.area}` : retailerName(repo, store)
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

/** "2026-08-14T12:00:00Z" -> "Aug 14". */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
