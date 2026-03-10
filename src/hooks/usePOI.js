import { useMutation } from '@tanstack/react-query'
import { fetchPOI } from '../utils/ors'
import { useIsochroneStore } from '../store/isochroneStore'

export function usePOI() {
  const { setPoiData, showToast } = useIsochroneStore()

  return useMutation({
    mutationFn: ({ geojson, categoryIds }) => fetchPOI({ geojson, categoryIds }),
    onSuccess: (data) => setPoiData(data),
    onError: (err) => showToast(err.message || 'POI fetch failed', 'error'),
  })
}
