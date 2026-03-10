import { Menu } from 'lucide-react'
import { useIsochroneStore } from './store/isochroneStore'
import IsochroneMap from './components/Map/IsochroneMap'
import SidePanel from './components/Panels/SidePanel'
import LoadingOverlay from './components/shared/LoadingOverlay'
import Toast from './components/shared/Toast'

export default function App() {
  const { sidebarOpen, setSidebarOpen } = useIsochroneStore()

  return (
    /* flex-row: sidebar left, map fills the rest */
    <div className="flex h-screen w-screen bg-[#0f1117] overflow-hidden">
      {/* Sidebar — drawer on mobile, in-flow on md+ */}
      <SidePanel />

      {/* Map fills all remaining space */}
      <div className="flex-1 relative min-w-0">
        <IsochroneMap />
        <LoadingOverlay />
        <Toast />

        {/* Mobile "open panel" button — only when drawer is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#1e2537]/90 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 shadow-xl text-white text-sm font-medium"
            aria-label="Open controls"
          >
            <Menu className="w-4 h-4" />
            <span>Controls</span>
          </button>
        )}

        {/* Attribution */}
        <div className="absolute bottom-2 right-14 text-[10px] text-slate-600 pointer-events-none select-none">
          &copy;{' '}
          <a
            href="https://openrouteservice.org"
            className="pointer-events-auto hover:text-slate-400 transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            OpenRouteService
          </a>{' '}
          &middot; &copy; CARTO
        </div>
      </div>
    </div>
  )
}
