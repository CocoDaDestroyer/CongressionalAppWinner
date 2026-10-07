interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  /** Wallet cards sit on dark fills and need a light track. */
  tone?: 'teal' | 'inverse'
}

export function Switch({ checked, onChange, label, disabled, tone = 'teal' }: SwitchProps) {
  const on = tone === 'teal' ? 'bg-teal' : 'bg-tag'
  const off = tone === 'teal' ? 'bg-rule' : 'bg-on-card/25'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-[1.5px] border-ink transition-colors duration-200 disabled:opacity-40 ${checked ? on : off}`}
    >
      <span
        className={`absolute left-0.5 size-5 rounded-full border-[1.5px] border-ink bg-paper-raised transition-transform duration-300 ease-(--ease-overshoot) ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}
