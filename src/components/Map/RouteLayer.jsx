import { Source, Layer, Marker } from 'react-map-gl/maplibre'
import { useIsochroneStore } from '../../store/isochroneStore'

// Colour per alternative
const ALT_COLORS = ['#38bdf8', '#a78bfa', '#fb923c']

// Label letters for waypoints A, B, C…
const WP_LETTERS = 'ABCDEFGHIJ'

function WaypointPin({ lat, lng, letter, color }) {
  return (
    <Marker longitude={lng} latitude={lat} anchor="bottom">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white text-xs font-bold text-white shadow-lg"
        style={{ background: color }}
      >
        {letter}
      </div>
    </Marker>
  )
}

export default function RouteLayer({ data }) {
  const { routeAlternatives, activeRouteIdx, routeWaypoints } = useIsochroneStore()

  // ── Standalone directions mode (routeAlternatives populated) ──────────────
  if (routeAlternatives.length > 0) {
    const validWps = routeWaypoints.filter((w) => w.lat && w.lng)
    return (
      <>
        {/* Render all alternatives (inactive ones dimmed, behind active) */}
        {routeAlternatives.map((feature, i) => {
          const isActive = i === activeRouteIdx
          const color = ALT_COLORS[i % ALT_COLORS.length]
          const id = `route-alt-${i}`
          return (
            <Source key={id} id={id} type="geojson" data={feature}>
              {/* Casing */}
              <Layer
                id={`${id}-case`}
                type="line"
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{
                  'line-color': '#0f172a',
                  'line-width': isActive ? 7 : 5,
                  'line-opacity': isActive ? 0.9 : 0.4,
                }}
              />
              {/* Fill */}
              <Layer
                id={`${id}-fill`}
                type="line"
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{
                  'line-color': color,
                  'line-width': isActive ? 4 : 2.5,
                  'line-opacity': isActive ? 1 : 0.45,
                  'line-dasharray': isActive ? [1] : [4, 3],
                }}
              />
            </Source>
          )
        })}

        {/* Waypoint pins */}
        {validWps.map((wp, i) => (
          <WaypointPin
            key={wp.id}
            lat={wp.lat}
            lng={wp.lng}
            letter={WP_LETTERS[i] ?? '•'}
            color={i === 0 ? '#22c55e' : i === validWps.length - 1 ? '#ef4444' : '#3b82f6'}
          />
        ))}
      </>
    )
  }

  // ── Legacy: single route from isochrone click ──────────────────────────────
  if (!data) return null
  const feature = data?.features?.[0]
  if (!feature) return null

  return (
    <Source id="route" type="geojson" data={feature}>
      <Layer
        id="route-case"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': '#0f172a', 'line-width': 6, 'line-opacity': 0.8 }}
      />
      <Layer
        id="route-line"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': '#38bdf8', 'line-width': 3 }}
      />
    </Source>
  )
}
