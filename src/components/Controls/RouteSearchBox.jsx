import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2, MapPin, Crosshair } from 'lucide-react'
import { useGeocode } from '../../hooks/useGeocode'
import { useDebounce } from '../../hooks/useDebounce'
import { useIsochroneStore } from '../../store/isochroneStore'
import { cn } from '../../lib/utils'

/**
 * A geocoding search input for the Directions panel.
 * Props:
 *   placeholder    – input hint text
 *   value          – current label (controlled)
 *   onChange       – called with { lat, lng, label } when a result is selected
 *   onClear        – called when the clear (×) button is clicked
 *   onPickOnMap    – called when the crosshair button is clicked (set click target)
 *   isPickingOnMap – boolean, highlight crosshair when in picking mode
 *   dotColor       – CSS class for the left dot indicator (e.g. 'bg-green-400')
 */
export default function RouteSearchBox({
  placeholder = 'Search location…',
  value = '',
  onChange,
  onClear,
  onPickOnMap,
  isPickingOnMap = false,
  dotColor = 'bg-slate-400',
}) {
  const [input, setInput] = useState(value)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const blurTimer = useRef(null)
  const inputRef = useRef(null)

  const debouncedInput = useDebounce(input, 350)
  const { data: results = [], isFetching } = useGeocode(debouncedInput)

  // Sync external value changes (e.g. when user picks on map)
  useEffect(() => {
    setInput(value)
  }, [value])

  useEffect(() => {
    if (debouncedInput.trim().length > 2) setOpen(true)
    else setOpen(false)
    setActiveIdx(-1)
  }, [debouncedInput, results])

  const handleSelect = (item) => {
    setInput(item.label)
    setOpen(false)
    setActiveIdx(-1)
    onChange?.({ lat: item.lat, lng: item.lng, label: item.label })
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

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setOpen(false), 150)
  }
  const handleFocus = () => {
    clearTimeout(blurTimer.current)
    if (debouncedInput.trim().length > 2 && results.length > 0) setOpen(true)
  }

  const handleClear = () => {
    setInput('')
    setOpen(false)
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex-1 min-w-0">
      <div
        className={cn(
          'flex items-center gap-1.5 bg-white/5 border rounded-lg px-2.5 py-1.5 transition-colors',
          isPickingOnMap
            ? 'border-blue-500/60 bg-blue-500/10'
            : 'border-white/10 focus-within:border-blue-500/40'
        )}
      >
        {/* Colored dot indicator */}
        <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />

        {isFetching ? (
          <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
        ) : (
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none min-w-0"
          autoComplete="off"
          spellCheck={false}
        />

        {input && (
          <button onMouseDown={handleClear} tabIndex={-1} className="shrink-0">
            <X className="w-3 h-3 text-slate-500 hover:text-white transition-colors" />
          </button>
        )}

        {onPickOnMap && (
          <button
            onMouseDown={(e) => { e.preventDefault(); onPickOnMap() }}
            tabIndex={-1}
            title="Pick on map"
            className={cn(
              'shrink-0 p-0.5 rounded transition-colors',
              isPickingOnMap
                ? 'text-blue-400 bg-blue-500/20'
                : 'text-slate-500 hover:text-blue-400'
            )}
          >
            <Crosshair className="w-3 h-3" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-[#1e2537] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-48 overflow-y-auto custom-scroll">
          {results.map((item, idx) => (
            <li
              key={idx}
              onMouseDown={() => { clearTimeout(blurTimer.current); handleSelect(item) }}
              className={cn(
                'flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors text-xs',
                idx === activeIdx
                  ? 'bg-blue-600/30 text-white'
                  : 'text-slate-300 hover:bg-white/5'
              )}
            >
              <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-blue-400" />
              <span className="line-clamp-2 leading-snug">{item.label}</span>
            </li>
          ))}
        </ul>
      )}

      {open && !isFetching && results.length === 0 && debouncedInput.trim().length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e2537] border border-white/10 rounded-xl px-3 py-2.5 shadow-2xl z-50 text-xs text-slate-500 text-center">
          No results found
        </div>
      )}
    </div>
  )
}
