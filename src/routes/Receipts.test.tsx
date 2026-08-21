// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Receipts } from './Receipts'
import { Scan } from './Scan'
import { catalogStore } from '../lib/store'

/** The screens share one store, so each test has to start from a clean one. */
beforeEach(() => {
  for (const receipt of [...catalogStore.getReceipts()]) {
    catalogStore.deleteReceipt(receipt.id)
  }
  localStorage.clear()
})

function fillLine(index: number, packageId: string, quantity: string, price: string) {
  fireEvent.change(screen.getByLabelText(`Item ${index}`), {
    target: { value: packageId },
  })
  fireEvent.change(screen.getByLabelText(`Quantity ${index}`), {
    target: { value: quantity },
  })
  fireEvent.change(screen.getByLabelText(`Price ${index}`), {
    target: { value: price },
  })
}

describe('Receipts screen', () => {
  it('starts with nothing saved', () => {
    render(<Receipts />)
    expect(screen.getByText(/Nothing yet/)).toBeTruthy()
  })

  it('refuses a line with no price', () => {
    render(<Receipts />)
    fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }))
    expect(screen.getByText(/Every line needs a quantity and a price/)).toBeTruthy()
    expect(screen.getByText(/Nothing yet/)).toBeTruthy()
  })

  it('refuses a zero price', () => {
    render(<Receipts />)
    fillLine(1, 'p-heinz-20', '1', '0')
    fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }))
    expect(screen.getByText(/greater than zero/)).toBeTruthy()
  })

  it('saves a receipt and totals it by quantity', () => {
    render(<Receipts />)
    fillLine(1, 'p-heinz-20', '2', '2.99')
    fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }))

    expect(screen.getByText(/Saved\./)).toBeTruthy()
    // 2 x $2.99, both as the receipt total and as the single line total.
    expect(screen.getAllByText('$5.98').length).toBeGreaterThan(0)
  })

  it('adds and totals multiple lines', () => {
    render(<Receipts />)
    fillLine(1, 'p-heinz-20', '1', '3.00')
    fireEvent.click(screen.getByRole('button', { name: 'Add line' }))
    fillLine(2, 'p-lucerne-12', '2', '5.00')
    expect(screen.getByText('Total $13.00')).toBeTruthy()
  })

  it('deletes a saved receipt', () => {
    render(<Receipts />)
    fillLine(1, 'p-heinz-20', '1', '2.99')
    fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/Nothing yet/)).toBeTruthy()
  })
})

describe('receipt ingestion reaches the comparison screen', () => {
  it('changes the price Scan shows for that store', () => {
    const { unmount } = render(<Receipts />)
    fillLine(1, 'p-heinz-20', '1', '1.99')
    // A receipt dated today outranks every seeded observation.
    fireEvent.change(screen.getByLabelText('Purchased'), {
      target: { value: '2026-08-21' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }))
    unmount()

    render(<Scan />)
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    const entered = rows.find((r) => r.textContent?.includes('$1.99'))
    expect(entered).toBeTruthy()
    expect(entered!.textContent).toContain('receipt')
  })

  it('updates a screen that is already mounted', () => {
    // Both screens are mounted at once, so each render needs its own container;
    // otherwise the bound queries both search the whole document body.
    const inOwnContainer = (ui: React.ReactElement) =>
      render(ui, { container: document.body.appendChild(document.createElement('div')) })

    const scan = inOwnContainer(<Scan />)
    const receipts = inOwnContainer(<Receipts />)

    expect(scan.getByRole('table').textContent).not.toContain('$1.49')

    fireEvent.change(receipts.getByLabelText('Item 1'), {
      target: { value: 'p-heinz-20' },
    })
    fireEvent.change(receipts.getByLabelText('Price 1'), { target: { value: '1.49' } })
    fireEvent.change(receipts.getByLabelText('Purchased'), {
      target: { value: '2026-08-21' },
    })
    fireEvent.click(receipts.getByRole('button', { name: 'Save receipt' }))

    // Scan was never re-rendered by hand; the shared store pushed the change.
    expect(scan.getByRole('table').textContent).toContain('$1.49')
  })
})
