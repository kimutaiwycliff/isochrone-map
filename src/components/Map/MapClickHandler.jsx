import { useCallback } from 'react'
import { useIsochroneStore } from '../../store/isochroneStore'
import { uniqueId } from '../../utils/geospatial'
import { fetchGeocode } from '../../utils/ors'
import { ORIGIN_COLORS } from '../../utils/colors'

/**
 * Exported hook — used by IsochroneMap to handle map click events.
 * Adds a new origin (up to 3) with reverse-geocoded label.
 */
export function useMapClick() {
  const { origins, addOrigin } = useIsochroneStore()

  return useCallback(
    async (e) => {
      if (origins.length >= 3) return
      const { lng, lat } = e.lngLat
      const id = uniqueId()
      const colorIndex = origins.length
      const color = ORIGIN_COLORS[colorIndex % ORIGIN_COLORS.length]

      let label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      try {
        const geo = await fetchGeocode(`${lat},${lng}`, 1)
        if (geo?.features?.[0]?.properties?.label) {
          label = geo.features[0].properties.label
        }
      } catch {
        // use coord fallback
      }

      addOrigin({ id, lat, lng, label, color: color.scheme })
    },
    [origins, addOrigin]
  )
}
