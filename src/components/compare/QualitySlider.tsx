import type { CSSProperties } from 'react'

interface QualitySliderProps {
  value: number
  onChange: (value: number) => void
}

/** How much reviews count against price, 0..1. */
export function QualitySlider({ value, onChange }: QualitySliderProps) {
  const percent = Math.round(value * 100)
  return (
    <div className="sheet px-5 pt-4 pb-3">
      <label htmlFor="quality-weight" className="flex items-baseline justify-between gap-3">
        <span className="section-title text-base">What matters more?</span>
        <span className="font-mono text-sm text-ink-muted tabular">{percent}% quality</span>
      </label>
      <input
        id="quality-weight"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        aria-valuetext={`${percent}% quality`}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${percent}%` } as CSSProperties}
        className="range mt-2 w-full"
      />
      <div className="flex justify-between text-xs text-ink-faint">
        <span>lowest price</span>
        <span>best reviews</span>
      </div>
    </div>
  )
}
