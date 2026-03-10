import { useMutation } from '@tanstack/react-query'
import { fetchIsochrone } from '../utils/ors'
import { useIsochroneStore } from '../store/isochroneStore'

export function useIsochrone(originId) {
  const { setIsochroneData, showToast, profile, timeRanges, multiInterval } = useIsochroneStore()

  return useMutation({
    mutationFn: ({ lat, lng }) => {
      const ranges = multiInterval ? [...timeRanges].sort((a, b) => b - a) : [Math.max(...timeRanges)]
      return fetchIsochrone({ lat, lng, profile, ranges })
    },
    onSuccess: (data) => {
      setIsochroneData(originId, data)
    },
    onError: (err) => {
      showToast(err.message || 'Failed to fetch isochrone', 'error')
    },
  })
}
