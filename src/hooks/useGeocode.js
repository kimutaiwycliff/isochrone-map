import { useQuery } from '@tanstack/react-query'
import { fetchGeocode } from '../utils/ors'

export function useGeocode(searchText) {
  return useQuery({
    queryKey: ['geocode', searchText],
    queryFn: () => fetchGeocode(searchText),
    enabled: searchText.trim().length > 2,
    staleTime: 30_000,
    select: (data) =>
      data?.features?.map((f) => ({
        label: f.properties.label,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      })) ?? [],
  })
}
