/**
 * Distance and routing, with no external service.
 *
 * Everything here is straight-line ("as the crow flies") distance. Real driving
 * distance is 20-40% longer in a street grid and depends on traffic, so these
 * numbers are systematically optimistic. That is a deliberate trade: it costs
 * nothing, needs no API key, and is good enough to rank nearby stores against
 * each other, which is all the trip planner needs.
 *
 * `DETOUR_FACTOR` exists to take the edge off that bias. When the Google Maps
 * Distance Matrix is wired up, replace `routeMiles` and leave callers alone.
 */

export interface LatLng {
  latitude: number
  longitude: number
}

const EARTH_RADIUS_MILES = 3958.7613

/**
 * Multiplier from straight-line to plausible driving distance. 1.3 is the
 * usual rule of thumb for a dense street grid.
 */
export const DETOUR_FACTOR = 1.3

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Great-circle distance in miles. */
export function haversineMiles(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude)
  const dLon = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h))
}

/** Straight-line distance scaled toward a realistic drive. */
export function drivingMiles(a: LatLng, b: LatLng): number {
  return haversineMiles(a, b) * DETOUR_FACTOR
}

export interface Route<T> {
  /** Stops in visiting order, excluding the start and the return leg. */
  order: T[]
  miles: number
}

/**
 * Shortest round trip from `home` through every stop and back.
 *
 * Brute force over all orderings. That is O(n!), which is fine only because a
 * grocery trip is a handful of stores -- `MAX_BRUTE_FORCE_STOPS` is the guard.
 * Beyond that this needs a real heuristic, and the throw is there to make that
 * a loud failure rather than a hang.
 */
export const MAX_BRUTE_FORCE_STOPS = 8

export function shortestRoundTrip<T extends LatLng>(home: LatLng, stops: readonly T[]): Route<T> {
  if (stops.length === 0) return { order: [], miles: 0 }
  if (stops.length > MAX_BRUTE_FORCE_STOPS) {
    throw new RangeError(
      `shortestRoundTrip brute-forces orderings and cannot handle ${stops.length} stops ` +
        `(limit ${MAX_BRUTE_FORCE_STOPS}); use a heuristic instead`,
    )
  }

  let bestOrder: T[] = []
  let bestMiles = Infinity

  for (const order of permutations(stops)) {
    const miles = roundTripMiles(home, order)
    if (miles < bestMiles) {
      bestMiles = miles
      bestOrder = order
    }
  }

  return { order: bestOrder, miles: bestMiles }
}

/** Total mileage of home -> stops in the given order -> home. */
export function roundTripMiles(home: LatLng, order: readonly LatLng[]): number {
  if (order.length === 0) return 0

  let miles = drivingMiles(home, order[0])
  for (let i = 1; i < order.length; i++) {
    miles += drivingMiles(order[i - 1], order[i])
  }
  return miles + drivingMiles(order[order.length - 1], home)
}

function* permutations<T>(items: readonly T[]): Generator<T[]> {
  if (items.length <= 1) {
    yield [...items]
    return
  }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const perm of permutations(rest)) {
      yield [items[i], ...perm]
    }
  }
}

export interface DrivingCostModel {
  /** Vehicle fuel economy, miles per gallon. */
  milesPerGallon: number
  /** Pump price in cents per gallon. */
  gasPriceCentsPerGallon: number
  /**
   * What an hour of the shopper's time is worth, in cents. Zero means only
   * fuel counts, which is the right default -- most people do not think of a
   * grocery run as billable, and charging for time makes the planner refuse
   * trips that shoppers happily make.
   */
  timeValueCentsPerHour: number
  /** Assumed average speed, for turning miles into hours. */
  milesPerHour: number
}

export const DEFAULT_DRIVING_COST: DrivingCostModel = {
  milesPerGallon: 25,
  gasPriceCentsPerGallon: 489,
  timeValueCentsPerHour: 0,
  milesPerHour: 25,
}

/** Cost in cents of driving a given distance under the model. */
export function drivingCostCents(miles: number, model: DrivingCostModel): number {
  const fuel = (miles / model.milesPerGallon) * model.gasPriceCentsPerGallon
  const time = (miles / model.milesPerHour) * model.timeValueCentsPerHour
  return fuel + time
}
