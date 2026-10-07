import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Compare, Home, Profile, Receipts, Trip } from './routes'

// The chart library is the heaviest dependency and only Spending needs it.
const Spending = lazy(() => import('./routes/Spending').then((m) => ({ default: m.Spending })))

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/trip" element={<Trip />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route
          path="/spending"
          element={
            <Suspense fallback={<p className="text-ink-muted">Loading spending…</p>}>
              <Spending />
            </Suspense>
          }
        />
        <Route path="/profile" element={<Profile />} />
        {/* Old skeleton paths, kept so bookmarks still land somewhere sensible. */}
        <Route path="/scan" element={<Navigate to="/compare" replace />} />
        <Route path="/list" element={<Navigate to="/trip" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
