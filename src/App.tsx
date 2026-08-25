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
  const [searchOpen, setSearchOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [trackedPath, setTrackedPath] = useState(location.pathname)
  const [leavingPath, setLeavingPath] = useState<string | null>(null)
  const [enterPath, setEnterPath] = useState<string | null>(null)
  const hopDir = useRef(0)

  if (location.pathname !== trackedPath) {
    hopDir.current = pathIndex(location.pathname) - pathIndex(trackedPath)
    directionRef.current = hopDir.current
    setTrackedPath(location.pathname)
    setLeavingPath(trackedPath)
    setEnterPath(location.pathname)
  }

  const direction = directionRef.current

  useLayoutEffect(() => {
    const nav = navRef.current
    const links = linksRef.current
    if (!nav || !links) return

    function sync() {
      if (!nav || !links || searchOpen) return
      nav.style.setProperty(
        '--search-left',
        `${links.offsetLeft + links.offsetWidth + 12}px`,
      )
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

  const dirClass =
    !ready || direction === 0
      ? 'dir-none'
      : direction > 0
        ? 'dir-right'
        : 'dir-left'
  const slideFrom = direction > 0 ? '100%' : '-100%'

  return (
    <div className="app-shell">
      <nav
        ref={navRef}
        className={`site-nav${ready ? ' is-ready' : ''}${searchOpen ? ' is-searching' : ''}`}
        aria-label="Main"
      >
        <span className="site-logo">cartwise</span>
        <div ref={linksRef} className="site-nav-links">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const fromLeft = hopDir.current > 0
                const enter =
                  to === enterPath && hopDir.current !== 0
                    ? fromLeft
                      ? ' is-enter-left'
                      : ' is-enter-right'
                    : ''
                const leave =
                  to === leavingPath && hopDir.current !== 0
                    ? fromLeft
                      ? ' is-leave-right'
                      : ' is-leave-left'
                    : ''
                return `nav-btn${isActive ? ' is-active' : ''}${enter}${leave}`
              }}
              onClick={() => {
                if (searchOpen) closeSearch()
              }}
              onAnimationEnd={(event) => {
                if (!(event.target as HTMLElement).classList.contains('nav-btn-fill')) {
                  return
                }
                if (to === leavingPath) setLeavingPath(null)
                if (to === enterPath) setEnterPath(null)
              }}
            >
              <span className="nav-btn-fill" aria-hidden="true" />
              <span className="nav-btn-label">{label}</span>
            </NavLink>
          ))}
        </div>
        <form
          className="site-nav-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          {searchOpen && (
            <button
              type="button"
              className="search-close"
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
            onFocus={openSearch}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeSearch()
            }}
          />
        </form>
        <button type="button" className="site-account" aria-label="Account" />
      </nav>
      <hr className="site-nav-rule" />
      <div className="page-stage">
        <div
          key={location.pathname}
          className={`page-pane ${dirClass}`}
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
