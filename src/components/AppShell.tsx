/**
 * Navigation. Phones get a green header band with the profile button and a
 * bottom tab bar; laptops get a green rail with the logo. Same five
 * destinations either way, so the demo reads the same at any width.
 */
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  ChartColumnBig,
  CircleUserRound,
  House,
  ReceiptText,
  Route,
  ScanBarcode,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from './Logo'

interface Destination {
  to: string
  label: string
  icon: LucideIcon
}

const DESTINATIONS: Destination[] = [
  { to: '/', label: 'Home', icon: House },
  { to: '/compare', label: 'Compare', icon: ScanBarcode },
  { to: '/trip', label: 'Trip', icon: Route },
  { to: '/receipts', label: 'Receipts', icon: ReceiptText },
  { to: '/spending', label: 'Spending', icon: ChartColumnBig },
]

const PROFILE: Destination = { to: '/profile', label: 'Profile', icon: CircleUserRound }

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <Sidebar />
      <MobileHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
        {children}
      </main>
      <TabBar />
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="hidden bg-shell lg:block">
      <div className="sticky top-0 flex h-dvh flex-col px-4 py-6">
      <Link to="/" className="mb-8 px-2" aria-label="CartWise home">
        <Logo tone="inverse" />
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {DESTINATIONS.map((d) => (
          <RailLink key={d.to} destination={d} />
        ))}
      </nav>
      <div className="mt-auto border-t border-on-shell/15 pt-4">
        <RailLink destination={PROFILE} />
      </div>
      </div>
    </aside>
  )
}

function RailLink({ destination: { to, label, icon: Icon } }: { destination: Destination }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors ${
          isActive
            ? 'bg-shell-raised text-on-shell'
            : 'text-on-shell-muted hover:bg-shell-raised/60 hover:text-on-shell'
        }`
      }
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-shell px-4 lg:hidden">
      <Link to="/" aria-label="CartWise home">
        <Logo tone="inverse" />
      </Link>
      <NavLink
        to={PROFILE.to}
        aria-label="Profile"
        className={({ isActive }) =>
          `grid size-10 place-items-center rounded-full transition-colors ${
            isActive ? 'bg-shell-raised text-on-shell' : 'text-on-shell-muted hover:text-on-shell'
          }`
        }
      >
        <CircleUserRound className="size-6" aria-hidden="true" />
      </NavLink>
    </header>
  )
}

function TabBar() {
  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {DESTINATIONS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-leaf-ink' : 'text-ink-faint hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${isActive ? 'bg-leaf-soft' : ''}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
