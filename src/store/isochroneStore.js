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
      routeData: null,
      setRouteData: (data) => set({ routeData: data }),
      routeOriginId: null,
      setRouteOriginId: (id) => set({ routeOriginId: id }),
      routeDestination: null,
      setRouteDestination: (dest) => set({ routeDestination: dest }),

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
      activeTab: 'isochrone',
      setActiveTab: (tab) => set({ activeTab: tab }),
      sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      flyToTarget: null,
      setFlyToTarget: (target) => set({ flyToTarget: target }),
      // Map interaction mode: 'isochrone' | 'optimize'
      mapMode: 'isochrone',
      setMapMode: (mode) => set({ mapMode: mode }),
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
