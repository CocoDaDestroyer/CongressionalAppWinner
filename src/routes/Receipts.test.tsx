// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Receipts } from './Receipts'
import { Compare } from './Compare'
import { catalogStore } from '../lib/store'

/** The screens share one store, so each test starts from an empty one. */
beforeEach(() => {
  localStorage.clear()
  catalogStore.resetDemoData()
  for (const receipt of [...catalogStore.getReceipts()]) {
    catalogStore.deleteReceipt(receipt.id)
  }
})
afterEach(() => act(() => catalogStore.resetDemoData()))

const inRouter = (ui: React.ReactElement) => <MemoryRouter>{ui}</MemoryRouter>

function fillLine(index: number, packageId: string, quantity: string, price: string) {
  fireEvent.change(screen.getByLabelText(`Item ${index}`), { target: { value: packageId } })
  fireEvent.change(screen.getByLabelText(`Quantity ${index}`), { target: { value: quantity } })
  fireEvent.change(screen.getByLabelText(`Price ${index}`), { target: { value: price } })
}

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }))

describe('Receipts screen', () => {
  it('starts with nothing saved', () => {
    render(inRouter(<Receipts />))
    expect(screen.getByText(/Nothing yet\./)).toBeTruthy()
  })

  it('refuses a line with no price', () => {
    render(inRouter(<Receipts />))
    save()
    expect(screen.getByText(/Every line needs a quantity and a price/)).toBeTruthy()
    expect(screen.getByText(/Nothing yet\./)).toBeTruthy()
  })

  it('refuses a zero price', () => {
    render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '1', '0')
    save()
    expect(screen.getByText(/greater than zero/)).toBeTruthy()
  })

  it('saves a receipt and totals it by quantity', () => {
    render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '2', '2.99')
    save()

    expect(screen.getByText(/Receipt saved\./)).toBeTruthy()
    // 2 x $2.99, both as the receipt total and as the single line total.
    expect(screen.getAllByText('$5.98').length).toBeGreaterThan(0)
  })

  it('says how many prices the receipt updated and links to Compare', () => {
    render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '1', '2.99')
    save()
    expect(screen.getByText(/Updated 1 price\./)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'See it in Compare' }).getAttribute('href')).toBe(
      '/compare?product=p-heinz-20',
    )
  })

  it('admits when a backdated receipt updates no prices', () => {
    render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '1', '2.99')
    fireEvent.change(screen.getByLabelText('Purchased'), { target: { value: '2026-07-01' } })
    save()
    expect(screen.getByText(/counts toward spending only/)).toBeTruthy()
  })

  it('adds and totals multiple lines', () => {
    render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '1', '3.00')
    fireEvent.click(screen.getByRole('button', { name: 'Add line' }))
    fillLine(2, 'p-lucerne-12', '2', '5.00')
    expect(screen.getByLabelText('Receipt total').textContent).toBe('$13.00')
  })

  it('removes a line', () => {
    render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '1', '3.00')
    fireEvent.click(screen.getByRole('button', { name: 'Add line' }))
    fillLine(2, 'p-lucerne-12', '2', '5.00')
    fireEvent.click(screen.getByRole('button', { name: 'Remove line 1' }))
    expect(screen.getByLabelText('Receipt total').textContent).toBe('$10.00')
  })

  it('deletes a saved receipt', () => {
    render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '1', '2.99')
    save()
    fireEvent.click(screen.getByRole('button', { name: 'Delete receipt' }))
    expect(screen.getByText(/Nothing yet\./)).toBeTruthy()
  })
})

describe('receipt ingestion reaches the comparison screen', () => {
  const allPrices = (container: HTMLElement | Document = document) =>
    within(container as HTMLElement).getByRole('list', { name: 'All prices' })

  it('changes the price Compare shows for that store', () => {
    const { unmount } = render(inRouter(<Receipts />))
    fillLine(1, 'p-heinz-20', '1', '1.99')
    // A receipt dated today outranks every seeded observation.
    fireEvent.change(screen.getByLabelText('Purchased'), { target: { value: '2026-08-21' } })
    save()
    unmount()

    render(inRouter(<Compare />))
    const rows = within(allPrices(document.body)).getAllByRole('listitem')
    const entered = rows.find((r) => r.textContent?.includes('$1.99'))
    expect(entered).toBeTruthy()
    expect(entered!.textContent).toContain('Receipt')
  })

  it('updates a screen that is already mounted', () => {
    // Both screens are mounted at once, so each render needs its own container;
    // otherwise the bound queries both search the whole document body.
    const inOwnContainer = (ui: React.ReactElement) =>
      render(inRouter(ui), { container: document.body.appendChild(document.createElement('div')) })

    const compare = inOwnContainer(<Compare />)
    const receipts = inOwnContainer(<Receipts />)

    expect(allPrices(compare.container).textContent).not.toContain('$1.49')

    fireEvent.change(receipts.getByLabelText('Item 1'), { target: { value: 'p-heinz-20' } })
    fireEvent.change(receipts.getByLabelText('Price 1'), { target: { value: '1.49' } })
    fireEvent.change(receipts.getByLabelText('Purchased'), { target: { value: '2026-08-21' } })
    fireEvent.click(receipts.getByRole('button', { name: 'Save receipt' }))

    // Compare was never re-rendered by hand; the shared store pushed the change.
    expect(allPrices(compare.container).textContent).toContain('$1.49')
  })
})
