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
  it('renders navigation to every feature domain', () => {
    renderAt('/')
    for (const label of [
      'Scan', 'List', 'Receipts', 'Spending', 'Community', 'Contribute', 'Memberships',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeTruthy()
    }
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeTruthy()
  })

  it('redirects the index to the scan route', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Scan' })).toBeTruthy()
  })

  it('renders each route stub', () => {
    for (const [path, heading] of [
      ['/list', 'Shopping list'],
      ['/receipts', 'Receipts'],
      ['/spending', 'Spending'],
      ['/community', 'Community'],
      ['/contribute', 'Contribute'],
      ['/memberships', 'Memberships'],
    ] as const) {
      const { unmount } = renderAt(path)
      expect(screen.getByRole('heading', { name: heading })).toBeTruthy()
      unmount()
    }
  })
})
