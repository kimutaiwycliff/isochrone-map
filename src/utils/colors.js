// Color schemes per origin index (blue, green, orange)
export const ORIGIN_COLORS = [
  {
    primary: '#3b82f6',    // blue
    light: '#93c5fd',
    dark: '#1d4ed8',
    fill: 'rgba(59,130,246,0.2)',
    scheme: 'blue',
  },
  {
    primary: '#10b981',    // emerald
    light: '#6ee7b7',
    dark: '#047857',
    fill: 'rgba(16,185,129,0.2)',
    scheme: 'green',
  },
  {
    primary: '#f59e0b',    // amber
    light: '#fcd34d',
    dark: '#b45309',
    fill: 'rgba(245,158,11,0.2)',
    scheme: 'orange',
  },
]

export const MODE_ICONS = {
  'foot-walking': '🚶',
  'foot-hiking': '🥾',
  'cycling-regular': '🚴',
  'cycling-mountain': '⛰️',
  'driving-car': '🚗',
  'driving-hgv': '🚛',
}

export const MODE_LABELS = {
  'foot-walking': 'Walking',
  'foot-hiking': 'Hiking',
  'cycling-regular': 'Cycling',
  'cycling-mountain': 'MTB',
  'driving-car': 'Driving',
  'driving-hgv': 'Truck',
}

// Returns color expression for fill based on travel time value (seconds)
export function getIsochroneFillExpression(colorScheme) {
  const colors = {
    blue: { dark: '#1d4ed8', mid: '#3b82f6', light: '#bfdbfe' },
    green: { dark: '#047857', mid: '#10b981', light: '#a7f3d0' },
    orange: { dark: '#b45309', mid: '#f59e0b', light: '#fde68a' },
  }
  const c = colors[colorScheme] || colors.blue
  return [
    'interpolate',
    ['linear'],
    ['get', 'value'],
    300,  c.dark,
    1800, c.light,
  ]
}
