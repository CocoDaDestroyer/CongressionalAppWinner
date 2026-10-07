import { Minus, Plus } from 'lucide-react'
import type { ProductConcept } from '../../lib/catalog'
import { Panel } from '../ui/Panel'

interface ListEditorProps {
  concepts: readonly ProductConcept[]
  quantities: Record<string, number>
  onChange: (conceptId: string, quantity: number) => void
  maxStores: number
  onMaxStoresChange: (value: number) => void
}

const STOP_CHOICES = [1, 2, 3, 4]

export function ListEditor({
  concepts,
  quantities,
  onChange,
  maxStores,
  onMaxStoresChange,
}: ListEditorProps) {
  return (
    <Panel id="list" aria-labelledby="list-title" className="scroll-mt-20">
      <h2 id="list-title" className="border-b-2 border-ink px-4 py-3 section-title">
        Your list
      </h2>
      <ul className="divide-y divide-rule">
        {concepts.map((concept) => {
          const quantity = quantities[concept.id] ?? 0
          return (
            <li key={concept.id} className="flex items-center justify-between gap-3 px-4 py-1.5">
              <span className={`text-[15px] ${quantity > 0 ? 'text-ink' : 'text-ink-faint'}`}>{concept.name}</span>
              <span className="flex items-center gap-1">
                <StepButton
                  label={`One fewer ${concept.name}`}
                  disabled={quantity === 0}
                  onClick={() => onChange(concept.id, quantity - 1)}
                >
                  <Minus className="size-4" aria-hidden="true" />
                </StepButton>
                <span className="w-6 text-center text-[15px] font-mono font-medium" aria-live="polite">
                  {quantity}
                </span>
                <StepButton label={`One more ${concept.name}`} onClick={() => onChange(concept.id, quantity + 1)}>
                  <Plus className="size-4" aria-hidden="true" />
                </StepButton>
              </span>
            </li>
          )
        })}
      </ul>

      <fieldset className="border-t border-rule px-4 py-4">
        <legend className="float-left mb-2 w-full text-sm font-medium text-ink-muted">
          Most stops you'll make
        </legend>
        <div className="clear-both grid grid-cols-4 gap-1 rounded-control border-[1.5px] border-ink bg-paper p-1">
          {STOP_CHOICES.map((n) => (
            <label
              key={n}
              className={`grid h-9 cursor-pointer place-items-center rounded-[5px] font-mono text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-teal ${
                maxStores === n ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name="max-stops"
                value={n}
                checked={maxStores === n}
                onChange={() => onMaxStoresChange(n)}
                className="sr-only"
              />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
    </Panel>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-[8px] text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  )
}
