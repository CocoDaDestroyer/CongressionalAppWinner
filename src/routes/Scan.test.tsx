// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Scan } from './Scan'

function rows() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1)
}

describe('Scan screen', () => {
  it('lists sibling brands and sizes, not just the selected package', () => {
    render(<Scan />)
    const text = screen.getByRole('table').textContent ?? ''
    expect(text).toContain('Heinz Tomato Ketchup, 64 oz')
    expect(text).toContain("Hunt's Tomato Ketchup, 32 oz")
    expect(text).toContain('Kroger Tomato Ketchup, 20 oz')
  })

  it('orders the table by per-unit price', () => {
    render(<Scan />)
    const perUnit = rows().map((row) => {
      const cells = within(row).getAllByRole('cell')
      return Number(cells[3].textContent!.replace(/[^0-9.]/g, ''))
    })
    expect(perUnit).toEqual([...perUnit].sort((a, b) => a - b))
  })

  it('flags a stale price and an unverified package', () => {
    render(<Scan />)
    const kroger = rows().find((r) => r.textContent?.includes('Kroger'))!
    expect(kroger.textContent).toContain('unverified')
    expect(kroger.textContent).toContain('stale')
  })

  it('shows member pricing as its own row', () => {
    render(<Scan />)
    expect(rows().some((r) => r.textContent?.includes('(member)'))).toBe(true)
  })

  it('moves the recommendation off the cheap store brand as quality is weighted', () => {
    render(<Scan />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '0' } })
    const priceOnly = screen.getByText(/^Best value/).parentElement!.textContent ?? ''
    expect(priceOnly).toContain('Kroger')

    fireEvent.change(slider, { target: { value: '0.5' } })
    const balanced = screen.getByText(/^Best value/).parentElement!.textContent ?? ''
    expect(balanced).not.toContain('Kroger')
  })

  it('switches product when a known barcode is entered', () => {
    render(<Scan />)
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), {
      target: { value: '00099482434359' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))
    // 365 olive oil -- a volume concept, so ketchup must disappear entirely.
    expect(screen.getByRole('table').textContent).toContain('Bertolli')
    expect(screen.getByRole('table').textContent).not.toContain('Ketchup')
  })

  it('explains an unknown barcode instead of dead-ending', () => {
    render(<Scan />)
    fireEvent.change(screen.getByPlaceholderText('00013000006415'), {
      target: { value: '99999999999999' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Look up' }))
    expect(screen.getByText(/No package with GTIN/)).toBeTruthy()
  })
})
