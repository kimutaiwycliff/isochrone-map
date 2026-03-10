import { useEffect } from 'react'
import { Route, Trash2, MapPin, Loader2, Play, X } from 'lucide-react'
import { useIsochroneStore } from '../../store/isochroneStore'
import { useOptimize } from '../../hooks/useOptimize'
import { ORIGIN_COLORS, MODE_ICONS, MODE_LABELS } from '../../utils/colors'
import { formatDistance, formatSeconds } from '../../utils/geospatial'
import { HAS_API_KEY } from '../../utils/ors'
import { cn } from '../../lib/utils'

const VEHICLE_MODES = ['driving-car', 'driving-hgv', 'cycling-regular', 'foot-walking']

export default function OptimizePanel() {
  const {
    origins,
    waypoints,
    removeWaypoint,
    clearWaypoints,
    optimizeData,
    setOptimizeData,
    setOptimizeRoute,
    mapMode,
    setMapMode,
    profile,
    setProfile,
    showToast,
  } = useIsochroneStore()
  const { mutate, isPending } = useOptimize()

  // Activate waypoint-placing map mode when this panel is active
  useEffect(() => {
    setMapMode('optimize')
    return () => setMapMode('isochrone') // restore on unmount
  }, [setMapMode])

  if (!HAS_API_KEY) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm px-2">
        <Route className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>Optimization requires an ORS API key.<br />Add it to <code className="text-blue-400">.env.local</code></p>
      </div>
    )
  }

  const vehicle = origins[0]

  const runOptimize = () => {
    if (!vehicle) { showToast('Set at least one origin as vehicle start', 'error'); return }
    if (waypoints.length < 1) { showToast('Add at least 1 waypoint to optimize', 'error'); return }
    mutate({
      vehicle: { profile, start: { lat: vehicle.lat, lng: vehicle.lng } },
      jobs: waypoints,
    })
  }

  const clearAll = () => {
    clearWaypoints()
    setOptimizeData(null)
    setOptimizeRoute(null)
  }

  const route = optimizeData?.routes?.[0]
  const summary = route ? {
    duration: route.duration,
    distance: route.distance,
    steps: route.steps?.length ?? 0,
  } : null

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 leading-relaxed">
        <strong className="text-blue-400">How to use:</strong> Origin 1 is your vehicle start.
        Click the map to add job waypoints (shown in yellow). Hit Optimize to get the shortest route through all stops.
      </div>

      {/* Vehicle start */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Vehicle Start</p>
        {vehicle ? (
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2.5 border border-white/5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: ORIGIN_COLORS[0].primary }}
            >
              1
            </div>
            <p className="flex-1 text-sm text-slate-300 truncate">{vehicle.label}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Add an origin on the Map tab first</p>
        )}
      </div>

      {/* Vehicle mode */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Vehicle Mode</p>
        <div className="grid grid-cols-4 gap-1.5">
          {VEHICLE_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setProfile(mode)}
              title={MODE_LABELS[mode]}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all',
                profile === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className="text-base">{MODE_ICONS[mode]}</span>
              <span className="text-[10px]">{MODE_LABELS[mode]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Waypoints */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
            Waypoints ({waypoints.length})
          </p>
          {waypoints.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Clear all
            </button>
          )}
        </div>
        {waypoints.length === 0 ? (
          <div className="text-center py-4 text-slate-600 text-xs border border-dashed border-white/10 rounded-xl">
            <MapPin className="w-5 h-5 mx-auto mb-1 opacity-40" />
            Click the map to add waypoints
          </div>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scroll">
            {waypoints.map((wp, idx) => (
              <div key={wp.id} className="flex items-center gap-2 bg-white/5 rounded-xl px-2.5 py-2 text-sm">
                <span className="text-slate-500 text-xs w-4 shrink-0">{idx + 1}</span>
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="flex-1 text-slate-300 text-xs truncate">{wp.label}</span>
                <button
                  onClick={() => removeWaypoint(wp.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimize button */}
      <button
        onClick={runOptimize}
        disabled={isPending || !vehicle || waypoints.length < 1}
        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        {isPending ? 'Optimizing…' : 'Optimize Route'}
      </button>

      {/* Results */}
      {summary && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Optimized Result</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-blue-400">{formatSeconds(summary.duration)}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total time</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{(summary.distance / 1000).toFixed(1)} km</p>
              <p className="text-xs text-slate-400 mt-0.5">Total dist</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-slate-400">Stop order</p>
            <div className="mt-2 space-y-1">
              {route.steps
                ?.filter((s) => s.type === 'job')
                .map((step, i) => {
                  const wp = waypoints[step.id - 1]
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-4">{i + 1}.</span>
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-slate-300 truncate">{wp?.label ?? `Stop ${step.id}`}</span>
                      <span className="text-slate-500 ml-auto shrink-0">{formatSeconds(step.arrival)}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
