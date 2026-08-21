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
 */
import type { PriceObservation, Receipt, ReceiptLine } from './catalog'
import {
  createInMemoryRepository,
  type CatalogRepository,
  type InMemoryData,
} from './repository'
import * as seed from '../data/seed'

const STORAGE_KEY = 'cartwise.receipts.v1'

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
  private receipts: Receipt[] = []
  private repository: CatalogRepository
  private listeners = new Set<() => void>()
  private sequence = 0

  private readonly base: InMemoryData

  constructor(base: InMemoryData = seed) {
    this.base = base
    this.receipts = loadReceipts()
    this.repository = this.build()
  }

  private build(): CatalogRepository {
    return createInMemoryRepository({
      ...this.base,
      priceObservations: [
        ...this.base.priceObservations,
        ...receiptsToObservations(this.receipts),
      ],
    })
  }

  /** Stable while nothing changes, so `useSyncExternalStore` can compare it. */
  getRepository = (): CatalogRepository => this.repository

  getReceipts = (): readonly Receipt[] => this.receipts

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

  private commit(): void {
    this.repository = this.build()
    saveReceipts(this.receipts)
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

function loadReceipts(): Receipt[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Receipt[]) : []
  } catch {
    // Corrupt or unreadable storage should cost the shopper their history, not
    // the whole app.
    return []
  }
}

function saveReceipts(receipts: readonly Receipt[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
  } catch {
    // Private browsing and full quotas both throw here; losing persistence is
    // survivable, crashing on save is not.
  }
}

/** The single store the app runs on. */
export const catalogStore = new CatalogStore()
