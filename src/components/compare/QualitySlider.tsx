interface QualitySliderProps {
  value: number
  onChange: (value: number) => void
}

/** How much reviews count against price, 0..1. */
export function QualitySlider({ value, onChange }: QualitySliderProps) {
  const percent = Math.round(value * 100)
  return (
    <div className="rounded-card border border-line bg-surface p-4 sm:p-5">
      <label htmlFor="quality-weight" className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">What matters more?</span>
        <span className="text-sm text-ink-muted tabular">
          {100 - percent}% price · {percent}% quality
        </span>
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
        className="mt-3 h-6 w-full cursor-pointer"
      />
      <div className="mt-1 flex justify-between text-xs font-semibold text-ink-faint">
        <span>Lowest price</span>
        <span>Best reviews</span>
      </div>
    </div>
  )
}
