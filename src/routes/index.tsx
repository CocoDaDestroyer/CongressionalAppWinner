/**
 * One route per feature domain. Scan, ShoppingList and Receipts are implemented
 * (against the local catalog store); the rest are stubs, present so the shape
 * and navigation exist.
 * Styling is deliberately minimal -- design comes later.
 */

export { Scan } from './Scan'
export { ShoppingList } from './ShoppingList'
export { Receipts } from './Receipts'

interface StubProps {
  title: string
  children: React.ReactNode
}

function Stub({ title, children }: StubProps) {
  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-prose text-sm text-gray-600">{children}</p>
    </section>
  )
}

export function Memberships() {
  return (
    <Stub title="Memberships">
      Link a store loyalty account so member pricing is pulled alongside public
      pricing.
    </Stub>
  )
}

export function Contribute() {
  return (
    <Stub title="Contribute">
      Add a package or price the app could not source from a retailer.
    </Stub>
  )
}

export function Community() {
  return (
    <Stub title="Community">
      Local threads for budgeting tips, deals, and store recommendations.
    </Stub>
  )
}

export function Spending() {
  return (
    <Stub title="Spending">
      Monthly and annual grocery spend, derived from receipts and purchases.
    </Stub>
  )
}
