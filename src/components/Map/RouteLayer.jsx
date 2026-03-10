import { Source, Layer } from 'react-map-gl/maplibre'

export default function RouteLayer({ data }) {
  const feature = data?.features?.[0]
  if (!feature) return null

  return (
    <Source id="route" type="geojson" data={feature}>
      <Layer
        id="route-case"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': '#0f172a', 'line-width': 6, 'line-opacity': 0.8 }}
      />
      <Layer
        id="route-line"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': '#38bdf8', 'line-width': 3 }}
      />
    </Source>
  )
}
