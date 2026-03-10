import { useState, useRef, useCallback, useEffect } from 'react'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import { useIsochroneStore } from '../../store/isochroneStore'
import { useIsochrone } from '../../hooks/useIsochrone'
import IsochroneLayer from './IsochroneLayer'
import OriginMarker from './OriginMarker'
import RouteLayer from './RouteLayer'
import POILayer from './POILayer'
import WaypointMarker from './WaypointMarker'
import OptimizeRouteLayer from './OptimizeRouteLayer'
import { uniqueId } from '../../utils/geospatial'
import { fetchReverseGeocode } from '../../utils/ors'
import { ORIGIN_COLORS } from '../../utils/colors'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

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
  const {
    origins,
    isochroneData,
    routeData,
    addOrigin,
    flyToTarget,
    setFlyToTarget,
    mapMode,
    waypoints,
    addWaypoint,
  } = useIsochroneStore()

  // ── Fly to location when SearchBox sets a target ──────────────────────────
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 13,
      duration: 1200,
    })
    setFlyToTarget(null)
  }, [flyToTarget, setFlyToTarget])

  // ── Map click: add isochrone origin OR optimization waypoint ──────────────
  const handleMapClick = useCallback(
    async (e) => {
      const { lng, lat } = e.lngLat

      if (mapMode === 'optimize') {
        // Waypoint mode
        const id = uniqueId()
        const coordLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        addWaypoint({ id, lat, lng, label: coordLabel })
        fetchReverseGeocode(lat, lng).then((label) => {
          if (label) useIsochroneStore.getState().updateWaypoint?.(id, { label })
        })
        return
      }

      // Isochrone mode
      if (origins.length >= 3) return
      const id = uniqueId()
      const color = ORIGIN_COLORS[origins.length % ORIGIN_COLORS.length]
      addOrigin({ id, lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, color: color.scheme })
      fetchReverseGeocode(lat, lng).then((label) => {
        if (label) useIsochroneStore.getState().updateOrigin(id, { label })
      })
    },
    [mapMode, origins.length, addOrigin, addWaypoint]
  )

  const cursor = mapMode === 'optimize'
    ? 'crosshair'
    : origins.length < 3 ? 'crosshair' : 'default'

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onClick={handleMapClick}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
      cursor={cursor}
    >
      <NavigationControl position="bottom-right" />
      <ScaleControl position="bottom-left" />

      {/* Fetch isochrone per origin */}
      {origins.map((origin) => (
        <OriginFetcher key={origin.id} origin={origin} />
      ))}

      {/* Isochrone fill + outline layers */}
      {origins.map((origin) => {
        const data = isochroneData[origin.id]
        return data ? <IsochroneLayer key={origin.id} origin={origin} data={data} /> : null
      })}

      {/* Draggable origin markers */}
      {origins.map((origin) => (
        <OriginMarker key={origin.id} origin={origin} />
      ))}

      {/* Directions route */}
      {routeData && <RouteLayer data={routeData} />}

      {/* POI markers */}
      <POILayer />

      {/* Optimization waypoints + route */}
      <WaypointMarker />
      <OptimizeRouteLayer />
    </Map>
  )
}
