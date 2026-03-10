import { useMutation } from '@tanstack/react-query'
import { fetchElevation } from '../utils/ors'
import { useIsochroneStore } from '../store/isochroneStore'

// Haversine distance between two [lng, lat] points in km
function haversineDist([lng1, lat1], [lng2, lat2]) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useElevation() {
  const { setElevationData, showToast } = useIsochroneStore()

  return useMutation({
    mutationFn: async (coordinates) => {
      const elevCoords = await fetchElevation(coordinates)
      // Build chart data: cumulative distance (km) + elevation (m)
      let cumDist = 0
      return elevCoords.map((pt, i) => {
        if (i > 0) cumDist += haversineDist(elevCoords[i - 1], pt)
        return { dist: parseFloat(cumDist.toFixed(3)), elev: pt[2] ?? 0 }
      })
    },
    onSuccess: (data) => setElevationData(data),
    onError: (err) => showToast(err.message || 'Elevation fetch failed', 'error'),
  })
}
