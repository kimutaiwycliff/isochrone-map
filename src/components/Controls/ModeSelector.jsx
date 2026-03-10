import { useIsochroneStore } from '../../store/isochroneStore'
import { MODE_ICONS, MODE_LABELS } from '../../utils/colors'
import { cn } from '../../lib/utils'

const MODES = ['foot-walking', 'cycling-regular', 'driving-car', 'driving-hgv']

export default function ModeSelector() {
  const { profile, setProfile } = useIsochroneStore()

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Travel Mode</p>
      <div className="grid grid-cols-4 gap-1.5">
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setProfile(mode)}
            title={MODE_LABELS[mode]}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all',
              profile === mode
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            )}
          >
            <span className="text-base">{MODE_ICONS[mode]}</span>
            <span className="text-[10px] leading-none">{MODE_LABELS[mode]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
