import { useIsochroneStore } from '../../store/isochroneStore'
import { Layers } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function MultiIntervalToggle() {
  const { multiInterval, setMultiInterval } = useIsochroneStore()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm text-slate-300">Nested rings</span>
      </div>
      <button
        onClick={() => setMultiInterval(!multiInterval)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors',
          multiInterval ? 'bg-blue-600' : 'bg-white/10'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
            multiInterval ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}
