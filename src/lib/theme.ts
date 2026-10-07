/**
 * Light, dark, or follow the system. The resolved theme is written to
 * `<html data-theme>`, which is all the CSS tokens key off. An inline script in
 * index.html applies the stored choice before first paint so the page never
 * flashes the wrong theme.
 */
import { useSyncExternalStore } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'cartwise.theme'
const darkQuery = () =>
  typeof matchMedia === 'undefined' ? null : matchMedia('(prefers-color-scheme: dark)')

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

class ThemeStore {
  private preference: ThemePreference = readPreference()
  private listeners = new Set<() => void>()

  constructor() {
    darkQuery()?.addEventListener('change', () => this.apply())
    this.apply()
  }

  getPreference = (): ThemePreference => this.preference

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  setPreference(preference: ThemePreference): void {
    this.preference = preference
    try {
      if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // Unsaved is fine; the choice still applies for this visit.
    }
    this.apply()
    for (const listener of this.listeners) listener()
  }

  private apply(): void {
    if (typeof document === 'undefined') return
    const dark =
      this.preference === 'dark' || (this.preference === 'system' && darkQuery()?.matches === true)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }
}

export const themeStore = new ThemeStore()

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(themeStore.subscribe, themeStore.getPreference)
}
