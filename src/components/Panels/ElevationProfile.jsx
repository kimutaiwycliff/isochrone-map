import { useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Loader2 } from 'lucide-react'
import { useIsochroneStore } from '../../store/isochroneStore'
import { useElevation } from '../../hooks/useElevation'
import { HAS_API_KEY } from '../../utils/ors'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { dist, elev } = payload[0].payload
  return (
    <div className="bg-[#1e2537] border border-white/10 rounded-lg px-3 py-1.5 text-xs shadow-xl">
      <p className="text-slate-400">{dist} km</p>
      <p className="text-blue-400 font-bold">{Math.round(elev)} m</p>
    </div>
  )
}

export default function ElevationProfile() {
  const { routeData, elevationData, setElevationData } = useIsochroneStore()
  const { mutate, isPending } = useElevation()

  useEffect(() => {
    if (!routeData || !HAS_API_KEY) return
    const coords = routeData.features?.[0]?.geometry?.coordinates
    if (coords?.length > 1) {
      setElevationData(null)
      mutate(coords)
    }
  }, [routeData]) // eslint-disable-line

  if (!HAS_API_KEY || !routeData) return null

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
        Loading elevation…
      </div>
    )
  }

  if (!elevationData?.length) return null

  const minElev = Math.min(...elevationData.map((d) => d.elev))
  const maxElev = Math.max(...elevationData.map((d) => d.elev))
  const gain = Math.max(0, ...elevationData.map((d, i) =>
    i > 0 ? d.elev - elevationData[i - 1].elev : 0
  ).filter((v) => v > 0).reduce((acc, v) => acc + v, 0) ? [] : [0])

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Elevation</span>
        </div>
        <span className="text-xs text-slate-500">
          {Math.round(minElev)}–{Math.round(maxElev)} m
        </span>
      </div>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={elevationData} margin={{ top: 2, right: 2, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dist"
              tick={{ fontSize: 9, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}km`}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}m`}
              domain={['auto', 'auto']}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="elev"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fill="url(#elevGrad)"
              dot={false}
              activeDot={{ r: 3, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
