import { MapPin, Trash2, Bookmark } from 'lucide-react'
import { useIsochroneStore } from '../../store/isochroneStore'
import { ORIGIN_COLORS } from '../../utils/colors'
import { uniqueId } from '../../utils/geospatial'

export default function OriginList() {
  const { origins, removeOrigin, removeIsochroneData, savePlace, showToast } = useIsochroneStore()

  if (origins.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        <MapPin className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>Click the map or search<br />to add an origin</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {origins.map((origin, idx) => {
        const color = ORIGIN_COLORS[idx % ORIGIN_COLORS.length]
        return (
          <div
            key={origin.id}
            className="flex items-center gap-2 bg-white/5 rounded-xl p-2.5 border border-white/5"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: color.primary }}
            >
              {idx + 1}
            </div>
            <p className="flex-1 text-sm text-slate-300 truncate">{origin.label}</p>
            <button
              onClick={() => {
                savePlace({ id: uniqueId(), ...origin })
                showToast('Place saved!', 'success')
              }}
              title="Save place"
              className="p-2 text-slate-500 hover:text-amber-400 active:text-amber-300 transition-colors touch-target"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                removeOrigin(origin.id)
                removeIsochroneData(origin.id)
              }}
              title="Remove origin"
              className="p-2 text-slate-500 hover:text-red-400 active:text-red-300 transition-colors touch-target"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
