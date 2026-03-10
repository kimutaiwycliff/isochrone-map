import { Map, BarChart3, Bookmark, Navigation, ChevronLeft, ChevronRight } from 'lucide-react'
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
      {/* Mobile toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          'absolute z-20 top-4 transition-all duration-300 bg-[#1e2537] border border-white/10 rounded-full p-2 shadow-xl md:hidden',
          sidebarOpen ? 'left-[calc(100vw-3rem)]' : 'left-4'
        )}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-white" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white" />
        )}
      </button>

      <aside
        className={cn(
          'absolute md:relative z-10 top-0 left-0 h-full flex flex-col bg-[#161b26] border-r border-white/5 transition-all duration-300 overflow-hidden',
          sidebarOpen ? 'w-[min(85vw,360px)]' : 'w-0 md:w-0'
        )}
      >
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-white text-base">Isochrone Map</h1>
          </div>
          <p className="text-xs text-slate-500">Where can you reach in X minutes?</p>
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
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Origins</p>
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
