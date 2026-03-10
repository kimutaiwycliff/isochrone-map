import { Source, Layer } from 'react-map-gl/maplibre'
import { useIsochroneStore } from '../../store/isochroneStore'

export default function OptimizeRouteLayer() {
  const { optimizeRoute } = useIsochroneStore()
  if (!optimizeRoute) return null

  return (
    <Source id="optimize-route" type="geojson" data={optimizeRoute}>
      <Layer
        id="optimize-route-case"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': '#0f172a', 'line-width': 6, 'line-opacity': 0.7 }}
      />
      <Layer
        id="optimize-route-line"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{
          'line-color': '#f59e0b',
          'line-width': 3,
          'line-dasharray': [2, 1.5],
        }}
      />
    </Source>
  )
}
