import { useMutation } from '@tanstack/react-query'
import { fetchDirections } from '../utils/ors'
import { useIsochroneStore } from '../store/isochroneStore'
import { useElevation } from './useElevation'

export function useDirections() {
  const {
    routeProfile,
    routePreference,
    avoidFeatures,
    routeAlternativeCount,
    setRouteAlternatives,
    setActiveRouteIdx,
    showToast,
    // legacy
    profile,
    setRouteData,
  } = useIsochroneStore()

  const { mutate: fetchElev } = useElevation()

  return useMutation({
    mutationFn: ({ waypoints, start, end, useRouteProfile = true }) => {
      const prof = useRouteProfile ? routeProfile : profile
      return fetchDirections({
        profile: prof,
        waypoints,
        preference: routePreference,
        avoidFeatures,
        alternatives: routeAlternativeCount,
        // legacy
        start,
        end,
      })
    },
    onSuccess: (data, variables) => {
      const features = data?.features ?? []
      if (!features.length) {
        showToast('No route found', 'error')
        return
      }

      // Store all alternatives
      setRouteAlternatives(features)
      setActiveRouteIdx(0)

      // Also set legacy routeData for backward-compat (isochrone-triggered route)
      if (variables?.start && variables?.end) {
        setRouteData(data)
      }

      // Fetch elevation for the primary route
      const coords = features[0]?.geometry?.coordinates
      if (coords && coords.length > 1) {
        fetchElev(coords.map((c) => [c[0], c[1]]))
      }
    },
    onError: (err) => {
      showToast(err.message || 'Failed to fetch route', 'error')
    },
  })
}
