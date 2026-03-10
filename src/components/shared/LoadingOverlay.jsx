import { useIsMutating } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

export default function LoadingOverlay() {
  const isMutating = useIsMutating()
  if (!isMutating) return null

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 pointer-events-none">
      <div className="flex items-center gap-3 bg-[#1e2537]/90 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 shadow-2xl">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        <span className="text-sm text-white font-medium">Fetching isochrone&hellip;</span>
      </div>
    </div>
  )
}
