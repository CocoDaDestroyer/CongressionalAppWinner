import type { HTMLAttributes } from 'react'

/** A thermal receipt: raised paper, mono type, and a zig-zag torn bottom edge. */
export function ReceiptBlock({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`receipt-edge bg-paper-raised px-5 pt-5 font-mono text-[15px] sm:px-6 ${className}`}
      {...rest}
    />
  )
}

/** The heavy total line: a double rule above, label left, amount right. */
export function ReceiptTotal({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-baseline justify-between border-t-4 border-double border-ink pt-3">
      <span className="font-medium tracking-wide uppercase">{label}</span>
      <span className="text-xl font-medium tabular">{children}</span>
    </div>
  )
}
