// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Spending } from './Spending'
import { catalogStore } from '../lib/store'
import * as seed from '../data/seed'

/** The screen reads the shared store, so each test starts from a clean one. */
beforeEach(() => {
  for (const receipt of [...catalogStore.getReceipts()]) {
    catalogStore.deleteReceipt(receipt.id)
  }
  localStorage.clear()
})

describe('Spending screen', () => {
  it('starts with nothing tracked', () => {
    render(<Spending />)
    expect(screen.getByText(/Nothing yet/)).toBeTruthy()
  })

  it('totals a single receipt into the year and all-time figures', () => {
    catalogStore.recordReceipt({
      storeId: seed.stores[0].id,
      purchasedAt: '2026-08-21T12:00:00Z',
      lines: [{ packageId: seed.packages[0].id, quantity: 2, unitPriceCents: 299 }],
    })

    render(<Spending />)
    expect(screen.getAllByText('$5.98').length).toBeGreaterThan(0)
  })

  it('groups receipts from the same month together', () => {
    catalogStore.recordReceipt({
      storeId: seed.stores[0].id,
      purchasedAt: '2026-08-05T12:00:00Z',
      lines: [{ packageId: seed.packages[0].id, quantity: 1, unitPriceCents: 300 }],
    })
    catalogStore.recordReceipt({
      storeId: seed.stores[0].id,
      purchasedAt: '2026-08-21T12:00:00Z',
      lines: [{ packageId: seed.packages[0].id, quantity: 1, unitPriceCents: 400 }],
    })

    render(<Spending />)
    expect(screen.getByText('August 2026')).toBeTruthy()
    expect(screen.getAllByText('$7.00').length).toBeGreaterThan(0)
    // Both receipts land in the same month row.
    const row = screen.getByText('August 2026').closest('tr')
    expect(row?.textContent).toContain('2')
  })

  it('breaks totals down by store', () => {
    catalogStore.recordReceipt({
      storeId: seed.stores[0].id,
      purchasedAt: '2026-08-21T12:00:00Z',
      lines: [{ packageId: seed.packages[0].id, quantity: 1, unitPriceCents: 500 }],
    })

    render(<Spending />)
    expect(screen.getByText('By store')).toBeTruthy()
    expect(screen.getAllByText('$5.00').length).toBeGreaterThan(0)
  })
})
