// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Compare } from './Compare'
import { catalogStore } from '../lib/store'

beforeEach(() => {
  localStorage.clear()
  catalogStore.resetDemoData()
})
afterEach(() => act(() => catalogStore.resetDemoData()))

function renderCompare(path = '/compare') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Compare />
    </MemoryRouter>,
  )
}

const list = () => screen.getByRole('list', { name: 'All prices' })
const rows = () => within(list()).getAllByRole('listitem')
const bestValue = () =>
  within(screen.getByRole('region', { name: 'Best value' })).getByRole('heading').textContent ?? ''

describe('Compare screen', () => {
  it('lists sibling brands and sizes, not just the selected package', () => {
    renderCompare()
    const text = list().textContent ?? ''
    expect(text).toContain('Heinz Tomato Ketchup, 64 oz')
    expect(text).toContain("Hunt's Tomato Ketchup, 32 oz")
    expect(text).toContain('Kroger Tomato Ketchup, 20 oz')
  })

  it('orders the list by per-unit price', () => {
    renderCompare()
    const perUnit = rows().map((row) => Number(row.querySelector('data')!.value))
    expect(perUnit).toEqual([...perUnit].sort((a, b) => a - b))
  })

  it('flags a stale price and an unverified package', () => {
    renderCompare()
    const kroger = rows().find((r) => r.textContent?.includes('Kroger'))!
    expect(kroger.textContent).toMatch(/unverified/i)
    expect(kroger.textContent).toMatch(/stale/i)
  })

  it('shows member pricing as its own row', () => {
    renderCompare()
    expect(rows().some((r) => r.textContent?.includes('Member price'))).toBe(true)
  })

  it('locks a member price until the store card is linked', () => {
    renderCompare()
    const memberRow = () => rows().find((r) => r.textContent?.includes('Member price'))!
    expect(memberRow().textContent).toMatch(/link Ralphs card/i)

    act(() => catalogStore.setCardLinked('r-ralphs', true))
    expect(memberRow().textContent).not.toMatch(/link Ralphs card/i)
  })

  it('leads with the 64 oz, which costs more on the shelf and wins per unit', () => {
    renderCompare('/compare?product=p-heinz-20')
    expect(bestValue()).toContain('Heinz Tomato Ketchup, 64 oz')
    expect(screen.getByText(/less per unit than the 20 oz you scanned/)).toBeTruthy()
  })

  it('moves the recommendation off the cheap store brand as quality is weighted', () => {
    renderCompare()
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '0' } })
    expect(bestValue()).toContain('Kroger')

    fireEvent.change(slider, { target: { value: '0.5' } })
    expect(bestValue()).not.toContain('Kroger')
  })

  it('switches product when a known barcode is entered', () => {
    renderCompare()
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), {
      target: { value: '00099482434359' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))
    // 365 olive oil -- a volume concept, so ketchup must disappear entirely.
    expect(list().textContent).toContain('Bertolli')
    expect(list().textContent).not.toContain('Ketchup')
  })

  it('accepts a 12-digit UPC as typed off the package', () => {
    renderCompare()
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), {
      target: { value: '099482434359' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))
    expect(list().textContent).toContain('Bertolli')
  })

  it('explains a malformed barcode', () => {
    renderCompare()
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), { target: { value: '12ab' } })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))
    expect(screen.getByText(/8, 12, 13 or 14 digits/)).toBeTruthy()
  })

  it('offers to add an unknown barcode instead of dead-ending', () => {
    renderCompare()
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), {
      target: { value: '99999999999999' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))
    expect(screen.getByRole('heading', { name: /99999999999999 isn't in the catalog yet/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add product' })).toBeTruthy()
  })

  it('adds the unknown product with a Community price that joins the comparison', () => {
    renderCompare()
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), {
      target: { value: '00012345678905' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))

    fireEvent.change(screen.getByLabelText('Product name'), {
      target: { value: "Sir Kensington's Ketchup, 20 oz" },
    })
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText('Shelf price ($)'), { target: { value: '5.49' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }))

    const added = rows().find((r) => r.textContent?.includes("Sir Kensington's"))!
    expect(added.textContent).toContain('Community')
    expect(added.textContent).toContain('$5.49')
    // The rest of the ketchups are still there to compare against.
    expect(list().textContent).toContain('Heinz Tomato Ketchup, 64 oz')
  })

  it('refuses to add a product without a price', () => {
    renderCompare()
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), {
      target: { value: '00012345678905' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))
    fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Mystery sauce' } })
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }))
    expect(screen.getByRole('alert').textContent).toMatch(/shelf price/)
  })
})

describe('camera scanning', () => {
  it('only offers the camera where the browser has one', () => {
    // jsdom has no mediaDevices, so only the typed fallback shows.
    renderCompare()
    expect(screen.queryByRole('button', { name: 'Scan with camera' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Look up' })).toBeTruthy()
  })
})
