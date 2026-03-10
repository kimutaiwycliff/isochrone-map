import { useState, useRef, useCallback, useEffect } from 'react'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import { useIsochroneStore } from '../../store/isochroneStore'
import { useIsochrone } from '../../hooks/useIsochrone'
import IsochroneLayer from './IsochroneLayer'
import OriginMarker from './OriginMarker'
import RouteLayer from './RouteLayer'
import { uniqueId } from '../../utils/geospatial'
import { fetchReverseGeocode } from '../../utils/ors'
import { ORIGIN_COLORS } from '../../utils/colors'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

/**
 * Renders null — one per origin. Calls useIsochrone for that specific origin
 * and re-fetches whenever the fetch key changes. A ref guards against duplicate calls.
 */
function OriginFetcher({ origin }) {
  const { mutate } = useIsochrone(origin.id)
  const profile = useIsochroneStore((s) => s.profile)
  const timeRanges = useIsochroneStore((s) => s.timeRanges)
  const multiInterval = useIsochroneStore((s) => s.multiInterval)
  const lastKey = useRef(null)

  useEffect(() => {
    const key = `${origin.id}-${origin.lat}-${origin.lng}-${profile}-${timeRanges.join(',')}-${multiInterval}`
    if (key === lastKey.current) return
    lastKey.current = key
    mutate({ lat: origin.lat, lng: origin.lng })
  }, [origin.id, origin.lat, origin.lng, profile, timeRanges, multiInterval, mutate])

  return null
}

export default function IsochroneMap() {
  const [viewState, setViewState] = useState({
    longitude: 36.8219,
    latitude: -1.2921,
    zoom: 11,
  })
  const mapRef = useRef(null)
  const { origins, isochroneData, routeData, addOrigin, flyToTarget, setFlyToTarget } =
    useIsochroneStore()

  // ── Fly to location when store target changes (set by SearchBox) ──────────
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 13,
      duration: 1200,
    })
    setFlyToTarget(null) // consume
  }, [flyToTarget, setFlyToTarget])

  // ── Click on map → add origin with Nominatim reverse geocode label ────────
  const handleMapClick = useCallback(
    async (e) => {
      if (origins.length >= 3) return
      const { lng, lat } = e.lngLat
      const id = uniqueId()
      const colorIndex = origins.length
      const color = ORIGIN_COLORS[colorIndex % ORIGIN_COLORS.length]

      // Optimistic: add immediately with coordinates as label
      const coordLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      addOrigin({ id, lat, lng, label: coordLabel, color: color.scheme })

      // Then silently upgrade label with reverse geocode
      fetchReverseGeocode(lat, lng).then((label) => {
        if (label) {
          useIsochroneStore.getState().updateOrigin(id, { label })
        }
      })
    },
    [origins.length, addOrigin]
  )

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onClick={handleMapClick}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
      cursor={origins.length < 3 ? 'crosshair' : 'default'}
    >
      <NavigationControl position="bottom-right" />
      <ScaleControl position="bottom-left" />

      {/* Auto-fetch isochrones for each origin — each gets its own hook instance */}
      {origins.map((origin) => (
        <OriginFetcher key={origin.id} origin={origin} />
      ))}

      {/* Isochrone fill + outline layers */}
      {origins.map((origin) => {
        const data = isochroneData[origin.id]
        return data ? (
          <IsochroneLayer key={origin.id} origin={origin} data={data} />
        ) : null
      })}

      {/* Draggable origin markers */}
      {origins.map((origin) => (
        <OriginMarker key={origin.id} origin={origin} />
      ))}

      {/* Route geometry */}
      {routeData && <RouteLayer data={routeData} />}
    </Map>
  )
}
