import { Marker } from 'react-map-gl/maplibre'
import { useIsochroneStore } from '../../store/isochroneStore'
import { ORIGIN_COLORS } from '../../utils/colors'
import { useIsochrone } from '../../hooks/useIsochrone'

export default function OriginMarker({ origin }) {
  const originIndex = useIsochroneStore((s) =>
    s.origins.findIndex((o) => o.id === origin.id)
  )
  const { updateOrigin } = useIsochroneStore()
  const { mutate: fetchIso } = useIsochrone(origin.id)

  const color = ORIGIN_COLORS[originIndex % ORIGIN_COLORS.length]

  const handleDragEnd = (e) => {
    const { lng, lat } = e.lngLat
    updateOrigin(origin.id, { lng, lat })
    fetchIso({ lat, lng })
  }

  return (
    <Marker
      longitude={origin.lng}
      latitude={origin.lat}
      anchor="bottom"
      draggable
      onDragEnd={handleDragEnd}
    >
      <div className="relative cursor-grab active:cursor-grabbing">
        <div
          className="origin-marker-pulse absolute inset-0 rounded-full opacity-50"
          style={{ background: color.primary }}
        />
        <div
          className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: color.primary }}
        >
          {originIndex + 1}
        </div>
      </div>
    </Marker>
  )
}
