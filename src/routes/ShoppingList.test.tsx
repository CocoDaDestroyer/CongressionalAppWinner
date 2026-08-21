// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ShoppingList } from './ShoppingList'

/** The dollar figure inside a summary card, in cents. */
function planTotal(label: string): number {
  const card = screen.getByText(label).parentElement!
  const amount = card.querySelector('.text-lg')!.textContent!
  return Math.round(Number(amount.replace(/[^0-9.]/g, '')) * 100)
}

describe('Shopping list screen', () => {
  it('never costs more than chasing every lowest price', () => {
    render(<ShoppingList />)
    expect(planTotal('Best plan')).toBeLessThanOrEqual(
      planTotal('Chasing every lowest price'),
    )
  })

  it('never costs more than stopping once', () => {
    render(<ShoppingList />)
    expect(planTotal('Best plan')).toBeLessThanOrEqual(
      planTotal('If you only stop once'),
    )
  })

  it('shows a route that starts and ends at home', () => {
    render(<ShoppingList />)
    const route = screen.getByText(/^Route:/).textContent!
    expect(route.startsWith('Route: Home ->')).toBe(true)
    expect(route.endsWith('-> Home')).toBe(true)
  })

  it('recomputes when the list changes', () => {
    render(<ShoppingList />)
    const before = planTotal('Best plan')
    fireEvent.click(screen.getByLabelText('One more Eggs'))
    expect(planTotal('Best plan')).toBeGreaterThan(before)
  })

  it('will not plan more stops than allowed', () => {
    render(<ShoppingList />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
    expect(screen.getByText(/^Route:/).textContent!.split('->')).toHaveLength(3)
  })

  it('uses member pricing only once the card is checked', () => {
    render(<ShoppingList />)
    const before = planTotal('Best plan')
    fireEvent.click(screen.getByLabelText('I have a Ralphs card'))
    expect(planTotal('Best plan')).toBeLessThanOrEqual(before)
  })

  it('empties out gracefully', () => {
    render(<ShoppingList />)
    for (const name of ['Eggs', 'Milk', 'Rice', 'Ketchup', 'Olive oil']) {
      const minus = screen.getByLabelText(`One fewer ${name}`)
      for (let i = 0; i < 5; i++) fireEvent.click(minus)
    }
    expect(screen.getByText('Add something to the list.')).toBeTruthy()
  })
})
