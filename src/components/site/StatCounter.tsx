'use client'
import { useRef } from 'react'
import { useScrollMotion } from '@/lib/motion'

export type StatCounterProps = {
  value: number
  prefix?: string
  suffix?: string
  /** Seconds. */
  duration?: number
  /** Thousands grouping (en-IN); disable for years. Default true. */
  grouping?: boolean
  className?: string
}

/** Counts up on scroll. Server-renders (and keeps, under reduced motion) the final value. */
export function StatCounter({ value, prefix = '', suffix = '', duration = 1.6, grouping = true, className }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = (n: number) => `${prefix}${Math.round(n).toLocaleString('en-IN', { useGrouping: grouping })}${suffix}`
  useScrollMotion(ref, ({ gsap }) => {
    const state = { n: 0 }
    if (ref.current) ref.current.textContent = fmt(0)
    gsap.to(state, {
      n: value, duration, ease: 'power2.out',
      onUpdate: () => { if (ref.current) ref.current.textContent = fmt(state.n) },
      onComplete: () => { if (ref.current) ref.current.textContent = fmt(value) },
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
    })
  }, [value])
  return <span ref={ref} className={className}>{fmt(value)}</span>
}
