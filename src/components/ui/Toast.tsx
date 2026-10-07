import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  children: ReactNode
  onClose: () => void
  /** Milliseconds before it dismisses itself. */
  duration?: number
}

/** A confirmation printed as a slip: ink on raised paper, floating above the tab bar. */
export function Toast({ children, onClose, duration = 7000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-22 z-30 mx-auto flex max-w-md animate-tag-print items-center gap-3 rounded-tag border-[1.5px] border-ink bg-paper-raised px-4 py-3 lg:bottom-8 lg:left-[calc(248px+3.5rem)] lg:mx-0"
    >
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted hover:text-ink"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
