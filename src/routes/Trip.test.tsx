// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Trip } from './Trip'
import { shoppingList } from '../lib/list'
import { catalogStore } from '../lib/store'
import * as seed from '../data/seed'

beforeEach(() => {
  localStorage.clear()
  catalogStore.resetDemoData()
  shoppingList.reset()
})
afterEach(() =>
  act(() => {
    catalogStore.resetDemoData()
    shoppingList.reset()
  }),
)

function renderTrip() {
  return render(
    <MemoryRouter>
      <Trip />
    </MemoryRouter>,
  )
}

/** The total, in cents, of one row of the plan comparison. */
function planTotal(label: string | RegExp): number {
  const row = screen.getByText(label).closest('li')!
  return Number(row.querySelector('data')!.value)
}

const routeCaption = () => screen.getByText(/^Route:/).textContent!

describe('Trip screen', () => {
  it('never costs more than chasing every lowest price', () => {
    renderTrip()
    expect(planTotal('Your plan')).toBeLessThanOrEqual(planTotal('Chase every lowest price'))
  })

  it('never costs more than stopping once', () => {
    renderTrip()
    expect(planTotal('Your plan')).toBeLessThanOrEqual(planTotal(/^Only /))
  })

  it('says how much the plan saves over one store', () => {
    renderTrip()
    const saved = planTotal(/^Only /) - planTotal('Your plan')
    expect(saved).toBeGreaterThan(0)
    expect(screen.getByText(/^You save \$\d+\.\d\d vs\. one store$/)).toBeTruthy()
  })

  it('shows a route that starts and ends at home', () => {
    renderTrip()
    expect(routeCaption().startsWith('Route: Home →')).toBe(true)
    expect(routeCaption()).toMatch(/→ Home/)
  })

  it('recomputes when the list changes', () => {
    renderTrip()
    const before = planTotal('Your plan')
    fireEvent.click(screen.getByLabelText('One more Eggs'))
    expect(planTotal('Your plan')).toBeGreaterThan(before)
  })

  it('will not plan more stops than allowed', () => {
    renderTrip()
    fireEvent.click(screen.getByRole('radio', { name: '1' }))
    // Home -> one store -> Home.
    expect(routeCaption().split('→')).toHaveLength(3)
  })

  it('uses member pricing only once the card is linked', () => {
    renderTrip()
    const before = planTotal('Your plan')
    expect(screen.getByText(/^Link your Ralphs/)).toBeTruthy()

    act(() => catalogStore.setCardLinked('r-ralphs', true))
    expect(planTotal('Your plan')).toBeLessThan(before)
    expect(screen.getAllByText('Member price').length).toBeGreaterThan(0)
  })

  it('empties out gracefully', () => {
    renderTrip()
    for (const { name } of seed.concepts) {
      const minus = screen.getByLabelText(`One fewer ${name}`)
      for (let i = 0; i < 5; i++) fireEvent.click(minus)
    }
    expect(screen.getByText('Add something to the list.')).toBeTruthy()
  })
})
