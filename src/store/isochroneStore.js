import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useIsochroneStore = create(
  persist(
    (set) => ({
      // Origins (up to 3)
      origins: [],
      addOrigin: (origin) =>
        set((s) => ({ origins: [...s.origins, origin].slice(0, 3) })),
      removeOrigin: (id) =>
        set((s) => ({ origins: s.origins.filter((o) => o.id !== id) })),
      updateOrigin: (id, updates) =>
        set((s) => ({
          origins: s.origins.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        })),
      clearOrigins: () => set({ origins: [], isochroneData: {} }),

      // Travel settings
      profile: 'foot-walking',
      setProfile: (profile) => set({ profile }),
      timeRanges: [600, 1200, 1800], // seconds (10, 20, 30 min)
      setTimeRanges: (ranges) => set({ timeRanges: ranges }),
      multiInterval: true,
      setMultiInterval: (v) => set({ multiInterval: v }),

      // Results
      isochroneData: {},
      setIsochroneData: (id, data) =>
        set((s) => ({ isochroneData: { ...s.isochroneData, [id]: data } })),
      removeIsochroneData: (id) =>
        set((s) => {
          const next = { ...s.isochroneData }
          delete next[id]
          return { isochroneData: next }
        }),

      // Route
      routeData: null,
      setRouteData: (data) => set({ routeData: data }),
      routeOriginId: null,
      setRouteOriginId: (id) => set({ routeOriginId: id }),
      routeDestination: null,
      setRouteDestination: (dest) => set({ routeDestination: dest }),

      // Saved places (persisted)
      savedPlaces: [],
      savePlace: (place) =>
        set((s) => ({ savedPlaces: [...s.savedPlaces, place] })),
      removePlace: (id) =>
        set((s) => ({ savedPlaces: s.savedPlaces.filter((p) => p.id !== id) })),

      // UI
      activeTab: 'isochrone',
      setActiveTab: (tab) => set({ activeTab: tab }),
      // Open by default on desktop, closed on mobile
      sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
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
