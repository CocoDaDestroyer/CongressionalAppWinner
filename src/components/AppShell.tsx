/**
 * Navigation. Phones get a quiet top bar with the profile button and a bottom
 * tab bar; laptops get a white sidebar. Same five destinations either way.
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
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <Sidebar />
      <MobileHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-28 sm:px-6 lg:px-12 lg:pt-12 lg:pb-16">
        {children}
      </main>
      <TabBar />
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="hidden border-r border-line bg-surface lg:block">
      <div className="sticky top-0 flex h-dvh flex-col px-3 py-6">
        <Link to="/" className="mb-8 px-3" aria-label="CartWise home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-0.5">
          {DESTINATIONS.map((d) => (
            <SideLink key={d.to} destination={d} />
          ))}
        </nav>
        <div className="mt-auto">
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
      className={({ isActive }) =>
        `flex h-10 items-center gap-3 rounded-control px-3 text-[15px] font-medium transition-colors ${
          isActive ? 'bg-leaf-soft text-leaf-ink' : 'text-ink-muted hover:bg-sunken hover:text-ink'
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
    <header className="flex h-14 items-center justify-between px-4 lg:hidden">
      <Link to="/" aria-label="CartWise home">
        <Logo />
      </Link>
      <NavLink
        to={PROFILE.to}
        aria-label="Profile"
        className={({ isActive }) =>
          `grid size-10 place-items-center rounded-full transition-colors ${
            isActive ? 'bg-leaf-soft text-leaf-ink' : 'text-ink-muted hover:text-ink'
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
                `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-leaf' : 'text-ink-faint hover:text-ink'
                }`
              }
            >
              <Icon className="size-[22px]" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
