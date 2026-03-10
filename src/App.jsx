import { useIsochroneStore } from './store/isochroneStore'
import IsochroneMap from './components/Map/IsochroneMap'
import SidePanel from './components/Panels/SidePanel'
import LoadingOverlay from './components/shared/LoadingOverlay'
import Toast from './components/shared/Toast'

export default function App() {
  const sidebarOpen = useIsochroneStore((s) => s.sidebarOpen)

  return (
    <div className="flex h-screen w-screen bg-[#0f1117] overflow-hidden relative">
      {/* Side panel */}
      <SidePanel />

      {/* Map area */}
      <div className="flex-1 relative">
        <IsochroneMap />
        <LoadingOverlay />
        <Toast />

        {/* Attribution */}
        <div className="absolute bottom-2 right-14 text-[10px] text-slate-600 pointer-events-none">
          &copy; <a href="https://openrouteservice.org" className="pointer-events-auto hover:text-slate-400">OpenRouteService</a> &middot; &copy; CARTO
        </div>
      </div>
    </div>
  )
}
