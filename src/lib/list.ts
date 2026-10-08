/**
 * The shopping list: how many of each product concept the shopper wants.
 * Shared by Trip (which plans it) and Compare ("add to trip list"), kept in
 * localStorage so it survives navigation and reloads.
 */
const KEY = 'cartwise.list.v1'

export type Quantities = Record<string, number>

/** A weekly top-up: big enough that the planner has real choices to make. */
export const STARTER_LIST: Quantities = {
  'c-milk': 1,
  'c-ketchup': 1,
  'c-bread': 1,
  'c-pasta': 2,
  'c-coffee': 1,
  'c-yogurt': 1,
}

export class ShoppingList {
  private quantities: Quantities
  private listeners = new Set<() => void>()
  private readonly starter: Quantities

  constructor(starter: Quantities = STARTER_LIST) {
    this.starter = starter
    this.quantities = read(starter)
  }

  /** Stable until the list changes, so `useSyncExternalStore` can compare it. */
  get = (): Quantities => this.quantities

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  set(conceptId: string, quantity: number): void {
    this.quantities = { ...this.quantities, [conceptId]: Math.max(0, Math.floor(quantity)) }
    this.commit()
  }

  add(conceptId: string): void {
    this.set(conceptId, (this.quantities[conceptId] ?? 0) + 1)
  }

  reset(): void {
    this.quantities = { ...this.starter }
    this.commit()
  }

  private commit(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.quantities))
    } catch {
      // Private browsing and full quotas both throw; the list just won't persist.
    }
    for (const listener of this.listeners) listener()
  }
}

function read(starter: Quantities): Quantities {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(KEY)
    if (raw === null) return { ...starter }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter(([, n]) => Number.isInteger(n) && (n as number) >= 0),
      ) as Quantities
    }
  } catch {
    // Fall through to the starter list.
  }
  return { ...starter }
}

export const shoppingList = new ShoppingList()
