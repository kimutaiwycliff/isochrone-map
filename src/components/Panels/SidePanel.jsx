import { Map, BarChart3, Bookmark, Navigation, X } from 'lucide-react'
import { useIsochroneStore } from '../../store/isochroneStore'
import SearchBox from '../Controls/SearchBox'
import ModeSelector from '../Controls/ModeSelector'
import TimeSlider from '../Controls/TimeSlider'
import MultiIntervalToggle from '../Controls/MultiIntervalToggle'
import OriginList from '../Controls/OriginList'
import StatsPanel from './StatsPanel'
import SavedPlaces from './SavedPlaces'
import RouteDetails from './RouteDetails'
import { cn } from '../../lib/utils'

const TABS = [
  { id: 'isochrone', label: 'Map', icon: Map },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'route', label: 'Route', icon: Navigation },
]

export default function SidePanel() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useIsochroneStore()

  return (
    <>
      {/* Mobile backdrop — closes drawer on tap outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar
          Mobile:  fixed overlay, slides in/out via translate
          Desktop: in-flow, always visible, no toggle needed           */}
      <aside
        className={cn(
          'fixed md:relative z-30 md:z-auto',
          'top-0 left-0 h-full',
          'w-[min(85vw,320px)] md:w-[360px] shrink-0',
          'transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'flex flex-col bg-[#161b26] border-r border-white/5 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Map className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white text-sm leading-tight">Isochrone Map</h1>
              <p className="text-[11px] text-slate-500 leading-tight truncate">
                Where can you reach in X minutes?
              </p>
            </div>
            {/* Close — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex border-b border-white/5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
                activeTab === id
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-5">
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
          {activeTab === 'stats' && <StatsPanel />}
          {activeTab === 'saved' && <SavedPlaces />}
          {activeTab === 'route' && <RouteDetails />}
        </div>
      </aside>
    </>
  )
}
