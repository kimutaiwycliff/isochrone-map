import { Map, BarChart3, Bookmark, Navigation, Grid3x3, Star, Route, X, Globe } from 'lucide-react'
import { useIsochroneStore } from '../../store/isochroneStore'
import SearchBox from '../Controls/SearchBox'
import ModeSelector from '../Controls/ModeSelector'
import TimeSlider from '../Controls/TimeSlider'
import MultiIntervalToggle from '../Controls/MultiIntervalToggle'
import OriginList from '../Controls/OriginList'
import StatsPanel from './StatsPanel'
import SavedPlaces from './SavedPlaces'
import DirectionsPanel from './DirectionsPanel'
import MatrixPanel from './MatrixPanel'
import POIPanel from './POIPanel'
import OptimizePanel from './OptimizePanel'
import { cn } from '../../lib/utils'

const TABS = [
  { id: 'directions', label: 'Directions', short: 'Go',     icon: Navigation },
  { id: 'isochrone',  label: 'Isochrone',  short: 'Reach',  icon: Map },
  { id: 'stats',      label: 'Stats',      short: 'Stats',  icon: BarChart3 },
  { id: 'matrix',     label: 'Matrix',     short: 'Matrix', icon: Grid3x3 },
  { id: 'poi',        label: 'POI',        short: 'POI',    icon: Star },
  { id: 'optimize',   label: 'Optimize',   short: 'VRP',    icon: Route },
  { id: 'saved',      label: 'Saved',      short: 'Saved',  icon: Bookmark },
]

const MAP_STYLES = [
  { id: 'dark',    label: 'Dark',    short: 'D' },
  { id: 'light',   label: 'Light',   short: 'L' },
  { id: 'voyager', label: 'Voyager', short: 'V' },
]

export default function SidePanel() {
  const {
    activeTab, setActiveTab,
    sidebarOpen, setSidebarOpen,
    mapStyle, setMapStyle,
    setMapMode,
  } = useIsochroneStore()

  const handleTabChange = (id) => {
    setActiveTab(id)
    if (id === 'directions') setMapMode('directions')
    else if (id === 'optimize') setMapMode('optimize')
    else setMapMode('isochrone')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed md:relative z-30 md:z-auto',
          'top-0 left-0 h-full',
          /* Mobile: 92vw up to 340px; tablet/desktop: 360px */
          'w-[min(92vw,340px)] md:w-[360px] shrink-0',
          'transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'flex flex-col bg-[#161b26] border-r border-white/5 overflow-hidden'
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-3 py-2.5 border-b border-white/5 md:px-4 md:py-3">
          <div className="flex items-center gap-2 min-w-0">

            {/* Logo */}
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
              <Navigation className="w-4 h-4 text-white" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white text-sm leading-tight tracking-tight">Route Explorer</h1>
              <p className="text-[10px] text-slate-500 leading-tight hidden sm:block">
                Directions · Isochrones · POI · Matrix
              </p>
            </div>

            {/* Map style switcher — full labels on md+, single char on mobile */}
            <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-lg p-0.5 shrink-0">
              {MAP_STYLES.map(({ id, label, short }) => (
                <button
                  key={id}
                  onClick={() => setMapStyle(id)}
                  title={`${label} map style`}
                  className={cn(
                    'rounded-md transition-all font-medium leading-none',
                    /* Mobile: tighter, Desktop: wider */
                    'px-1.5 py-1 text-[10px] md:px-2 md:py-1 md:text-[10px]',
                    mapStyle === id
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {/* Show short on mobile, full on md+ */}
                  <span className="md:hidden">{short}</span>
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Close — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 touch-target"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────────── */}
        <div className="shrink-0 flex overflow-x-auto border-b border-white/5 scrollbar-none">
          {TABS.map(({ id, label, short, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={cn(
                'flex-none flex flex-col items-center gap-0.5 py-2.5 transition-colors min-w-[44px]',
                /* Tighter on mobile, normal on md+ */
                'px-2 md:px-3',
                activeTab === id
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-500 hover:text-slate-300 active:text-slate-200'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {/* Show short label on mobile, full on md+ */}
              <span className="text-[8px] font-medium md:hidden leading-none">{short}</span>
              <span className="text-[9px] font-medium hidden md:block leading-none">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scroll p-3 md:p-4 space-y-4 md:space-y-5">
          {activeTab === 'directions' && <DirectionsPanel />}

          {activeTab === 'isochrone' && (
            <>
              <SearchBox />
              <ModeSelector />
              <TimeSlider />
              <MultiIntervalToggle />
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">
                  Origins
                </p>
                <OriginList />
              </div>
            </>
          )}

          {activeTab === 'stats'    && <StatsPanel />}
          {activeTab === 'matrix'   && <MatrixPanel />}
          {activeTab === 'poi'      && <POIPanel />}
          {activeTab === 'optimize' && <OptimizePanel />}
          {activeTab === 'saved'    && <SavedPlaces />}
        </div>
      </aside>
    </>
  )
}
