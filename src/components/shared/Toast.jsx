import { useEffect } from 'react'
import { useIsochroneStore } from '../../store/isochroneStore'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const COLORS = {
  success: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  error: 'text-red-400 border-red-500/20 bg-red-500/10',
  info: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
}

export default function Toast() {
  const { toast, clearToast } = useIsochroneStore()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, 3500)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null

  const Icon = ICONS[toast.type] || Info

  return (
    <div
      className={cn(
        'absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-2xl text-sm font-medium backdrop-blur-sm whitespace-nowrap',
        COLORS[toast.type] || COLORS.info
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-white">{toast.msg}</span>
      <button onClick={clearToast} className="ml-1">
        <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
      </button>
    </div>
  )
}
