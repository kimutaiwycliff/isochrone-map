import { useState, useCallback } from 'react'
import {
  Car, Bike, Footprints, Truck, ArrowLeftRight, Plus, X,
  ChevronRight, Download, Navigation,
  TrendingUp, Loader2, Route, Settings2,
  Zap, Clock, Maximize2, ArrowUp,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useIsochroneStore } from '../../store/isochroneStore'
import { useDirections } from '../../hooks/useDirections'
import { uniqueId } from '../../utils/geospatial'
import { cn } from '../../lib/utils'
import RouteSearchBox from '../Controls/RouteSearchBox'

// ─── Profiles ────────────────────────────────────────────────────────────────

const PROFILES = [
  { id: 'driving-car',      label: 'Car',         icon: Car,       color: 'text-blue-400' },
  { id: 'driving-hgv',      label: 'Truck',        icon: Truck,     color: 'text-orange-400' },
  { id: 'cycling-regular',  label: 'Bike',         icon: Bike,      color: 'text-green-400' },
  { id: 'cycling-road',     label: 'Road bike',    icon: Bike,      color: 'text-emerald-400' },
  { id: 'cycling-mountain', label: 'MTB',          icon: Bike,      color: 'text-lime-400' },
  { id: 'cycling-electric', label: 'E-bike',       icon: Zap,       color: 'text-yellow-400' },
  { id: 'foot-walking',     label: 'Walk',         icon: Footprints, color: 'text-purple-400' },
  { id: 'foot-hiking',      label: 'Hike',         icon: Footprints, color: 'text-rose-400' },
  { id: 'wheelchair',       label: 'Wheelchair',   icon: Navigation, color: 'text-cyan-400' },
]

const PREFERENCES = [
  { id: 'recommended', label: 'Recommended', icon: Route },
  { id: 'fastest',     label: 'Fastest',     icon: Clock },
  { id: 'shortest',    label: 'Shortest',    icon: Maximize2 },
]

const AVOID_FEATURES = [
  { id: 'highways',  label: 'Highways' },
  { id: 'tolls',     label: 'Tolls' },
  { id: 'ferries',   label: 'Ferries' },
  { id: 'tunnels',   label: 'Tunnels' },
  { id: 'fords',     label: 'Fords' },
  { id: 'steps',     label: 'Steps' },
  { id: 'unpavedroads', label: 'Unpaved' },
]

// ─── Dot colours by waypoint role ───────────────────────────────────────────

const DOT_COLORS = {
  from: 'bg-green-400',
  via:  'bg-blue-400',
  to:   'bg-red-400',
}

const LINE_COLORS = ['#38bdf8', '#a78bfa', '#fb923c']  // alt route colours

// ─── Helper: format seconds ──────────────────────────────────────────────────

function fmtSec(s) {
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60), r = m % 60
  return r > 0 ? `${h}h ${r}m` : `${h}h`
}

function fmtDist(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// ─── Elevation mini-chart ────────────────────────────────────────────────────

function ElevChart({ data }) {
  if (!data?.length) return null
  const min = Math.min(...data.map((d) => d.elev))
  const max = Math.max(...data.map((d) => d.elev))
  return (
    <div className="mt-1 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <TrendingUp className="w-3 h-3 text-blue-400" />
          <span>Elevation</span>
        </div>
        <span className="text-[11px] text-slate-500">{Math.round(min)}–{Math.round(max)} m</span>
      </div>
      <div className="h-20 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: -22 }}>
            <defs>
              <linearGradient id="dElevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis dataKey="dist" tick={{ fontSize: 8, fill: '#475569' }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}km`} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 8, fill: '#475569' }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}m`} domain={['auto', 'auto']} width={38} />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length
                  ? <div className="bg-[#1e2537] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] shadow-xl">
                      <p className="text-slate-400">{payload[0].payload.dist} km</p>
                      <p className="text-blue-400 font-bold">{Math.round(payload[0].payload.elev)} m</p>
                    </div>
                  : null
              }
            />
            <Area type="monotone" dataKey="elev" stroke="#3b82f6" strokeWidth={1.5}
              fill="url(#dElevGrad)" dot={false} activeDot={{ r: 3, fill: '#3b82f6' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Step instruction icon (basic) ──────────────────────────────────────────

function stepIcon(type) {
  // ORS step type: 0=left, 1=right, 2=sharp left, 3=sharp right, 4=slight left, 5=slight right, 10=straight, 11=roundabout, 12=uturn
  if ([0, 2, 4].includes(type)) return <ArrowUp className="w-3 h-3 rotate-[-90deg] text-yellow-400" />
  if ([1, 3, 5].includes(type)) return <ArrowUp className="w-3 h-3 rotate-90 text-yellow-400" />
  return <ArrowUp className="w-3 h-3 text-slate-400" />
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function DirectionsPanel() {
  const {
    routeWaypoints, setRouteWaypoints, addRouteWaypoint,
    updateRouteWaypoint, removeRouteWaypoint, swapRouteEndpoints,
    routeProfile, setRouteProfile,
    routePreference, setRoutePreference,
    avoidFeatures, toggleAvoidFeature,
    routeAlternatives, activeRouteIdx, setActiveRouteIdx,
    elevationData,
    directionsClickTarget, setDirectionsClickTarget,
    setMapMode, showToast, setFlyToTarget,
  } = useIsochroneStore()

  const { mutate: calcRoute, isPending } = useDirections()
  const [showOptions, setShowOptions] = useState(false)

  // ── Ensure we always have from + to rows (fill with blanks if needed) ──────
  const fromWp  = routeWaypoints[0]
  const toWp    = routeWaypoints[routeWaypoints.length - 1]
  const viaWps  = routeWaypoints.slice(1, -1)

  const activeProfile = PROFILES.find((p) => p.id === routeProfile) ?? PROFILES[0]

  // ── Waypoint change handler ───────────────────────────────────────────────

  const handleWpChange = useCallback((id, data) => {
    updateRouteWaypoint(id, { lat: data.lat, lng: data.lng, label: data.label })
    setFlyToTarget({ lat: data.lat, lng: data.lng, zoom: 14 })
  }, [updateRouteWaypoint, setFlyToTarget])

  // ── Set "from" (first waypoint) ───────────────────────────────────────────

  const setFrom = useCallback((data) => {
    if (routeWaypoints.length === 0) {
      addRouteWaypoint({ id: uniqueId(), role: 'from', lat: data.lat, lng: data.lng, label: data.label })
    } else {
      updateRouteWaypoint(routeWaypoints[0].id, { lat: data.lat, lng: data.lng, label: data.label })
    }
    setFlyToTarget({ lat: data.lat, lng: data.lng, zoom: 13 })
  }, [routeWaypoints, addRouteWaypoint, updateRouteWaypoint, setFlyToTarget])

  const setTo = useCallback((data) => {
    if (routeWaypoints.length <= 1) {
      addRouteWaypoint({ id: uniqueId(), role: 'to', lat: data.lat, lng: data.lng, label: data.label })
    } else {
      const last = routeWaypoints[routeWaypoints.length - 1]
      updateRouteWaypoint(last.id, { lat: data.lat, lng: data.lng, label: data.label })
    }
    setFlyToTarget({ lat: data.lat, lng: data.lng, zoom: 13 })
  }, [routeWaypoints, addRouteWaypoint, updateRouteWaypoint, setFlyToTarget])

  const addVia = () => {
    const newWp = { id: uniqueId(), role: 'via', lat: null, lng: null, label: '' }
    if (routeWaypoints.length < 2) {
      // Insert before a phantom "to" slot
      addRouteWaypoint(newWp)
    } else {
      const newWps = [
        routeWaypoints[0],
        ...viaWps,
        newWp,
        routeWaypoints[routeWaypoints.length - 1],
      ]
      setRouteWaypoints(newWps)
    }
  }

  // ── Pick on map ───────────────────────────────────────────────────────────

  const pickOnMap = (target) => {
    setDirectionsClickTarget(target)
    setMapMode('directions')
  }

  const isPickingFrom = directionsClickTarget === 'from'
  const isPickingTo   = directionsClickTarget === 'to'

  // ── Calculate route ───────────────────────────────────────────────────────

  const canCalculate = routeWaypoints.filter((w) => w.lat && w.lng).length >= 2

  const handleCalculate = () => {
    const validWps = routeWaypoints.filter((w) => w.lat && w.lng)
    if (validWps.length < 2) {
      showToast('Add at least a start and end point', 'error')
      return
    }
    calcRoute({ waypoints: validWps, useRouteProfile: true })
  }

  // ── Clear everything ──────────────────────────────────────────────────────

  const handleClear = () => {
    setRouteWaypoints([])
    useIsochroneStore.getState().setRouteAlternatives([])
    useIsochroneStore.getState().setActiveRouteIdx(0)
    useIsochroneStore.getState().setElevationData(null)
    setDirectionsClickTarget(null)
  }

  // ── Export helpers ────────────────────────────────────────────────────────

  const exportGeoJSON = () => {
    if (!routeAlternatives[activeRouteIdx]) return
    const feature = routeAlternatives[activeRouteIdx]
    const blob = new Blob([JSON.stringify(feature, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'route.geojson'; a.click()
    URL.revokeObjectURL(url)
  }

  const exportGPX = () => {
    const feature = routeAlternatives[activeRouteIdx]
    if (!feature) return
    const coords = feature.geometry.coordinates
    const pts = coords.map(([lng, lat, ele]) =>
      `<trkpt lat="${lat}" lon="${lng}">${ele != null ? `<ele>${ele}</ele>` : ''}</trkpt>`
    ).join('\n    ')
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ORS Map">
  <trk><name>Route</name><trkseg>
    ${pts}
  </trkseg></trk>
</gpx>`
    const blob = new Blob([gpx], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'route.gpx'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Current route summary ─────────────────────────────────────────────────

  const activeFeature = routeAlternatives[activeRouteIdx]
  const summary = activeFeature?.properties?.summary
  const segments = activeFeature?.properties?.segments ?? []
  const steps = segments.flatMap((seg) => seg.steps ?? [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Profile chips ── */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">Travel mode</p>
        <div className="flex flex-wrap gap-1.5">
          {PROFILES.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setRouteProfile(id)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border',
                routeProfile === id
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
              )}
            >
              <Icon className={cn('w-3 h-3', routeProfile === id ? color : '')} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Waypoint inputs ── */}
      <div className="space-y-1.5">
        {/* FROM */}
        <div className="flex items-center gap-1.5">
          <RouteSearchBox
            placeholder="Starting point…"
            value={fromWp?.label ?? ''}
            onChange={setFrom}
            onClear={() => {
              if (fromWp) updateRouteWaypoint(fromWp.id, { lat: null, lng: null, label: '' })
            }}
            onPickOnMap={() => pickOnMap('from')}
            isPickingOnMap={isPickingFrom}
            dotColor={DOT_COLORS.from}
          />
        </div>

        {/* VIA waypoints */}
        {viaWps.map((wp, i) => (
          <div key={wp.id} className="flex items-center gap-1.5">
            <RouteSearchBox
              placeholder={`Via point ${i + 1}…`}
              value={wp.label}
              onChange={(data) => handleWpChange(wp.id, data)}
              onClear={() => removeRouteWaypoint(wp.id)}
              onPickOnMap={() => pickOnMap(wp.id)}
              isPickingOnMap={directionsClickTarget === wp.id}
              dotColor={DOT_COLORS.via}
            />
            <button
              onClick={() => removeRouteWaypoint(wp.id)}
              className="shrink-0 p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* TO */}
        <div className="flex items-center gap-1.5">
          <RouteSearchBox
            placeholder="Destination…"
            value={toWp?.label ?? (routeWaypoints.length <= 1 ? '' : '')}
            onChange={setTo}
            onClear={() => {
              if (toWp && routeWaypoints.length > 1) updateRouteWaypoint(toWp.id, { lat: null, lng: null, label: '' })
            }}
            onPickOnMap={() => pickOnMap('to')}
            isPickingOnMap={isPickingTo}
            dotColor={DOT_COLORS.to}
          />
        </div>

        {/* Action row: swap + add via */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={() => { swapRouteEndpoints(); useIsochroneStore.getState().setRouteAlternatives([]) }}
            title="Swap start and end"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
          >
            <ArrowLeftRight className="w-3 h-3" />
            Swap
          </button>
          <button
            onClick={addVia}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
          >
            <Plus className="w-3 h-3" />
            Add via
          </button>
        </div>
      </div>

      {/* ── Options toggle ── */}
      <button
        onClick={() => setShowOptions((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5" />
          Route options
          {avoidFeatures.length > 0 && (
            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full">
              {avoidFeatures.length} active
            </span>
          )}
        </div>
        <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', showOptions && 'rotate-90')} />
      </button>

      {showOptions && (
        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
          {/* Preference */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">Preference</p>
            <div className="flex gap-1.5">
              {PREFERENCES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setRoutePreference(id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-medium border transition-all',
                    routePreference === id
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                      : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Avoid features */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">Avoid</p>
            <div className="flex flex-wrap gap-1.5">
              {AVOID_FEATURES.map(({ id, label }) => {
                const active = avoidFeatures.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleAvoidFeature(id)}
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all',
                      active
                        ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                        : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                    )}
                  >
                    {active && <span className="mr-0.5">✕</span>}
                    {label}
                  </button>
                )
              })}
            </div>
            {avoidFeatures.length > 0 && (
              <button
                onClick={() => useIsochroneStore.getState().setAvoidFeatures([])}
                className="mt-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Calculate button ── */}
      <div className="flex gap-2">
        <button
          onClick={handleCalculate}
          disabled={!canCalculate || isPending}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
            canCalculate && !isPending
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          )}
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Calculating…</>
          ) : (
            <><Navigation className="w-4 h-4" /> Get directions</>
          )}
        </button>
        {(routeWaypoints.length > 0 || routeAlternatives.length > 0) && (
          <button
            onClick={handleClear}
            className="px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Results ── */}
      {routeAlternatives.length > 0 && (
        <div className="space-y-3">

          {/* Alternative route tabs */}
          {routeAlternatives.length > 1 && (
            <div className="flex gap-1.5">
              {routeAlternatives.map((feat, i) => {
                const s = feat.properties?.summary
                return (
                  <button
                    key={i}
                    onClick={() => setActiveRouteIdx(i)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-xl border text-[10px] transition-all',
                      activeRouteIdx === i
                        ? 'border-blue-500/50 bg-blue-500/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-500 hover:text-slate-300'
                    )}
                    style={activeRouteIdx === i ? { borderColor: LINE_COLORS[i] + '80' } : {}}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: LINE_COLORS[i] }} />
                      <span className="font-semibold">Route {i + 1}</span>
                    </div>
                    {s && (
                      <>
                        <span className="font-bold text-[11px]">{fmtSec(s.duration)}</span>
                        <span className="text-slate-600">{fmtDist(s.distance)}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-400">{fmtSec(summary.duration)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Duration</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">{fmtDist(summary.distance)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Distance</p>
              </div>
              {summary.ascent != null && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-base font-bold text-green-400">↑ {Math.round(summary.ascent)} m</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ascent</p>
                </div>
              )}
              {summary.descent != null && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-base font-bold text-orange-400">↓ {Math.round(summary.descent)} m</p>
                  <p className="text-xs text-slate-400 mt-0.5">Descent</p>
                </div>
              )}
            </div>
          )}

          {/* Elevation profile */}
          <ElevChart data={elevationData} />

          {/* Export */}
          <div className="flex gap-1.5">
            <button
              onClick={exportGeoJSON}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            >
              <Download className="w-3 h-3" />
              GeoJSON
            </button>
            <button
              onClick={exportGPX}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            >
              <Download className="w-3 h-3" />
              GPX
            </button>
          </div>

          {/* Turn-by-turn */}
          {steps.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">
                Turn-by-turn ({steps.length} steps)
              </p>
              <div className="space-y-0.5 max-h-64 overflow-y-auto custom-scroll pr-0.5">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 py-2 px-2 rounded-lg border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                      {stepIcon(step.type)}
                    </div>
                    <p className="text-xs text-slate-300 flex-1 leading-relaxed">{step.instruction}</p>
                    <span className="text-[11px] text-slate-500 shrink-0 tabular-nums">{fmtDist(step.distance)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {routeAlternatives.length === 0 && !isPending && (
        <div className="text-center py-6 text-slate-600 text-xs">
          <Navigation className="w-6 h-6 mx-auto mb-2 opacity-30" />
          <p>Enter start & end points<br/>then tap "Get directions"</p>
        </div>
      )}
    </div>
  )
}
