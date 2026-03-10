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

const MAP_STYLES = {
  dark:      'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light:     'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  voyager:   'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=get_your_own_key',
}

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
    routeAlternatives,
    addOrigin,
    flyToTarget,
    setFlyToTarget,
    mapMode,
    setMapMode,
    mapStyle,
    waypoints,
    addWaypoint,
    // Directions mode
    directionsClickTarget,
    setDirectionsClickTarget,
    routeWaypoints,
    addRouteWaypoint,
    updateRouteWaypoint,
    setRouteWaypoints,
  } = useIsochroneStore()

  // ── Fly to location when SearchBox or Directions panel sets a target ───────
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 13,
      duration: 1200,
    })
    setFlyToTarget(null)
  }, [flyToTarget, setFlyToTarget])

  // ── Map click handler ──────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    async (e) => {
      const { lng, lat } = e.lngLat

      // ── Directions mode: set clicked point as from/to/via ─────────────────
      if (mapMode === 'directions' && directionsClickTarget) {
        const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`

        const applyLabel = async (id) => {
          const name = await fetchReverseGeocode(lat, lng)
          if (name) updateRouteWaypoint(id, { label: name })
        }

        if (directionsClickTarget === 'from') {
          if (routeWaypoints.length === 0) {
            const id = uniqueId()
            addRouteWaypoint({ id, role: 'from', lat, lng, label })
            applyLabel(id)
          } else {
            updateRouteWaypoint(routeWaypoints[0].id, { lat, lng, label })
            applyLabel(routeWaypoints[0].id)
          }
        } else if (directionsClickTarget === 'to') {
          if (routeWaypoints.length <= 1) {
            const id = uniqueId()
            addRouteWaypoint({ id, role: 'to', lat, lng, label })
            applyLabel(id)
          } else {
            const last = routeWaypoints[routeWaypoints.length - 1]
            updateRouteWaypoint(last.id, { lat, lng, label })
            applyLabel(last.id)
          }
        } else {
          // Via point id
          updateRouteWaypoint(directionsClickTarget, { lat, lng, label })
          applyLabel(directionsClickTarget)
        }

        setDirectionsClickTarget(null)
        return
      }

      // ── Optimize mode ─────────────────────────────────────────────────────
      if (mapMode === 'optimize') {
        const id = uniqueId()
        const coordLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        addWaypoint({ id, lat, lng, label: coordLabel })
        fetchReverseGeocode(lat, lng).then((label) => {
          if (label) useIsochroneStore.getState().updateWaypoint?.(id, { label })
        })
        return
      }

      // ── Isochrone mode ────────────────────────────────────────────────────
      if (origins.length >= 3) return
      const id = uniqueId()
      const color = ORIGIN_COLORS[origins.length % ORIGIN_COLORS.length]
      addOrigin({ id, lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, color: color.scheme })
      fetchReverseGeocode(lat, lng).then((label) => {
        if (label) useIsochroneStore.getState().updateOrigin(id, { label })
      })
    },
    [
      mapMode, directionsClickTarget, origins.length,
      routeWaypoints, addOrigin, addWaypoint,
      addRouteWaypoint, updateRouteWaypoint, setDirectionsClickTarget,
    ]
  )

  // ── Cursor style ───────────────────────────────────────────────────────────
  const cursor =
    (mapMode === 'directions' && directionsClickTarget) ||
    mapMode === 'optimize' ||
    (mapMode === 'isochrone' && origins.length < 3)
      ? 'crosshair'
      : 'default'

  // ── Map style URL ──────────────────────────────────────────────────────────
  const styleUrl = MAP_STYLES[mapStyle] ?? MAP_STYLES.dark

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onClick={handleMapClick}
      style={{ width: '100%', height: '100%' }}
      mapStyle={styleUrl}
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

      {/* Directions / legacy route */}
      <RouteLayer data={routeData} />

      {/* POI markers */}
      <POILayer />

      {/* Optimization waypoints + route */}
      <WaypointMarker />
      <OptimizeRouteLayer />
    </Map>
  )
}
