// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App shell', () => {
  it('renders navigation to every destination', () => {
    renderAt('/')
    // The rail and the tab bar both render; CSS shows one per screen size.
    for (const label of ['Home', 'Compare', 'Trip', 'Receipts', 'Spending']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByRole('link', { name: 'Profile' }).length).toBeGreaterThan(0)
  })

  it('no longer offers the cut Community and Contribute tabs', () => {
    renderAt('/')
    for (const label of ['Community', 'Contribute', 'Memberships', 'Scan', 'List']) {
      expect(screen.queryByRole('link', { name: label })).toBeNull()
    }
  })

  it('opens on Home with the month savings', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /^Saved \$\d+\.\d\d this month$/ })).toBeTruthy()
  })

  it('loads Spending, which is split into its own chunk', async () => {
    renderAt('/spending')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Spending' }, { timeout: 5000 }),
    ).toBeTruthy()
  })

  it('renders each route', () => {
    for (const [path, heading] of [
      ['/compare', 'Compare'],
      ['/trip', 'Trip'],
      ['/receipts', 'Receipts'],
      ['/profile', 'Profile'],
    ] as const) {
      const { unmount } = renderAt(path)
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy()
      unmount()
    }
  })

  it('sends the old skeleton paths to their new screens', () => {
    const { unmount } = renderAt('/scan')
    expect(screen.getByRole('heading', { level: 1, name: 'Compare' })).toBeTruthy()
    unmount()
    renderAt('/list')
    expect(screen.getByRole('heading', { level: 1, name: 'Trip' })).toBeTruthy()
  })
})
