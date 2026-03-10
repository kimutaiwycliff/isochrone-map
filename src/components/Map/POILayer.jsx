import { Marker } from 'react-map-gl/maplibre'
import { useIsochroneStore } from '../../store/isochroneStore'

const CATEGORY_EMOJI = {
  100: '🍽️', 200: '🏥', 300: '🚌', 400: '🏦', 500: '🎓', 600: '🏛️',
}

function getCategoryGroup(categoryIds) {
  if (!categoryIds) return null
  const id = Number(Object.keys(categoryIds)[0])
  return Math.floor(id / 100) * 100
}

export default function POILayer() {
  const { poiData } = useIsochroneStore()
  const features = poiData?.features ?? []
  if (features.length === 0) return null

  return features.slice(0, 100).map((f, i) => {
    const [lng, lat] = f.geometry.coordinates
    const group = getCategoryGroup(f.properties?.category_ids)
    const emoji = CATEGORY_EMOJI[group] ?? '📍'
    const name = f.properties?.name ?? ''

    return (
      <Marker key={i} longitude={lng} latitude={lat} anchor="bottom">
        <div
          className="flex items-center gap-1 bg-[#1e2537]/90 backdrop-blur-sm border border-white/15 rounded-full px-1.5 py-0.5 text-xs shadow-lg cursor-default select-none"
          title={name}
        >
          <span className="text-sm leading-none">{emoji}</span>
          {name && (
            <span className="text-white max-w-[80px] truncate hidden sm:block">{name}</span>
          )}
        </div>
      </Marker>
    )
  })
}
