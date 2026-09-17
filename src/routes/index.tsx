/**
 * One route per feature domain. Scan, ShoppingList, Receipts and Spending are
 * implemented (against the local catalog store); the rest are stubs, present
 * so the shape and navigation exist.
 */
import { HEADING, INTRO, PAGE } from '../lib/ui'

export { Scan } from './Scan'
export { ShoppingList } from './ShoppingList'
export { Receipts } from './Receipts'
export { Spending } from './Spending'

interface StubProps {
  title: string
  children: React.ReactNode
}

function Stub({ title, children }: StubProps) {
  return (
    <section className={PAGE}>
      <h1 className={HEADING}>{title}</h1>
      <p className={INTRO}>{children}</p>
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
