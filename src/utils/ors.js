const API_KEY = import.meta.env.VITE_ORS_API_KEY
const BASE = 'https://api.openrouteservice.org'

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

export async function fetchGeocode(text, size = 5) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    text,
    size,
  })
  const res = await fetch(`${BASE}/geocode/search/autocomplete?${params}`)
  if (!res.ok) throw new Error(`Geocode error ${res.status}`)
  return res.json()
}

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
