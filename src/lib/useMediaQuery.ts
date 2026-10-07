import { useSyncExternalStore } from 'react'

/** Whether a media query matches, kept live as the window resizes. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof matchMedia === 'undefined') return () => {}
      const list = matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => typeof matchMedia !== 'undefined' && matchMedia(query).matches,
    () => false,
  )
}
