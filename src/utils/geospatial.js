export function formatArea(areaM2) {
  if (!areaM2 || isNaN(areaM2)) return '—'
  const km2 = areaM2 / 1_000_000
  if (km2 < 1) return `${(areaM2 / 10_000).toFixed(2)} ha`
  return `${km2.toFixed(2)} km²`
}

export function formatSeconds(seconds) {
  const min = Math.round(seconds / 60)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function uniqueId() {
  return Math.random().toString(36).slice(2, 10)
}

// Fit map to a GeoJSON bbox
export function bboxFromGeoJSON(geojson) {
  if (!geojson?.bbox) return null
  const [minLng, minLat, maxLng, maxLat] = geojson.bbox
  return [[minLng, minLat], [maxLng, maxLat]]
}
