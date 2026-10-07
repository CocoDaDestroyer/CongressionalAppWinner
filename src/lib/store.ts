/**
 * The app's live catalog: seed data plus whatever the shopper has entered,
 * kept in memory, persisted to localStorage, and observable by React.
 *
 * This is the stand-in for Supabase. It exists so the ingestion path is real --
 * a receipt entered on the Receipts screen genuinely changes what the Scan and
 * List screens recommend, which is the behaviour that matters and the thing a
 * mocked backend would not prove.
 *
 * Receipts are the stored truth; price observations are derived from them on
 * every rebuild. That direction matters: correcting a receipt corrects the
 * prices it produced, and no observation can outlive the receipt that made it.
 *
 * Two more pieces of shopper state live here because they change prices:
 * which store cards are linked (member pricing), and community contributions
 * (products and prices the catalog could not source, tagged `user_report`).
 */
import type { Package, PriceObservation, Receipt, ReceiptLine } from './catalog'
import {
  createInMemoryRepository,
  type CatalogRepository,
  type InMemoryData,
} from './repository'
import type { Unit } from './units'
import * as seed from '../data/seed'

const STORAGE_KEY = 'cartwise.receipts.v1'
const CARDS_KEY = 'cartwise.cards.v1'
const CONTRIBUTIONS_KEY = 'cartwise.contributions.v1'

/** What the shopper has added to the catalog by hand. */
export interface Contributions {
  packages: Package[]
  observations: PriceObservation[]
}

const NO_CONTRIBUTIONS: Contributions = { packages: [], observations: [] }

export interface PriceReport {
  packageId: string
  storeId: string
  priceCents: number
}

/** An unknown barcode, described by the shopper who scanned it. */
export interface NewProduct {
  gtin: string
  displayName: string
  conceptId: string
  size: number
  unit: Unit
  storeId: string
  priceCents: number
}

export interface CatalogStoreOptions {
  /** Receipts a fresh browser starts with, and what a reset restores. */
  initialReceipts?: readonly Receipt[]
  /** "Now" for community reports; injected so the demo and tests can pin it. */
  clock?: () => Date
}

export interface NewReceiptLine {
  packageId: string
  quantity: number
  unitPriceCents: number
}

export interface NewReceipt {
  storeId: string
  /** ISO date or timestamp of checkout. */
  purchasedAt: string
  lines: NewReceiptLine[]
}

/** Turn stored receipts into the price observations they imply. */
export function receiptsToObservations(
  receipts: readonly Receipt[],
): PriceObservation[] {
  return receipts.flatMap((receipt) =>
    receipt.lines.map((line) => ({
      id: `obs-${line.id}`,
      packageId: line.packageId,
      storeId: receipt.storeId,
      priceCents: line.unitPriceCents,
      // A receipt records what was actually paid at the register, which may be
      // a member price; the entry form is what knows which.
      isMemberPrice: line.isMemberPrice,
      source: 'receipt' as const,
      observedAt: receipt.purchasedAt,
    })),
  )
}

export class CatalogStore {
  private receipts: Receipt[]
  private linkedRetailerIds: readonly string[]
  private contributions: Contributions
  private repository: CatalogRepository
  private listeners = new Set<() => void>()
  private sequence = 0

  private readonly base: InMemoryData
  private readonly initialReceipts: readonly Receipt[]
  private readonly clock: () => Date

  constructor(
    base: InMemoryData = seed,
    { initialReceipts = [], clock = () => new Date() }: CatalogStoreOptions = {},
  ) {
    this.base = base
    this.initialReceipts = initialReceipts
    this.clock = clock
    this.receipts = load(STORAGE_KEY, isArray, [...initialReceipts])
    this.linkedRetailerIds = load(CARDS_KEY, isArray, [])
    this.contributions = load(CONTRIBUTIONS_KEY, isContributions, NO_CONTRIBUTIONS)
    this.repository = this.build()
  }

  private build(): CatalogRepository {
    return createInMemoryRepository({
      ...this.base,
      packages: [...this.base.packages, ...this.contributions.packages],
      priceObservations: [
        ...this.base.priceObservations,
        ...this.contributions.observations,
        ...receiptsToObservations(this.receipts),
      ],
    })
  }

  /** Stable while nothing changes, so `useSyncExternalStore` can compare it. */
  getRepository = (): CatalogRepository => this.repository

  getReceipts = (): readonly Receipt[] => this.receipts

  /** Retailers whose store card is linked, so their member prices apply. */
  getLinkedRetailerIds = (): readonly string[] => this.linkedRetailerIds

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  recordReceipt(input: NewReceipt): Receipt {
    const usable = input.lines.filter((l) => l.quantity > 0)
    if (usable.length === 0) {
      throw new RangeError('a receipt needs at least one line')
    }

    const receiptId = `r-${++this.sequence}-${Date.now()}`
    const receipt: Receipt = {
      id: receiptId,
      storeId: input.storeId,
      purchasedAt: input.purchasedAt,
      createdAt: new Date().toISOString(),
      lines: usable.map((line, index) => ({
        id: `${receiptId}-${index}`,
        packageId: line.packageId,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
        isMemberPrice: false,
      })),
    }

    this.receipts = [receipt, ...this.receipts]
    this.commit()
    return receipt
  }

  deleteReceipt(receiptId: string): void {
    const remaining = this.receipts.filter((r) => r.id !== receiptId)
    if (remaining.length === this.receipts.length) return
    this.receipts = remaining
    this.commit()
  }

  setCardLinked(retailerId: string, linked: boolean): void {
    if (this.linkedRetailerIds.includes(retailerId) === linked) return
    this.linkedRetailerIds = linked
      ? [...this.linkedRetailerIds, retailerId]
      : this.linkedRetailerIds.filter((id) => id !== retailerId)
    // Member prices are filtered by the screens, not baked into the
    // repository, so linking a card only has to tell subscribers.
    save(CARDS_KEY, this.linkedRetailerIds)
    this.notify()
  }

  /**
   * Record a shelf price the shopper saw. It is the least trusted source, so a
   * scrape at the same instant beats it and any newer scrape replaces it.
   */
  reportPrice({ packageId, storeId, priceCents }: PriceReport): PriceObservation {
    if (!Number.isInteger(priceCents) || priceCents <= 0) {
      throw new RangeError(`a reported price must be a positive number of cents, got ${priceCents}`)
    }
    const observation: PriceObservation = {
      id: `u-${++this.sequence}-${Date.now()}`,
      packageId,
      storeId,
      priceCents,
      isMemberPrice: false,
      source: 'user_report',
      observedAt: this.clock().toISOString(),
    }
    this.contributions = {
      ...this.contributions,
      observations: [...this.contributions.observations, observation],
    }
    this.commit()
    return observation
  }

  /**
   * Add a package the catalog has never seen, with the price it was found at.
   * It stays unverified until a retailer source confirms it.
   */
  contributeProduct(input: NewProduct): Package {
    if (this.repository.getPackageByGtin(input.gtin)) {
      throw new RangeError(`GTIN ${input.gtin} is already in the catalog`)
    }
    const pkg: Package = {
      id: `p-user-${input.gtin}`,
      conceptId: input.conceptId,
      brandId: null,
      gtin: input.gtin,
      displayName: input.displayName,
      size: input.size,
      unit: input.unit,
      packCount: null,
      verifiedAt: null,
    }
    this.contributions = {
      ...this.contributions,
      packages: [...this.contributions.packages, pkg],
    }
    this.reportPrice({ packageId: pkg.id, storeId: input.storeId, priceCents: input.priceCents })
    return pkg
  }

  /** Back to a fresh install: seeded history, no cards, no contributions. */
  resetDemoData(): void {
    this.receipts = [...this.initialReceipts]
    this.linkedRetailerIds = []
    this.contributions = NO_CONTRIBUTIONS
    save(CARDS_KEY, this.linkedRetailerIds)
    this.commit()
  }

  private commit(): void {
    this.repository = this.build()
    save(STORAGE_KEY, this.receipts)
    save(CONTRIBUTIONS_KEY, this.contributions)
    this.notify()
  }

  private notify(): void {
    for (const listener of this.listeners) listener()
  }
}

/** Total of a receipt in cents. Derived, never stored, so it cannot disagree. */
export function receiptTotalCents(receipt: Receipt): number {
  return receipt.lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  )
}

export function lineTotalCents(line: ReceiptLine): number {
  return line.unitPriceCents * line.quantity
}

/**
 * Read a stored value, falling back when it is missing. Corrupt or unreadable
 * storage falls back to empty rather than to the default, so it costs the
 * shopper their history, not the whole app.
 */
function load<T>(key: string, valid: (value: unknown) => boolean, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return valid(parsed) ? (parsed as T) : emptyLike(fallback)
  } catch {
    return emptyLike(fallback)
  }
}

function emptyLike<T>(value: T): T {
  return (Array.isArray(value) ? [] : NO_CONTRIBUTIONS) as T
}

function save(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private browsing and full quotas both throw here; losing persistence is
    // survivable, crashing on save is not.
  }
}

const isArray = (value: unknown) => Array.isArray(value)

const isContributions = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray((value as Contributions).packages) &&
  Array.isArray((value as Contributions).observations)

/**
 * The single store the app runs on. It starts with the seeded receipt history
 * and lives on the seed's pinned "today", so a community report made in the
 * demo reads as fresh next to the seeded prices.
 */
export const catalogStore = new CatalogStore(seed, {
  initialReceipts: seed.receiptHistory,
  clock: () => seed.SEED_NOW,
})
