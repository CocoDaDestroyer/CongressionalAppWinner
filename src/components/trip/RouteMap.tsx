/**
 * The route as a loop diagram, the way a transit map draws a line: home, the
 * stops in visiting order with the miles between them, and the leg back. The
 * stores the plan skips are listed underneath with their distance, which is
 * usually the whole story ("the cheap store is 5 miles away").
 *
 * Schematic on purpose: the Westwood stores are a few blocks apart and the
 * outlier is miles off, so a scaled map would pile every label on one dot.
 */
import type { CSSProperties } from 'react'
import { House } from 'lucide-react'
import type { Store } from '../../lib/catalog'
import { drivingMiles, type LatLng } from '../../lib/geo'
import { retailerName, storeLabel } from '../../lib/labels'
import type { CatalogRepository } from '../../lib/repository'
import { formatMiles } from '../../lib/trip'

const WIDTH = 360
const TOP = 34
const BOTTOM = 112
const LEFT = 30
const RIGHT = WIDTH - 30

interface RouteMapProps {
  repo: CatalogRepository
  home: LatLng
  route: readonly Store[]
}

export function RouteMap({ repo, home, route }: RouteMapProps) {
  const visited = new Set(route.map((s) => s.id))
  const skipped = repo
    .getStores()
    .filter((s) => !visited.has(s.id))
    .map((store) => ({ store, miles: drivingMiles(home, store) }))
    .sort((a, b) => a.miles - b.miles)

  const step = route.length > 0 ? (RIGHT - LEFT) / route.length : 0
  const xs = route.map((_, i) => LEFT + step * (i + 1))
  const legs = route.map((store, i) => drivingMiles(i === 0 ? home : route[i - 1], store))
  const back = route.length > 0 ? drivingMiles(route[route.length - 1], home) : 0
  const lastX = xs[xs.length - 1] ?? LEFT
  const names = ['Home', ...route.map((s) => storeLabel(repo, s)), 'Home']
  // Re-keyed on the route, so a new plan draws itself in again.
  const routeKey = route.map((s) => s.id).join('>')
  const drawMs = 700

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${WIDTH} 140`} className="h-auto w-full max-w-[520px]" role="img" aria-labelledby="route-title">
        <title id="route-title">{`Loop diagram of a ${route.length}-stop trip from home and back`}</title>

        {/* Out along the top, back along the bottom. */}
        <path
          key={routeKey}
          pathLength={1}
          strokeDasharray="1"
          style={{ '--length': 1, animation: `route-draw ${drawMs}ms var(--ease-out-expo) both` } as CSSProperties}
          d={`M${LEFT},${TOP} H${lastX} Q${lastX + 22},${TOP} ${lastX + 22},${TOP + 22} V${BOTTOM - 22} Q${lastX + 22},${BOTTOM} ${lastX},${BOTTOM} H${LEFT + 18} Q${LEFT},${BOTTOM} ${LEFT},${BOTTOM - 18} V${TOP}`}
          fill="none"
          className="stroke-teal"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {legs.map((miles, i) => (
          <text
            key={route[i].id}
            x={(xs[i] + (i === 0 ? LEFT : xs[i - 1])) / 2}
            y={TOP - 10}
            textAnchor="middle"
            className="fill-ink-muted font-mono text-[11px]"
          >
            {formatMiles(miles)}
          </text>
        ))}
        {route.length > 0 && (
          <text x={(LEFT + lastX) / 2} y={BOTTOM + 20} textAnchor="middle" className="fill-ink-muted font-mono text-[11px]">
            {`${formatMiles(back)} home`}
          </text>
        )}

        {route.map((store, i) => (
          <g
            key={`${routeKey}-${store.id}`}
            style={{
              transformOrigin: `${xs[i]}px ${TOP}px`,
              animation: `pop 320ms var(--ease-overshoot) ${((i + 1) / (route.length + 1)) * drawMs * 0.5}ms both`,
            }}
          >
            {/* The first stop is "next": teal. The rest print in ink. */}
            <circle cx={xs[i]} cy={TOP} r="11" className={`${i === 0 ? 'fill-teal' : 'fill-ink'} stroke-paper-raised`} strokeWidth="3" />
            <text x={xs[i]} y={TOP} dy="0.35em" textAnchor="middle" className="fill-paper font-mono text-[12px] font-medium">
              {i + 1}
            </text>
            <StopName
              x={xs[i]}
              chain={retailerName(repo, store)}
              area={store.area}
              anchorEnd={i === route.length - 1 && route.length > 1}
            />
          </g>
        ))}

        <rect x={LEFT - 15} y={TOP - 15} width="30" height="30" rx="4" className="fill-ink" />
        <House x={LEFT - 9} y={TOP - 9} width="18" height="18" className="text-paper" aria-hidden="true" />
      </svg>

      <figcaption className="mt-1 font-mono text-sm text-ink-muted">
        Route: {names.join(' → ')}
      </figcaption>
      {skipped.length > 0 && (
        <p className="mt-2 font-mono text-xs text-ink-faint">
          Skipped:{' '}
          {skipped.map(({ store, miles }) => `${storeLabel(repo, store)} (${formatMiles(miles)} away)`).join(', ')}
          . Miles are straight-line estimates padded for city streets.
        </p>
      )}
    </figure>
  )
}

/** Store name under its stop, on two lines: chain, then neighborhood. */
function StopName({ x, chain, area, anchorEnd }: { x: number; chain: string; area: string; anchorEnd: boolean }) {
  // The last stop sits near the loop's turn, so its name hangs left of the dot.
  const dx = anchorEnd ? 14 : 0
  return (
    <text y={TOP + 32} textAnchor={anchorEnd ? 'end' : 'middle'} className="fill-ink text-[12px] font-semibold">
      <tspan x={x} dx={dx}>
        {chain}
      </tspan>
      <tspan x={x} dx={dx} dy="1.25em" className="fill-ink-muted font-normal">
        {area}
      </tspan>
    </text>
  )
}
