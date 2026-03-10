import { useState } from 'react'
import { Coffee, Heart, Bus, DollarSign, GraduationCap, Landmark, Loader2, MapPin } from 'lucide-react'
import { useIsochroneStore } from '../../store/isochroneStore'
import { usePOI } from '../../hooks/usePOI'
import { ORIGIN_COLORS } from '../../utils/colors'
import { HAS_API_KEY } from '../../utils/ors'
import { cn } from '../../lib/utils'

// ORS valid category_ids (max 5 per request).
// IDs sourced from the ORS POI API's accepted list.
const CATEGORIES = [
  { id: 100, label: 'Food & Drink', icon: Coffee,       color: 'amber',  ids: [560, 561, 562, 563] },
  { id: 200, label: 'Health',       icon: Heart,        color: 'red',    ids: [101, 102, 103, 104] },
  { id: 300, label: 'Transport',    icon: Bus,           color: 'sky',    ids: [261, 262, 263, 264] },
  { id: 400, label: 'Finance',      icon: DollarSign,   color: 'green',  ids: [121, 122, 123, 124] },
  { id: 500, label: 'Education',    icon: GraduationCap, color: 'purple', ids: [207, 208, 209, 210] },
  { id: 600, label: 'Culture',      icon: Landmark,     color: 'pink',   ids: [621, 622, 623, 624] },
]

// ORS hard limit: max 5 category_ids per request
const ORS_MAX_CATEGORY_IDS = 5

const CAT_COLORS = {
  amber:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red:    'bg-red-500/15 text-red-400 border-red-500/30',
  sky:    'bg-sky-500/15 text-sky-400 border-sky-500/30',
  green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  pink:   'bg-pink-500/15 text-pink-400 border-pink-500/30',
}

export default function POIPanel() {
  const { origins, isochroneData, poiData, poiOriginId, setPoiOriginId } = useIsochroneStore()
  const { mutate, isPending } = usePOI()
  const [selectedCats, setSelectedCats] = useState([])

  const originWithIso = origins.filter((o) => isochroneData[o.id])

  if (!HAS_API_KEY) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm px-2">
        <MapPin className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>POI search requires an ORS API key.<br />Add it to <code className="text-blue-400">.env.local</code></p>
      </div>
    )
  }

  if (originWithIso.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <MapPin className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>Add an origin first to search for<br />points of interest within it</p>
      </div>
    )
  }

  const activeOriginId = poiOriginId ?? originWithIso[0]?.id

  const toggleCat = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat.id) ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
    )
  }

  // Total IDs that would be sent for the current selection
  const projectedIds = selectedCats.flatMap(
    (id) => CATEGORIES.find((c) => c.id === id)?.ids ?? []
  )
  const overLimit = projectedIds.length > ORS_MAX_CATEGORY_IDS

  const runPOI = () => {
    const origin = origins.find((o) => o.id === activeOriginId)
    const iso = isochroneData[activeOriginId]
    if (!origin || !iso) return
    const outerFeature = iso.features?.[iso.features.length - 1]
    if (!outerFeature) return
    // Enforce ORS hard limit of 5 category_ids
    const categoryIds = projectedIds.slice(0, ORS_MAX_CATEGORY_IDS)
    mutate({ geojson: outerFeature.geometry, categoryIds })
  }

  const pois = poiData?.features ?? []

  return (
    <div className="space-y-4">
      {/* Origin selector */}
      {originWithIso.length > 1 && (
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
            Search within
          </p>
          <div className="flex gap-2">
            {originWithIso.map((o, idx) => {
              const color = ORIGIN_COLORS[idx % ORIGIN_COLORS.length]
              const active = activeOriginId === o.id
              return (
                <button
                  key={o.id}
                  onClick={() => setPoiOriginId(o.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    active
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: color.primary }}
                  >
                    {idx + 1}
                  </span>
                  Origin {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
          Categories
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const active = selectedCats.includes(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => toggleCat(cat)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all',
                  active
                    ? CAT_COLORS[cat.color]
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Over-limit warning */}
      {overLimit && (
        <p className="text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          ORS allows max 5 category IDs per request. Only the first selected category will be used — deselect one to search both.
        </p>
      )}

      {/* Fetch button */}
      <button
        onClick={runPOI}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        {isPending ? 'Searching…' : 'Find POIs'}
      </button>

      {/* Results */}
      {pois.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
            {pois.length} result{pois.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scroll pr-1">
            {pois.slice(0, 100).map((f, i) => {
              const name = f.properties?.name ?? 'Unnamed'
              const category = f.properties?.category_ids
                ? Object.keys(f.properties.category_ids)[0]
                : null
              const catGroup = category
                ? CATEGORIES.find((c) => c.ids.includes(Number(category)))
                : null
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 text-sm"
                >
                  {catGroup ? (
                    <catGroup.icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  )}
                  <span className="text-slate-300 truncate">{name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
