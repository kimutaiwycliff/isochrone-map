import { useMutation } from '@tanstack/react-query'
import polyline from '@mapbox/polyline'
import { fetchOptimize } from '../utils/ors'
import { useIsochroneStore } from '../store/isochroneStore'

export function useOptimize() {
  const { setOptimizeData, setOptimizeRoute, showToast, profile } = useIsochroneStore()

  return useMutation({
    mutationFn: ({ vehicle, jobs }) => fetchOptimize({ vehicle, jobs }),
    onSuccess: (data) => {
      setOptimizeData(data)
      // Decode the polyline geometry from the first route
      const encoded = data?.routes?.[0]?.geometry
      if (encoded) {
        const coords = polyline.decode(encoded).map(([lat, lng]) => [lng, lat])
        setOptimizeRoute({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {},
        })
      }
    },
    onError: (err) => showToast(err.message || 'Optimization failed', 'error'),
  })
}
