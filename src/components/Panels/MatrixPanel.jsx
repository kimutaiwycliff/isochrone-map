import { useEffect } from 'react'
import { Grid3x3, Loader2, RefreshCw } from 'lucide-react'
import { useIsochroneStore } from '../../store/isochroneStore'
import { useMatrix } from '../../hooks/useMatrix'
import { ORIGIN_COLORS } from '../../utils/colors'
import { formatSeconds, formatDistance } from '../../utils/geospatial'
import { HAS_API_KEY } from '../../utils/ors'
import { cn } from '../../lib/utils'

export default function MatrixPanel() {
  const { origins, matrixData, profile } = useIsochroneStore()
  const { mutate, isPending } = useMatrix()

  const canFetch = origins.length >= 2 && HAS_API_KEY

  const runMatrix = () => {
    if (!canFetch) return
    mutate(origins.map((o) => ({ lat: o.lat, lng: o.lng })))
  }

  // Auto-run when origins or profile change
  useEffect(() => {
    if (canFetch) runMatrix()
  }, [origins.length, profile]) // eslint-disable-line

  const durations = matrixData?.durations ?? []
  const distances = matrixData?.distances ?? []

  if (!HAS_API_KEY) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm px-2">
        <Grid3x3 className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>Matrix requires an ORS API key.<br />Add it to <code className="text-blue-400">.env.local</code></p>
      </div>
    )
  }

  if (origins.length < 2) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <Grid3x3 className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>Add at least 2 origins to compare<br />travel times between them</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
          Travel Time Matrix
        </p>
        <button
          onClick={runMatrix}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Refresh
        </button>
      </div>

      {isPending && !matrixData && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
      )}

      {durations.length > 0 && (
        <>
          {/* Duration table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5 text-left text-slate-500 font-normal">From → To</th>
                  {origins.map((o, ci) => {
                    const color = ORIGIN_COLORS[ci % ORIGIN_COLORS.length]
                    return (
                      <th key={o.id} className="p-1.5 text-center">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-[10px]"
                          style={{ background: color.primary }}
                        >
                          {ci + 1}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {origins.map((rowOrigin, ri) => {
                  const color = ORIGIN_COLORS[ri % ORIGIN_COLORS.length]
                  return (
                    <tr key={rowOrigin.id} className="border-t border-white/5">
                      <td className="p-1.5 text-left">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-[10px] mr-1"
                          style={{ background: color.primary }}
                        >
                          {ri + 1}
                        </span>
                        <span className="text-slate-400 text-[10px] truncate max-w-[80px] inline-block align-middle">
                          {rowOrigin.label.split(',')[0]}
                        </span>
                      </td>
                      {(durations[ri] ?? []).map((secs, ci) => (
                        <td
                          key={ci}
                          className={cn(
                            'p-1.5 text-center',
                            ri === ci ? 'text-slate-600' : 'text-white'
                          )}
                        >
                          {ri === ci ? '—' : (
                            <span className="font-medium">{formatSeconds(secs)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Distance table */}
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-4">Distances</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5 text-left text-slate-500 font-normal">From → To</th>
                  {origins.map((o, ci) => {
                    const color = ORIGIN_COLORS[ci % ORIGIN_COLORS.length]
                    return (
                      <th key={o.id} className="p-1.5 text-center">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-[10px]"
                          style={{ background: color.primary }}
                        >
                          {ci + 1}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {origins.map((rowOrigin, ri) => (
                  <tr key={rowOrigin.id} className="border-t border-white/5">
                    <td className="p-1.5">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-[10px] mr-1"
                        style={{ background: ORIGIN_COLORS[ri % ORIGIN_COLORS.length].primary }}
                      >
                        {ri + 1}
                      </span>
                    </td>
                    {(distances[ri] ?? []).map((km, ci) => (
                      <td key={ci} className={cn('p-1.5 text-center', ri === ci ? 'text-slate-600' : 'text-slate-300')}>
                        {ri === ci ? '—' : `${km.toFixed(1)} km`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
