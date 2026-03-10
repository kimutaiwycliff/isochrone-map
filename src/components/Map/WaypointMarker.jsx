import { Marker } from 'react-map-gl/maplibre'
import { useIsochroneStore } from '../../store/isochroneStore'

export default function WaypointMarker() {
  const { waypoints, mapMode } = useIsochroneStore()
  if (mapMode !== 'optimize' || waypoints.length === 0) return null

  return waypoints.map((wp, idx) => (
    <Marker key={wp.id} longitude={wp.lng} latitude={wp.lat} anchor="bottom">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 border-2 border-white text-white text-xs font-bold shadow-lg">
        {idx + 1}
      </div>
    </Marker>
  ))
}
