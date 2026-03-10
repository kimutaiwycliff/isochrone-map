import { useIsochroneStore } from '../../store/isochroneStore'
import { formatDistance, formatSeconds } from '../../utils/geospatial'
import { Navigation, X } from 'lucide-react'
import ElevationProfile from './ElevationProfile'

export default function RouteDetails() {
  const { routeData, setRouteData, setRouteDestination, setElevationData } = useIsochroneStore()

  const clearRoute = () => {
    setRouteData(null)
    setRouteDestination(null)
    setElevationData(null)
  }

  if (!routeData) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <Navigation className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>Click inside an isochrone<br />to get directions</p>
      </div>
    )
  }

  const summary = routeData.features?.[0]?.properties?.summary
  const segments = routeData.features?.[0]?.properties?.segments ?? []
  const steps = segments.flatMap((seg) => seg.steps ?? [])

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-500/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-400">{formatSeconds(summary.duration)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Duration</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{formatDistance(summary.distance)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Distance</p>
          </div>
        </div>
      )}

      {/* Elevation profile (auto-loads when routeData is set + ORS key present) */}
      <ElevationProfile />

      {/* Clear button */}
      <button
        onClick={clearRoute}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
      >
        <X className="w-3.5 h-3.5" />
        Clear route
      </button>

      {/* Turn-by-turn steps */}
      <div className="space-y-1 max-h-52 overflow-y-auto custom-scroll pr-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
            <span className="text-xs text-slate-500 w-5 shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-xs text-slate-300 flex-1">{step.instruction}</p>
            <span className="text-xs text-slate-500 shrink-0">{formatDistance(step.distance)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
