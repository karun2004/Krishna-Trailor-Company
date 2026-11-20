import type { Office } from '@/lib/queries/types'

// Stylised outline as [lon, lat]; projected linearly. Illustrative, not survey-accurate.
const OUTLINE: [number, number][] = [
  [74, 37], [77, 35.5], [79, 34], [78.5, 32.5], [80, 30.5], [84, 28.5], [88, 27.5], [88.5, 26.5], [92, 27.5],
  [96, 28.5], [97, 27], [95, 26], [94, 24], [93, 22], [92, 22], [91, 24.5], [89, 25], [89, 22], [87, 21.5],
  [85, 19.5], [82, 16.5], [80, 15], [80, 13], [79.5, 10.5], [78, 8.5], [77, 8.2], [76, 10], [75, 12.5],
  [74, 15], [73, 17.5], [72.8, 20], [72.5, 21.5], [70, 21], [69, 22.5], [70.5, 23.5], [68.5, 23.5], [71, 24.5],
  [70, 26], [70.5, 28], [72, 31], [74, 32.5], [74.5, 34],
]
const CITIES: { match: RegExp; lon: number; lat: number; label: string }[] = [
  { match: /chandigarh/i, lon: 76.8, lat: 30.7, label: 'Chandigarh' },
  { match: /bhopal/i, lon: 77.4, lat: 23.26, label: 'Bhopal' },
]
const W = 300
const H = 340
const px = (lon: number) => (lon - 67) * 10
const py = (lat: number) => (37.5 - lat) * 10

export function IndiaMap({ offices }: { offices: Office[] }) {
  const d = OUTLINE.map(([lo, la], i) => `${i ? 'L' : 'M'}${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join(' ') + 'Z'
  const markers = offices.flatMap((o) => {
    const c = CITIES.find((x) => x.match.test(o.name))
    return c ? [{ o, c }] : []
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Map of India with offices in ${markers.map((m) => m.c.label).join(' and ')}`} className="mx-auto h-auto w-full max-w-md">
      <path d={d} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinejoin="round" />
      {markers.map(({ o, c }) => (
        <g key={o.id}>
          <circle cx={px(c.lon)} cy={py(c.lat)} r="9" fill="#F28C28" opacity="0.25" />
          <circle cx={px(c.lon)} cy={py(c.lat)} r="4" fill="#F28C28" />
          <text x={px(c.lon) + 12} y={py(c.lat) + 4} fill="#fff" fontSize="10" fontFamily="var(--font-mono), monospace">
            {c.label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  )
}
