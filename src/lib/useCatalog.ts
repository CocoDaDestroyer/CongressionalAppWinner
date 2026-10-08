/**
 * React binding for the catalog store.
 *
 * Screens read the repository through this hook rather than constructing their
 * own, so a receipt entered on one screen re-renders every other screen that
 * depends on prices.
 */
import { useSyncExternalStore } from 'react'
import { catalogStore } from './store'
import type { CatalogRepository } from './repository'
import type { Receipt } from './catalog'
import { shoppingList, type Quantities } from './list'

export function useCatalog(): CatalogRepository {
  return useSyncExternalStore(catalogStore.subscribe, catalogStore.getRepository)
}

export function useReceipts(): readonly Receipt[] {
  return useSyncExternalStore(catalogStore.subscribe, catalogStore.getReceipts)
}

/** Retailers whose store card is linked, so their member prices apply. */
export function useLinkedRetailers(): readonly string[] {
  return useSyncExternalStore(catalogStore.subscribe, catalogStore.getLinkedRetailerIds)
}

export function useShoppingList(): Quantities {
  return useSyncExternalStore(shoppingList.subscribe, shoppingList.get)
}
