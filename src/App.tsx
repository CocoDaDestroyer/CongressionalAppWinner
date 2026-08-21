import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
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
]

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="flex flex-wrap gap-3 border-b p-4 text-sm">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'font-semibold underline' : '')}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Routes>
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
  )
}
