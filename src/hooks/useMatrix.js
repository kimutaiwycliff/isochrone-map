import { useMutation } from '@tanstack/react-query'
import { fetchMatrix } from '../utils/ors'
import { useIsochroneStore } from '../store/isochroneStore'

export function useMatrix() {
  const { setMatrixData, showToast, profile } = useIsochroneStore()

  return useMutation({
    mutationFn: (locations) => fetchMatrix({ locations, profile }),
    onSuccess: (data) => setMatrixData(data),
    onError: (err) => showToast(err.message || 'Matrix fetch failed', 'error'),
  })
}
