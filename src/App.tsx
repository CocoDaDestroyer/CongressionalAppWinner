import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import {
  Community,
  Contribute,
  Memberships,
  Receipts,
  Scan,
  ShoppingList,
  Spending,
} from './routes'

const NAV = [
  { to: '/scan', label: 'Scan' },
  { to: '/list', label: 'List' },
  { to: '/receipts', label: 'Receipts' },
  { to: '/spending', label: 'Spending' },
  { to: '/community', label: 'Community' },
  { to: '/contribute', label: 'Contribute' },
  { to: '/memberships', label: 'Memberships' },
] as const

interface PillRect {
  left: number
  top: number
  width: number
  height: number
}

function pathIndex(pathname: string) {
  const exact = NAV.findIndex((item) => item.to === pathname)
  return exact === -1 ? 0 : exact
}

export default function App() {
  const location = useLocation()
  const directionRef = useRef(0)
  const navRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [searchOpen, setSearchOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [pillRect, setPillRect] = useState<PillRect | null>(null)
  const [trackedPath, setTrackedPath] = useState(location.pathname)

  if (location.pathname !== trackedPath) {
    directionRef.current = pathIndex(location.pathname) - pathIndex(trackedPath)
    setTrackedPath(location.pathname)
  }

  const direction = directionRef.current

  useLayoutEffect(() => {
    const nav = navRef.current
    const links = linksRef.current
    if (!nav || !links) return

    function sync() {
      if (!nav || !links) return
      if (!searchOpen) {
        nav.style.setProperty(
          '--search-left',
          `${links.offsetLeft + links.offsetWidth + 12}px`,
        )
      }
      const activeTo = NAV[pathIndex(location.pathname)].to
      const el = itemRefs.current[activeTo]
      if (el) {
        setPillRect({
          left: el.offsetLeft,
          top: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
        })
      }
    }

    sync()
    window.addEventListener('resize', sync)
    const frame = requestAnimationFrame(() => {
      sync()
      setReady(true)
    })
    return () => {
      window.removeEventListener('resize', sync)
      cancelAnimationFrame(frame)
    }
  }, [location.pathname, searchOpen])

  function openSearch() {
    setSearchOpen(true)
  }

  function closeSearch() {
    setSearchOpen(false)
    searchRef.current?.blur()
  }

  const animatePane = ready && direction !== 0
  const slideFrom = direction > 0 ? '100%' : '-100%'

  return (
    <div className="min-h-screen overflow-x-hidden bg-page [background-image:radial-gradient(ellipse_55%_45%_at_15%_-10%,rgba(47,138,85,0.14),transparent),radial-gradient(ellipse_45%_35%_at_100%_0%,rgba(47,138,85,0.10),transparent)] bg-fixed">
      <nav
        ref={navRef}
        className="sticky top-0 z-40 flex items-center gap-[var(--nav-gap)] overflow-x-auto border-b border-white/50 bg-white/55 px-[var(--nav-pad-x)] py-[var(--nav-pad-y)] shadow-[0_1px_0_rgba(255,255,255,0.6),0_8px_30px_-18px_rgba(24,32,25,0.35)] backdrop-blur-xl [--search-left:40%]"
        aria-label="Main"
      >
        <img
          src="/cartwise-logo.png"
          alt="CartWise"
          className={`h-8 w-auto shrink-0 object-contain max-[1100px]:h-7${searchOpen ? ' pointer-events-none' : ''}`}
        />
        <div
          ref={linksRef}
          className={`relative flex shrink-0 items-center gap-3${searchOpen ? ' pointer-events-none' : ''}`}
        >
          {pillRect && (
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 z-0 rounded-full bg-brand shadow-[0_4px_14px_-4px_rgba(47,138,85,0.55)] ${
                ready ? 'transition-[transform,width,height] duration-500 ease-[var(--pill-ease)]' : ''
              }`}
              style={{
                transform: `translate(${pillRect.left}px, ${pillRect.top}px)`,
                width: pillRect.width,
                height: pillRect.height,
              }}
            />
          )}
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              ref={(el) => {
                itemRefs.current[to] = el
              }}
              className={({ isActive }) =>
                `relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors max-[1100px]:px-3 max-[1100px]:text-[0.8rem] ${
                  isActive ? 'text-white' : 'text-ink/60 hover:text-brand'
                }`
              }
              onClick={() => {
                if (searchOpen) closeSearch()
              }}
            >
              {label}
            </NavLink>
          ))}
        </div>
        <form
          className={`absolute top-[var(--nav-pad-y)] right-[calc(var(--nav-pad-x)+var(--control-h)+var(--nav-gap))] z-20 flex h-[var(--control-h)] min-w-0 items-center gap-2 rounded-full border border-white/60 bg-white/95 backdrop-blur-xl ${
            searchOpen
              ? 'left-[var(--nav-pad-x)]'
              : 'left-[var(--search-left)]'
          } ${ready ? 'transition-[left] duration-[0.55s] ease-[var(--nav-ease)]' : ''}`}
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          {searchOpen && (
            <button
              type="button"
              className="ml-1 flex h-8 w-8 flex-none items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Close search"
              onClick={closeSearch}
            >
              ×
            </button>
          )}
          <input
            ref={searchRef}
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="block h-full w-full min-w-0 rounded-full bg-transparent px-4 text-sm text-ink outline-none placeholder:text-ink/35"
            onFocus={openSearch}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeSearch()
            }}
          />
        </form>
        <button
          type="button"
          className="relative z-30 ml-auto h-[var(--control-h)] w-[var(--control-h)] shrink-0 cursor-pointer rounded-full border border-white/60 bg-white/60 p-0 backdrop-blur-xl [background:radial-gradient(circle_at_50%_38%,rgba(47,138,85,0.35)_0_28%,transparent_29%),radial-gradient(circle_at_50%_108%,rgba(47,138,85,0.35)_0_42%,transparent_43%)]"
          aria-label="Account"
        />
      </nav>
      <div className="overflow-hidden">
        <div
          key={location.pathname}
          className={animatePane ? 'animate-page-slide' : ''}
          style={{ '--slide-from': slideFrom } as CSSProperties}
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/scan" replace />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/list" element={<ShoppingList />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/spending" element={<Spending />} />
            <Route path="/community" element={<Community />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/memberships" element={<Memberships />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
