import { useIsochroneStore } from '../../store/isochroneStore'
import { cn } from '../../lib/utils'

const TIME_OPTIONS = [
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
  { label: '15m', value: 900 },
  { label: '30m', value: 1800 },
  { label: '45m', value: 2700 },
  { label: '60m', value: 3600 },
]

export default function TimeSlider() {
  const { timeRanges, setTimeRanges } = useIsochroneStore()

  const toggle = (value) => {
    if (timeRanges.includes(value)) {
      if (timeRanges.length === 1) return // keep at least one
      setTimeRanges(timeRanges.filter((v) => v !== value))
    } else {
      setTimeRanges([...timeRanges, value].sort((a, b) => a - b))
    }
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Time Ranges</p>
      <div className="flex flex-wrap gap-1.5">
        {TIME_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => toggle(value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              timeRanges.includes(value)
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
