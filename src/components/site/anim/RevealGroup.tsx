'use client'
import { useRef } from 'react'
import { useScrollMotion } from '@/lib/motion'

export type RevealGroupProps = {
  children: React.ReactNode
  as?: 'div' | 'ul' | 'ol' | 'section'
  /** Seconds between children. */
  stagger?: number
  /** Start offset in px. */
  y?: number
  className?: string
}

/**
 * Staggers its direct children in on scroll. Server HTML is fully visible; the hidden "from" state is
 * applied by GSAP only after mount, and cleared when done so CSS hover transforms keep working.
 */
export function RevealGroup({ children, as: Tag = 'div', stagger = 0.07, y = 20, className }: RevealGroupProps) {
  const ref = useRef<HTMLElement>(null)
  useScrollMotion(ref, ({ gsap }) => {
    const items = ref.current ? Array.from(ref.current.children) : []
    if (!items.length) return
    gsap.from(items, {
      autoAlpha: 0, y, duration: 0.7, stagger, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
    })
  })
  const T = Tag as React.ElementType
  return <T ref={ref} className={className}>{children}</T>
}
