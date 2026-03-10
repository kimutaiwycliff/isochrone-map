const API_KEY = import.meta.env.VITE_ORS_API_KEY
const BASE = 'https://api.openrouteservice.org'

// True when the user has replaced the placeholder with a real key
const HAS_API_KEY = !!API_KEY && !API_KEY.startsWith('your_')

// ─── Isochrones ───────────────────────────────────────────────────────────────

export async function fetchIsochrone({ lat, lng, profile, ranges }) {
  const res = await fetch(`${BASE}/v2/isochrones/${profile}`, {
    method: 'POST',
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locations: [[lng, lat]],
      range: ranges,
      range_type: 'time',
      attributes: ['area', 'reachfactor'],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `ORS error ${res.status}`)
  }
  return res.json()
}

// ─── Forward geocoding (address search → coordinates) ─────────────────────────

export async function fetchGeocode(text, size = 5) {
  // Prefer ORS autocomplete if key is set; fall back to Nominatim
  if (HAS_API_KEY) {
    try {
      return await _orsGeocode(text, size)
    } catch {
      // fall through to Nominatim
    }
  }
  return _nominatimGeocode(text, size)
}

async function _orsGeocode(text, size) {
  const params = new URLSearchParams({ api_key: API_KEY, text, size })
  const res = await fetch(`${BASE}/geocode/search/autocomplete?${params}`)
  if (!res.ok) throw new Error(`ORS geocode ${res.status}`)
  return res.json() // GeoJSON FeatureCollection
}

async function _nominatimGeocode(text, limit) {
  const params = new URLSearchParams({
    q: text,
    format: 'json',
    limit,
    addressdetails: 1,
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'IsochroneMapApp/1.0' },
  })
  if (!res.ok) throw new Error(`Nominatim geocode ${res.status}`)
  const data = await res.json()
  // Normalise to the same GeoJSON shape useGeocode expects
  return {
    features: data.map((item) => ({
      properties: { label: item.display_name },
      geometry: {
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
      },
    })),
  }
}

// ─── Reverse geocoding (coordinates → address label) ─────────────────────────

export async function fetchReverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    lat,
    lon: lng,
    format: 'json',
    zoom: 16,
  })
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'IsochroneMapApp/1.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.display_name ?? null
  } catch {
    return null
  }
}

// ─── Directions ───────────────────────────────────────────────────────────────

export async function fetchDirections({ profile, start, end }) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    start: `${start.lng},${start.lat}`,
    end: `${end.lng},${end.lat}`,
  })
  const res = await fetch(`${BASE}/v2/directions/${profile}?${params}`)
  if (!res.ok) throw new Error(`Directions error ${res.status}`)
  return res.json()
}
