import { useState, useDeferredValue, useRef, useEffect } from 'react'
import { Search, X, Loader2, MapPin } from 'lucide-react'
import { useGeocode } from '../../hooks/useGeocode'
import { useIsochroneStore } from '../../store/isochroneStore'
import { uniqueId } from '../../utils/geospatial'
import { ORIGIN_COLORS } from '../../utils/colors'
import { cn } from '../../lib/utils'

export default function SearchBox() {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const deferredInput = useDeferredValue(input)
  const { data: results = [], isFetching } = useGeocode(deferredInput)
  const { origins, addOrigin } = useIsochroneStore()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(-1)

  const handleSelect = (item) => {
    if (origins.length >= 3) return
    const id = uniqueId()
    const colorIndex = origins.length
    addOrigin({
      id,
      lat: item.lat,
      lng: item.lng,
      label: item.label,
      color: ORIGIN_COLORS[colorIndex % ORIGIN_COLORS.length].scheme,
    })
    setInput('')
    setOpen(false)
    setActiveIdx(-1)
  }

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      handleSelect(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (deferredInput.length > 2) setOpen(true)
    else setOpen(false)
    setActiveIdx(-1)
  }, [deferredInput])

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500/60 transition-colors">
        {isFetching ? (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => deferredInput.length > 2 && setOpen(true)}
          placeholder={origins.length >= 3 ? 'Max 3 origins added' : 'Search location\u2026'}
          disabled={origins.length >= 3}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none disabled:opacity-40"
        />
        {input && (
          <button onClick={() => { setInput(''); setOpen(false) }}>
            <X className="w-3.5 h-3.5 text-slate-500 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 bg-[#1e2537] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-52 overflow-y-auto custom-scroll"
        >
          {results.map((item, idx) => (
            <li
              key={idx}
              onMouseDown={() => handleSelect(item)}
              className={cn(
                'flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors text-sm',
                idx === activeIdx ? 'bg-blue-600/30 text-white' : 'text-slate-300 hover:bg-white/5'
              )}
            >
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
              <span className="line-clamp-1">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
