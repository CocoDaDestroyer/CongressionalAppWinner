interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  /** The wallet cards sit on dark fills and need a light track. */
  tone?: 'leaf' | 'inverse'
}

export function Switch({ checked, onChange, label, disabled, tone = 'leaf' }: SwitchProps) {
  const on = tone === 'leaf' ? 'bg-leaf' : 'bg-on-card'
  const off = tone === 'leaf' ? 'bg-line-strong' : 'bg-on-card/25'
  const thumbOn = tone === 'leaf' ? 'bg-on-leaf' : 'bg-card-1'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-40 ${checked ? on : off}`}
    >
      <span
        className={`absolute left-0.5 size-5 rounded-full shadow-sm transition-transform duration-300 ease-(--ease-out-expo) ${checked ? `translate-x-5 ${thumbOn}` : 'translate-x-0 bg-surface'}`}
      />
    </button>
  )
}
