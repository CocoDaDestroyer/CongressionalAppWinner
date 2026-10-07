import { useEffect, type ReactNode } from 'react'
import { CircleCheck, X } from 'lucide-react'

interface ToastProps {
  children: ReactNode
  onClose: () => void
  /** Milliseconds before it dismisses itself. */
  duration?: number
}

/** A confirmation that floats above the tab bar and leaves on its own. */
export function Toast({ children, onClose, duration = 7000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-20 z-30 mx-auto flex max-w-md animate-rise items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-ground shadow-float lg:bottom-8 lg:left-[calc(248px+2rem)] lg:mx-0"
    >
      <CircleCheck className="size-5 shrink-0 text-leaf-soft" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="grid size-8 shrink-0 place-items-center rounded-full text-ground/70 hover:text-ground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
