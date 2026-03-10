import { Source, Layer } from 'react-map-gl/maplibre'
import { ORIGIN_COLORS, getIsochroneFillExpression } from '../../utils/colors'
import { useIsochroneStore } from '../../store/isochroneStore'
import { useDirections } from '../../hooks/useDirections'

export default function IsochroneLayer({ origin, data }) {
  const originIndex = useIsochroneStore((s) =>
    s.origins.findIndex((o) => o.id === origin.id)
  )
  const { setRouteDestination, setRouteOriginId, setActiveTab } = useIsochroneStore()
  const { mutate: fetchRoute } = useDirections()

  const colorConfig = ORIGIN_COLORS[originIndex % ORIGIN_COLORS.length]
  const fillExpression = getIsochroneFillExpression(colorConfig.scheme)

  return (
    <Source id={`iso-${origin.id}`} type="geojson" data={data}>
      <Layer
        id={`iso-fill-${origin.id}`}
        type="fill"
        paint={{
          'fill-color': fillExpression,
          'fill-opacity': 0.35,
        }}
      />
      <Layer
        id={`iso-line-${origin.id}`}
        type="line"
        paint={{
          'line-color': colorConfig.primary,
          'line-width': 1.5,
          'line-opacity': 0.8,
        }}
      />
    </Source>
  )
}
