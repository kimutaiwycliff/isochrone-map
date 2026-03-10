import { useIsochroneStore } from '../../store/isochroneStore'
import { ORIGIN_COLORS } from '../../utils/colors'
import { Bookmark, Trash2, MapPin } from 'lucide-react'

export default function SavedPlaces() {
  const { savedPlaces, removePlace, addOrigin, origins } = useIsochroneStore()

  if (savedPlaces.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <Bookmark className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>No saved places yet.<br />Click the bookmark icon on an origin.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {savedPlaces.map((place) => (
        <div
          key={place.id}
          className="flex items-center gap-2 bg-white/5 rounded-xl p-2.5 border border-white/5"
        >
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="flex-1 text-sm text-slate-300 truncate">{place.label}</p>
          <button
            onClick={() => {
              if (origins.length >= 3) return
              const colorIndex = origins.length
              addOrigin({
                ...place,
                id: place.id + '_loaded',
                color: ORIGIN_COLORS[colorIndex % 3].scheme,
              })
            }}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors"
          >
            Load
          </button>
          <button
            onClick={() => removePlace(place.id)}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
