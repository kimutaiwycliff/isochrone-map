import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useIsochroneStore = create(
  persist(
    (set) => ({
      // ── Origins (up to 3) ───────────────────────────────────────────────────
      origins: [],
      addOrigin: (origin) =>
        set((s) => ({ origins: [...s.origins, origin].slice(0, 3) })),
      removeOrigin: (id) =>
        set((s) => ({ origins: s.origins.filter((o) => o.id !== id) })),
      updateOrigin: (id, updates) =>
        set((s) => ({
          origins: s.origins.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        })),
      clearOrigins: () => set({ origins: [], isochroneData: {}, matrixData: null }),

      // ── Travel settings ────────────────────────────────────────────────────
      profile: 'foot-walking',
      setProfile: (profile) => set({ profile }),
      timeRanges: [600, 1200, 1800],
      setTimeRanges: (ranges) => set({ timeRanges: ranges }),
      multiInterval: true,
      setMultiInterval: (v) => set({ multiInterval: v }),

      // ── Isochrone results ─────────────────────────────────────────────────
      isochroneData: {},
      setIsochroneData: (id, data) =>
        set((s) => ({ isochroneData: { ...s.isochroneData, [id]: data } })),
      removeIsochroneData: (id) =>
        set((s) => {
          const next = { ...s.isochroneData }
          delete next[id]
          return { isochroneData: next }
        }),

      // ── Directions / Route ─────────────────────────────────────────────────
      // Legacy isochrone-triggered route (kept for backwards compat)
      routeData: null,
      setRouteData: (data) => set({ routeData: data }),
      routeOriginId: null,
      setRouteOriginId: (id) => set({ routeOriginId: id }),
      routeDestination: null,
      setRouteDestination: (dest) => set({ routeDestination: dest }),

      // ── Standalone Directions mode ─────────────────────────────────────────
      // routeWaypoints: ordered array of { id, lat, lng, label, role: 'from'|'via'|'to' }
      routeWaypoints: [],
      setRouteWaypoints: (wps) => set({ routeWaypoints: wps }),
      addRouteWaypoint: (wp) =>
        set((s) => ({ routeWaypoints: [...s.routeWaypoints, wp] })),
      updateRouteWaypoint: (id, updates) =>
        set((s) => ({
          routeWaypoints: s.routeWaypoints.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),
      removeRouteWaypoint: (id) =>
        set((s) => ({
          routeWaypoints: s.routeWaypoints.filter((w) => w.id !== id),
        })),
      swapRouteEndpoints: () =>
        set((s) => {
          const wps = [...s.routeWaypoints]
          if (wps.length < 2) return {}
          const first = { ...wps[0], role: 'from' }
          const last = { ...wps[wps.length - 1], role: 'to' }
          wps[0] = { ...last, role: 'from' }
          wps[wps.length - 1] = { ...first, role: 'to' }
          return { routeWaypoints: wps }
        }),

      // Profile separate from isochrone profile
      routeProfile: 'driving-car',
      setRouteProfile: (p) => set({ routeProfile: p }),

      routePreference: 'recommended',
      setRoutePreference: (p) => set({ routePreference: p }),

      avoidFeatures: [],
      setAvoidFeatures: (feats) => set({ avoidFeatures: feats }),
      toggleAvoidFeature: (feat) =>
        set((s) => ({
          avoidFeatures: s.avoidFeatures.includes(feat)
            ? s.avoidFeatures.filter((f) => f !== feat)
            : [...s.avoidFeatures, feat],
        })),

      // Number of alternatives to request (1 = just best route)
      routeAlternativeCount: 2,
      setRouteAlternativeCount: (n) => set({ routeAlternativeCount: n }),

      // All returned route features (GeoJSON features array)
      routeAlternatives: [],
      setRouteAlternatives: (routes) => set({ routeAlternatives: routes }),

      // Which alternative is active (0 = first/best)
      activeRouteIdx: 0,
      setActiveRouteIdx: (i) => set({ activeRouteIdx: i }),

      // Directions "pick on map" target: null | 'from' | 'to' | index (via)
      directionsClickTarget: null,
      setDirectionsClickTarget: (t) => set({ directionsClickTarget: t }),

      // ── Matrix ────────────────────────────────────────────────────────────
      matrixData: null,
      setMatrixData: (data) => set({ matrixData: data }),

      // ── Elevation (attached to current route) ─────────────────────────────
      elevationData: null,   // [{ dist: km, elev: m }, ...]
      setElevationData: (data) => set({ elevationData: data }),

      // ── POI ───────────────────────────────────────────────────────────────
      poiData: null,         // GeoJSON FeatureCollection
      setPoiData: (data) => set({ poiData: data }),
      poiFilters: [],        // selected category IDs
      setPoiFilters: (ids) => set({ poiFilters: ids }),
      poiOriginId: null,     // which origin's isochrone is used for POI query
      setPoiOriginId: (id) => set({ poiOriginId: id }),

      // ── Optimization (waypoints / TSP) ────────────────────────────────────
      waypoints: [],         // [{ id, lat, lng, label }]
      addWaypoint: (wp) => set((s) => ({ waypoints: [...s.waypoints, wp] })),
      removeWaypoint: (id) =>
        set((s) => ({ waypoints: s.waypoints.filter((w) => w.id !== id) })),
      clearWaypoints: () => set({ waypoints: [], optimizeData: null }),
      optimizeData: null,    // raw ORS optimization response
      setOptimizeData: (data) => set({ optimizeData: data }),
      optimizeRoute: null,   // decoded GeoJSON LineString for display
      setOptimizeRoute: (route) => set({ optimizeRoute: route }),

      // ── Saved places (persisted) ──────────────────────────────────────────
      savedPlaces: [],
      savePlace: (place) =>
        set((s) => ({ savedPlaces: [...s.savedPlaces, place] })),
      removePlace: (id) =>
        set((s) => ({ savedPlaces: s.savedPlaces.filter((p) => p.id !== id) })),

      // ── UI ────────────────────────────────────────────────────────────────
      activeTab: 'directions',
      setActiveTab: (tab) => set({ activeTab: tab }),
      sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      flyToTarget: null,
      setFlyToTarget: (target) => set({ flyToTarget: target }),
      // Map interaction mode: 'isochrone' | 'optimize' | 'directions'
      mapMode: 'directions',
      setMapMode: (mode) => set({ mapMode: mode }),

      // Active map style key
      mapStyle: 'dark',
      setMapStyle: (style) => set({ mapStyle: style }),
      toast: null,
      showToast: (msg, type = 'info') => set({ toast: { msg, type, id: Date.now() } }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'isochrone-store',
      partialize: (s) => ({ savedPlaces: s.savedPlaces }),
    }
  )
)
