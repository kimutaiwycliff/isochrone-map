import { Menu } from 'lucide-react'
import { useIsochroneStore } from './store/isochroneStore'
import IsochroneMap from './components/Map/IsochroneMap'
import SidePanel from './components/Panels/SidePanel'
import LoadingOverlay from './components/shared/LoadingOverlay'
import Toast from './components/shared/Toast'

export default function App() {
  const { sidebarOpen, setSidebarOpen } = useIsochroneStore()

  return (
    <div className="flex h-dvh w-screen bg-[#0f1117] overflow-hidden">
      {/* Sidebar — slide-in drawer on mobile, always-visible on md+ */}
      <SidePanel />

      {/* Map fills all remaining space */}
      <div className="flex-1 relative min-w-0">
        <IsochroneMap />
        <LoadingOverlay />
        <Toast />

        {/* Mobile open-panel FAB — shown only when drawer is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute top-safe-top left-4 mt-3 z-10 flex items-center gap-2 bg-[#1e2537]/95 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 shadow-2xl shadow-black/40 text-white text-sm font-semibold active:scale-95 transition-transform"
            aria-label="Open navigation panel"
          >
            <Menu className="w-4 h-4 text-blue-400" />
            <span>Explore</span>
          </button>
        )}

        {/* Attribution — bottom-right, hidden on very small screens */}
        <div className="absolute bottom-6 right-14 hidden sm:block text-[10px] text-slate-600 pointer-events-none select-none">
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
