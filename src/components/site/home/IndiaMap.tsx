'use client'
import { useEffect, useRef, useState } from 'react'
import { useScrollMotion } from '@/lib/motion'
import type { Office } from '@/lib/queries/types'

// Simplified outline as [lon, lat], clockwise from the north. Illustrative, not survey-accurate.
const OUTLINE: [number, number][] = [
  [77.8, 35.5], [79.0, 35.2], [80.2, 34.6], [80.2, 33.6], [79.4, 32.8], [78.9, 32.2], [78.8, 31.4], [79.2, 30.9], [80.2, 30.6], [81.0, 30.2],
  [80.5, 29.5], [80.1, 28.8], [81.0, 28.4], [82.0, 27.9], [83.3, 27.4], [84.7, 27.0], [85.8, 26.6], [87.0, 26.4], [88.1, 26.5],
  [88.2, 27.3], [88.8, 27.9], [88.9, 27.1], [89.6, 26.7], [90.9, 26.8], [92.0, 26.9], [91.7, 27.8], [92.7, 28.1], [93.8, 28.8],
  [94.7, 29.3], [95.9, 29.3], [97.0, 28.2], [96.5, 27.3], [97.3, 27.0], [96.2, 26.4], [95.3, 26.0], [94.6, 25.2], [94.6, 24.5],
  [94.1, 23.8], [93.4, 23.0], [93.1, 22.2], [92.7, 22.9], [92.3, 23.7], [91.9, 24.2], [91.8, 25.1], [90.7, 25.15], [89.8, 25.3],
  [89.8, 26.0], [89.0, 26.3], [88.4, 25.5], [88.1, 25.0], [88.5, 24.2], [88.9, 23.7], [88.6, 23.0], [89.0, 22.3], [88.6, 21.6],
  [87.5, 21.6], [86.9, 21.0], [86.5, 20.2], [85.5, 19.7], [84.7, 19.0], [83.9, 18.2], [83.0, 17.4], [82.3, 16.6], [81.4, 16.0],
  [80.8, 15.6], [80.3, 15.3], [80.1, 14.0], [80.3, 13.1], [79.9, 11.9], [79.8, 10.8], [79.3, 10.3], [78.9, 9.3], [78.2, 8.9],
  [77.5, 8.1], [76.9, 8.4], [76.5, 9.2], [76.3, 10.0], [75.8, 11.2], [75.2, 12.2], [74.7, 13.2], [74.3, 14.5], [73.8, 15.5],
  [73.4, 16.6], [72.9, 18.0], [72.8, 19.1], [72.7, 20.3], [72.8, 21.1], [72.6, 21.8], [72.2, 21.3], [71.4, 20.9], [70.6, 20.8],
  [69.8, 21.0], [69.1, 22.2], [69.7, 22.5], [70.4, 22.9], [69.5, 22.8], [68.6, 23.4], [68.2, 23.7], [68.1, 24.2], [69.0, 24.3],
  [69.9, 24.9], [70.3, 25.7], [70.0, 26.5], [70.4, 27.6], [71.1, 27.9], [71.9, 28.6], [72.9, 29.2], [73.6, 29.9], [74.5, 30.9],
  [74.6, 31.6], [74.8, 32.4], [74.3, 32.8], [73.7, 32.6], [73.3, 33.1], [73.8, 33.8], [73.1, 34.5], [73.0, 35.2], [73.7, 35.9],
  [74.3, 36.8], [75.2, 37.0], [76.3, 36.9], [77.2, 35.9],
]

const W = 300
const H = 335
const px = (lon: number) => 6 + (lon - 68) * 9.4
const py = (lat: number) => 6 + (37 - lat) * 10

type City = { key: string; label: string; lon: number; lat: number; side: 'l' | 'r'; dy?: number }
const CITIES: Record<string, City> = {
  chandigarh: { key: 'chandigarh', label: 'Chandigarh', lon: 76.78, lat: 30.73, side: 'l', dy: 4 },
  bhopal: { key: 'bhopal', label: 'Bhopal', lon: 77.41, lat: 23.26, side: 'r' },
  jammu: { key: 'jammu', label: 'Jammu', lon: 74.86, lat: 32.73, side: 'l' },
  dehradun: { key: 'dehradun', label: 'Dehradun', lon: 78.03, lat: 30.32, side: 'r', dy: 9 },
}

/** Catmull-Rom spline through the points, as a closed cubic-Bezier path (softens the polyline coastline). */
function smoothClosed(pts: [number, number][]): string {
  const n = pts.length
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}

const arc = (a: City, b: City, bend: number) => {
  const x1 = px(a.lon), y1 = py(a.lat), x2 = px(b.lon), y2 = py(b.lat)
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx - (dy / len) * bend).toFixed(1)} ${(my + (dx / len) * bend).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

const OUTLINE_PX = OUTLINE.map(([lo, la]) => [px(lo), py(la)] as [number, number])
const OUTLINE_D = smoothClosed(OUTLINE_PX)

// Island groups (Andaman, Nicobar, Lakshadweep) as small dotted marks so the map reads as the whole country.
const ISLANDS: [number, number][][] = [
  [[92.9, 13.4], [93.0, 12.3], [92.8, 11.2], [92.6, 10.8]],
  [[93.7, 8.2], [93.9, 7.2], [93.6, 6.9]],
  [[72.7, 11.5], [72.6, 10.6], [73.0, 10.1]],
]

export function IndiaMap({ offices }: { offices: Office[] }) {
  const ref = useRef<SVGSVGElement>(null)
  const [still, setStill] = useState(false)
  useEffect(() => { setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])

  const hasBhopal = offices.some((o) => /bhopal/i.test(o.name))
  // KTC office route (orange); Radhe Travels bus routes (light blue, flowing).
  const routes = [
    ...(hasBhopal ? [{ id: 'ktc', d: arc(CITIES.chandigarh, CITIES.bhopal, -16), bus: false }] : []),
    { id: 'jammu', d: arc(CITIES.chandigarh, CITIES.jammu, 6), bus: true },
    { id: 'dehradun', d: arc(CITIES.chandigarh, CITIES.dehradun, -4), bus: true },
  ]
  const cities = [CITIES.chandigarh, ...(hasBhopal ? [CITIES.bhopal] : []), CITIES.jammu, CITIES.dehradun]
  const office = (k: string) => k === 'chandigarh' || k === 'bhopal'

  useScrollMotion(ref, ({ gsap }) => {
    const svg = ref.current
    if (!svg) return
    const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%', once: true } })
    tl.fromTo('[data-outline]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' })
      .fromTo('[data-dots]', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.8)
      .fromTo('[data-route]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.35 }, 1.4)
      .fromTo('[data-city]', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out', stagger: 0.15 }, 1.2)
  })

  const label = `Map of India. KTC offices in Chandigarh${hasBhopal ? ' and Bhopal' : ''}; Radhe Travels bus routes from Chandigarh to Jammu and Dehradun`
  return (
    <figure className="w-full">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-lg">
        <defs>
          <clipPath id="india-clip"><path d={OUTLINE_D} /></clipPath>
          <pattern id="india-dots" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.85" fill="#fff" />
          </pattern>
          <radialGradient id="india-glow" cx="30%" cy="22%" r="75%">
            <stop offset="0" stopColor="#F28C28" stopOpacity="0.5" />
            <stop offset="1" stopColor="#F28C28" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g clipPath="url(#india-clip)">
          <rect data-dots width={W} height={H} fill="url(#india-dots)" opacity="0.38" />
          <rect width={W} height={H} fill="url(#india-glow)" />
        </g>
        <path d={OUTLINE_D} fill="rgba(255,255,255,0.04)" stroke="none" />
        {ISLANDS.map((isl, i) => (
          <polyline key={i} points={isl.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0.1 4" />
        ))}
        <path data-outline d={OUTLINE_D} pathLength={1} strokeDasharray={1} strokeDashoffset={0} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.1" strokeLinejoin="round" />

        {routes.map((r) => (
          <g key={r.id}>
            <path d={r.d} fill="none" stroke={r.bus ? '#9CC4FF' : '#F28C28'} strokeOpacity="0.22" strokeWidth="3.5" strokeLinecap="round" />
            <path
              data-route d={r.d} pathLength={1} strokeDasharray={1} strokeDashoffset={0} fill="none"
              stroke={r.bus ? '#9CC4FF' : '#F28C28'} strokeWidth="1.6" strokeLinecap="round"
            />
            {!still && (
              <circle r="2.2" fill={r.bus ? '#DCEBFF' : '#FFD7A8'}>
                <animateMotion dur={r.bus ? '3.4s' : '4.6s'} repeatCount="indefinite" path={r.d} begin={r.bus ? '2.4s' : '2.8s'} />
              </circle>
            )}
          </g>
        ))}

        {cities.map((c) => {
          const x = px(c.lon), y = py(c.lat)
          const fill = office(c.key) ? '#F28C28' : '#9CC4FF'
          const tx = c.side === 'l' ? x - 9 : x + 9
          return (
            <g key={c.key} data-city>
              {office(c.key) && !still && (
                <circle cx={x} cy={y} r="4" fill={fill} opacity="0.4">
                  <animate attributeName="r" values="4;13" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={office(c.key) ? 3.6 : 2.8} fill={fill} stroke="#101010" strokeWidth="1" />
              <text
                x={tx} y={y + (c.dy ?? 3)} textAnchor={c.side === 'l' ? 'end' : 'start'} fill="#fff" fontSize="7.5"
                letterSpacing="0.6" fontFamily="var(--font-mono), monospace" paintOrder="stroke" stroke="#101010" strokeWidth="2.2"
              >
                {c.label.toUpperCase()}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-white/80">
        <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-[#F28C28]" />KTC offices</span>
        <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="inline-block h-0.5 w-5 rounded bg-[#9CC4FF]" />Radhe Travels routes</span>
      </figcaption>
    </figure>
  )
}
