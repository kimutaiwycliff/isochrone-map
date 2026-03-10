const API_KEY = import.meta.env.VITE_ORS_API_KEY
const BASE = 'https://api.openrouteservice.org'

// True when the user has replaced the placeholder with a real key
export const HAS_API_KEY = !!API_KEY && !API_KEY.startsWith('your_')

// ─── Shared fetch helper ──────────────────────────────────────────────────────

async function orsPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `ORS ${path} error ${res.status}`)
  }
  return res.json()
}

async function orsGet(path, params = {}) {
  const qs = new URLSearchParams({ api_key: API_KEY, ...params })
  const res = await fetch(`${BASE}${path}?${qs}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `ORS ${path} error ${res.status}`)
  }
  return res.json()
}

// ─── 1. Isochrones ────────────────────────────────────────────────────────────

export async function fetchIsochrone({ lat, lng, profile, ranges }) {
  return orsPost(`/v2/isochrones/${profile}`, {
    locations: [[lng, lat]],
    range: ranges,
    range_type: 'time',
    attributes: ['area', 'reachfactor'],
  })
}

// ─── 2. Directions / Routing ─────────────────────────────────────────────────

export async function fetchDirections({ profile, start, end }) {
  return orsGet(`/v2/directions/${profile}`, {
    start: `${start.lng},${start.lat}`,
    end: `${end.lng},${end.lat}`,
  })
}

// ─── 3. Matrix (travel-time / distance table) ────────────────────────────────

/**
 * locations: [{ lat, lng }]  — at least 2 required
 * Returns { durations, distances } — both NxN arrays in seconds / km
 */
export async function fetchMatrix({ locations, profile }) {
  return orsPost(`/v2/matrix/${profile}`, {
    locations: locations.map((l) => [l.lng, l.lat]),
    metrics: ['duration', 'distance'],
    units: 'km',
  })
}

// ─── 4. Geocoding (forward address search) ───────────────────────────────────

export async function fetchGeocode(text, size = 5) {
  if (HAS_API_KEY) {
    try { return await _orsGeocode(text, size) } catch { /* fall through */ }
  }
  return _nominatimGeocode(text, size)
}

async function _orsGeocode(text, size) {
  const params = new URLSearchParams({ api_key: API_KEY, text, size })
  const res = await fetch(`${BASE}/geocode/search/autocomplete?${params}`)
  if (!res.ok) throw new Error(`ORS geocode ${res.status}`)
  return res.json()
}

async function _nominatimGeocode(text, limit) {
  const params = new URLSearchParams({ q: text, format: 'json', limit, addressdetails: 1 })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'IsochroneMapApp/1.0' },
  })
  if (!res.ok) throw new Error(`Nominatim geocode ${res.status}`)
  const data = await res.json()
  return {
    features: data.map((item) => ({
      properties: { label: item.display_name },
      geometry: { coordinates: [parseFloat(item.lon), parseFloat(item.lat)] },
    })),
  }
}

// ─── 5. Reverse geocoding ────────────────────────────────────────────────────

export async function fetchReverseGeocode(lat, lng) {
  const params = new URLSearchParams({ lat, lon: lng, format: 'json', zoom: 16 })
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'IsochroneMapApp/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.display_name ?? null
  } catch { return null }
}

// ─── 6. Elevation ─────────────────────────────────────────────────────────────

/**
 * coordinates: [[lng, lat], ...]  — from a route LineString
 * Returns same array with elevation (z) added: [[lng, lat, elev_m], ...]
 */
export async function fetchElevation(coordinates) {
  const data = await orsPost('/elevation/line', {
    format_in: 'geojson',
    format_out: 'geojson',
    geometry: { type: 'LineString', coordinates },
  })
  return data?.geometry?.coordinates ?? []
}

// ─── 7. POI (Points of Interest) ─────────────────────────────────────────────

/**
 * geojson: GeoJSON Polygon (isochrone geometry)
 * categoryIds: number[] — ORS category IDs to filter by
 */
export async function fetchPOI({ geojson, categoryIds = [], limit = 200 }) {
  const body = {
    request: 'pois',
    geometry: { geojson, buffer: 0 },
    limit,
    sortby: 'distance',
  }
  if (categoryIds.length > 0) {
    body.filters = { category_ids: categoryIds }
  }
  const res = await fetch(`${BASE}/pois`, {
    method: 'POST',
    headers: { Authorization: API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `POI error ${res.status}`)
  }
  return res.json()
}

// ─── 8. Optimization (Vehicle Routing / TSP) ─────────────────────────────────

/**
 * vehicle: { profile, start: {lat,lng}, end?: {lat,lng} }
 * jobs: [{ id, lat, lng, label }]
 * Returns optimized route with step geometry (polyline5 encoded)
 */
export async function fetchOptimize({ vehicle, jobs }) {
  const body = {
    jobs: jobs.map((j, i) => ({
      id: i + 1,
      location: [j.lng, j.lat],
      service: 300, // 5 min service time
    })),
    vehicles: [
      {
        id: 1,
        profile: vehicle.profile,
        start: [vehicle.start.lng, vehicle.start.lat],
        ...(vehicle.end
          ? { end: [vehicle.end.lng, vehicle.end.lat] }
          : { end: [vehicle.start.lng, vehicle.start.lat] }),
      },
    ],
  }
  const res = await fetch(`${BASE}/optimization`, {
    method: 'POST',
    headers: { Authorization: API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Optimization error ${res.status}`)
  }
  return res.json()
}

// ─── 9. Snap (snap coords to nearest road) ───────────────────────────────────

export async function fetchSnap({ locations, profile, radius = 300 }) {
  return orsPost(`/v2/snap/${profile}`, {
    locations: locations.map((l) => [l.lng, l.lat]),
    radius,
  })
}
