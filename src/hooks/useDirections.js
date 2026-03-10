import { useMutation } from '@tanstack/react-query'
import { fetchDirections } from '../utils/ors'
import { useIsochroneStore } from '../store/isochroneStore'

export function useDirections() {
  const { profile, setRouteData, showToast } = useIsochroneStore()

  return useMutation({
    mutationFn: ({ start, end }) => fetchDirections({ profile, start, end }),
    onSuccess: (data) => {
      setRouteData(data)
    },
    onError: (err) => {
      showToast(err.message || 'Failed to fetch route', 'error')
    },
  })
}
