/**
 * Shared Tailwind class strings for the plain-content screens (everything
 * below the navbar). Centralised so the glass/green identity set by the
 * navbar -- translucent surfaces, soft blur, a single green accent -- reads
 * consistently on every screen instead of drifting per file.
 */
import type { CSSProperties } from 'react'

export const PAGE = 'mx-auto max-w-5xl p-6 sm:p-8'
export const HEADING = 'text-2xl font-semibold tracking-tight text-ink'
export const SUBHEADING = 'text-sm font-semibold text-ink'
export const INTRO = 'mt-1 max-w-prose text-sm text-ink/60'

export const STAT_LABEL = 'text-xs uppercase tracking-wide text-ink/40'

export const GLASS =
  'border border-white/60 bg-white/55 backdrop-blur-xl shadow-[0_1px_2px_rgba(24,32,25,0.04),0_8px_24px_-12px_rgba(24,32,25,0.15)]'

export const CARD = `rounded-2xl ${GLASS} p-4 text-sm`
export const CARD_HIGHLIGHT = `rounded-2xl border-2 border-brand/70 bg-white/70 backdrop-blur-xl p-4 text-sm shadow-[0_1px_2px_rgba(24,32,25,0.04),0_12px_28px_-12px_rgba(47,138,85,0.35)]`

export const FIELD_LABEL = 'block text-ink/50'

export const INPUT =
  'rounded-xl border border-ink/10 bg-white/70 px-3 py-1.5 backdrop-blur-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25'

export const BUTTON_PRIMARY =
  'rounded-full bg-brand px-4 py-1.5 font-medium text-white shadow-[0_4px_14px_-4px_rgba(47,138,85,0.55)] transition-colors hover:bg-brand-dark'

export const BUTTON_SECONDARY =
  'rounded-full border border-ink/10 bg-white/60 px-4 py-1.5 text-ink/70 backdrop-blur-sm transition-colors hover:border-brand/40 hover:text-brand'

export const BUTTON_ICON =
  'flex h-7 w-7 items-center justify-center rounded-full border border-ink/10 bg-white/60 text-ink/70 backdrop-blur-sm transition-colors hover:border-brand/40 hover:text-brand'

export const TABLE = 'w-full border-collapse text-sm'
export const TABLE_WRAP = `overflow-x-auto rounded-2xl ${GLASS}`
export const TABLE_HEAD_ROW = 'border-b border-ink/10 bg-white/40 text-left'
export const TABLE_HEAD_CELL = 'py-2 px-3 font-medium text-ink/50'
export const TABLE_ROW = 'border-b border-ink/5 transition-colors hover:bg-white/40'
export const TABLE_ROW_HIGHLIGHT = 'border-b border-ink/5 bg-brand/10'
export const TABLE_CELL = 'py-2 px-3'

export const MUTED = 'text-ink/55'
export const MUTED_SMALL = 'text-xs text-ink/45'

/**
 * A themed range input. The filled portion of the track is not something CSS
 * can color on its own once the native appearance is turned off, so the
 * track is left transparent here and `sliderFill` below supplies the actual
 * green/gray split as a background gradient computed from the input's value.
 */
export const SLIDER =
  'h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none ' +
  '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent ' +
  '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent ' +
  '[&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(24,32,25,0.35)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 ' +
  '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(24,32,25,0.35)]'

export function sliderFill(percent: number): CSSProperties {
  const clamped = Math.max(0, Math.min(100, percent))
  return {
    background: `linear-gradient(to right, var(--color-brand) ${clamped}%, rgba(24,32,25,0.12) ${clamped}%)`,
  }
}
