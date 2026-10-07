/**
 * Navigation. Phones get a quiet top bar on paper and a tab bar under a 2px
 * ink rule; laptops get a raised-paper sidebar. Same five destinations either
 * way, and page changes crossfade through View Transitions where supported.
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
      <main className="mx-auto w-full max-w-[1200px] px-4 pt-3 pb-28 sm:px-6 lg:px-14 lg:pt-12 lg:pb-16">
        {children}
      </main>
      <TabBar />
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="hidden border-r-2 border-ink bg-paper-raised lg:block">
      <div className="sticky top-0 flex h-dvh flex-col py-7">
        <Link to="/" viewTransition className="mb-10 px-6" aria-label="CartWise home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex flex-col">
          {DESTINATIONS.map((d) => (
            <SideLink key={d.to} destination={d} />
          ))}
        </nav>
        <div className="mt-auto border-t border-rule pt-2">
          <SideLink destination={PROFILE} />
        </div>
      </div>
    </aside>
  )
}

function SideLink({ destination: { to, label, icon: Icon } }: { destination: Destination }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      viewTransition
      className={({ isActive }) =>
        `flex h-11 items-center gap-3 border-l-[3px] px-6 text-[15px] font-semibold transition-colors ${
          isActive
            ? 'border-teal bg-teal-wash text-ink'
            : 'border-transparent text-ink-muted hover:bg-paper-sunken hover:text-ink'
        }`
      }
    >
      <Icon className="size-[18px]" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

function MobileHeader() {
  return (
    <header className="flex h-16 items-center justify-between px-4 lg:hidden">
      <Link to="/" viewTransition aria-label="CartWise home">
        <Logo />
      </Link>
      <NavLink
        to={PROFILE.to}
        viewTransition
        aria-label="Profile"
        className={({ isActive }) =>
          `grid size-10 place-items-center rounded-full transition-colors ${
            isActive ? 'bg-teal-wash text-ink' : 'text-ink-muted hover:text-ink'
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
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-ink bg-paper-raised pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {DESTINATIONS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              viewTransition
              className={({ isActive }) =>
                `relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-faint hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-x-5 top-0 h-[3px] bg-teal" aria-hidden="true" />}
                  <Icon className="size-[22px]" aria-hidden="true" />
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
