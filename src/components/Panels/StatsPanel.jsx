import { useIsochroneStore } from '../../store/isochroneStore'
import { formatArea, formatSeconds } from '../../utils/geospatial'
import { ORIGIN_COLORS } from '../../utils/colors'
import { BarChart3 } from 'lucide-react'

export default function StatsPanel() {
  const { origins, isochroneData } = useIsochroneStore()

  if (origins.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <BarChart3 className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>Add an origin to see statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {origins.map((origin, idx) => {
        const data = isochroneData[origin.id]
        const color = ORIGIN_COLORS[idx % ORIGIN_COLORS.length]
        const features = data?.features ?? []

        return (
          <div key={origin.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: color.primary }}
              />
              <p className="text-sm font-medium text-white truncate">{origin.label}</p>
            </div>
            {features.length === 0 ? (
              <p className="text-xs text-slate-500">Loading&hellip;</p>
            ) : (
              <div className="space-y-1.5">
                {[...features].reverse().map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{formatSeconds(f.properties.value)}</span>
                    <span className="text-white font-medium">
                      {formatArea(f.properties.area)}
                    </span>
                    <span className="text-slate-500">
                      RF: {(f.properties.reachfactor ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
