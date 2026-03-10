# Route Explorer

A full-featured, open-source mapping application powered by [OpenRouteService](https://openrouteservice.org). Plan routes, analyse reachability, discover nearby places, compute travel-time matrices, and optimise multi-stop itineraries — all in a single responsive interface.

---

## Features

### Directions
The primary mode. Plan routes between any two or more points with full control over how you travel.

- **9 travel profiles** — Car, Truck, Regular bike, Road bike, Mountain bike, E-bike, Walking, Hiking, Wheelchair
- **Multi-waypoint routing** — add unlimited via stops between start and end
- **Pick on map** — tap the crosshair icon on any waypoint input, then click the map to place it
- **Swap endpoints** — reverse the route in one click
- **Route preference** — Recommended, Fastest, or Shortest
- **Avoid features** — Highways, Tolls, Ferries, Tunnels, Fords, Steps, Unpaved roads
- **Up to 3 alternative routes** — shown simultaneously; tap any to make it active
- **Colour-coded A/B/C markers** on the map (green = start, red = end, blue = via)
- **Elevation profile** — interactive chart auto-loaded for every route
- **Ascent / Descent stats** pulled directly from ORS
- **Turn-by-turn instructions** with step distance
- **Export** — download the active route as GeoJSON or GPX

### Isochrones
Visualise how far you can travel from one or more origins within a given time.

- Up to **3 simultaneous origins** — click the map or search to place them; drag to reposition
- **6 time bands** — 5 min, 10 min, 15 min, 30 min, 45 min, 60 min (toggle individually)
- **Multi-interval mode** — show all bands at once or just the outer boundary
- **4 profiles** — Walking, Cycling, Car, Heavy vehicle
- Each origin gets a distinct colour scheme (blue, green, orange)

### Stats
Tabular breakdown of each isochrone's computed area (km² / ha) and reachfactor per time band.

### Matrix
Travel-time and distance table between all active origins — useful for comparing accessibility between locations.

### Points of Interest (POI)
Search within an isochrone polygon for nearby amenities.

- **6 categories** — Food & Drink, Health, Transport, Finance, Education, Culture
- Returns up to 200 results sorted by distance, rendered as map markers

### Route Optimization (VRP / TSP)
Find the shortest path through multiple unordered job stops.

- Set Origin 1 as your vehicle depot
- Click the map to add job stops
- Hit **Optimize** to solve the Travelling Salesman Problem via ORS
- Shows optimised stop order with arrival times and total distance

### Saved Places
Bookmark any origin for quick reuse across sessions (persisted to `localStorage`).

---

## Map Styles

Switch between **Dark**, **Light**, and **Voyager** map themes using the controls in the top-left header.

---

## Tech Stack

| Concern | Library |
|---------|---------|
| UI framework | React 19 + Vite 7 |
| State management | Zustand 5 (persist middleware) |
| Data fetching | TanStack Query v5 |
| Map rendering | MapLibre GL 5 via react-map-gl 8 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Polyline codec | @mapbox/polyline |
| Routing API | OpenRouteService v2 |

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (or Node 18+)
- A free [OpenRouteService API key](https://openrouteservice.org/dev/#/signup)

### Installation

```bash
git clone <repo-url>
cd isochrone-map
bun install
```

### Environment

Create `.env.local` in the project root:

```env
VITE_ORS_API_KEY=your_ors_api_key_here
```

> Without a key, geocoding falls back to Nominatim (OpenStreetMap) and advanced features (Directions, Elevation, Matrix, POI, Optimization) will be unavailable.

### Development

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
bun run build
```

Output goes to `dist/`.

---

## ORS API Services Used

| Feature | Endpoint |
|---------|----------|
| Directions | `POST /v2/directions/{profile}/geojson` |
| Isochrones | `POST /v2/isochrones/{profile}` |
| Matrix | `POST /v2/matrix/{profile}` |
| Elevation | `POST /elevation/line` |
| Geocoding | `GET /geocode/search/autocomplete` |
| POI | `POST /pois` |
| Optimization | `POST /optimization` |
| Snap | `POST /v2/snap/{profile}` |

---

## Mobile

The app is built mobile-first:

- Sidebar slides in as a full-screen drawer on phones; always visible on tablet/desktop
- Map controls are enlarged for touch
- All interactive elements meet the 44 × 44 px minimum touch target
- Safe-area insets handled for iOS notch / Dynamic Island
- Dynamic viewport height (`dvh`) prevents layout shifts when the browser chrome collapses
- Smooth scroll with overscroll containment inside panels

---

## Project Structure

```
src/
├── components/
│   ├── Controls/         # SearchBox, RouteSearchBox, ModeSelector, TimeSlider, …
│   ├── Map/              # IsochroneMap, RouteLayer, IsochroneLayer, OriginMarker, …
│   ├── Panels/           # DirectionsPanel, StatsPanel, MatrixPanel, POIPanel, …
│   └── shared/           # LoadingOverlay, Toast
├── hooks/                # useDirections, useIsochrone, useMatrix, usePOI, …
├── store/
│   └── isochroneStore.js # All application state (Zustand)
├── utils/
│   ├── ors.js            # All ORS API calls
│   ├── geospatial.js     # Formatters, uniqueId, bbox helpers
│   └── colors.js         # Origin / profile colour schemes
└── styles/
    └── index.css         # Global styles, custom properties, mobile utilities
```

---

## License

MIT
