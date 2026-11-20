'use client'
import { useRef } from 'react'
import { useScrollMotion } from '@/lib/motion'

export type RevealProps = {
  children: React.ReactNode
  as?: 'div' | 'section' | 'li' | 'article' | 'p' | 'span'
  /** Seconds. */
  delay?: number
  /** Start offset in px. */
  y?: number
  className?: string
}

/** Fades/slides children in on scroll. Content is fully visible with reduced motion or before JS runs. */
export function Reveal({ children, as: Tag = 'div', delay = 0, y = 28, className }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  useScrollMotion(ref, ({ gsap }) => {
    gsap.from(ref.current, {
      autoAlpha: 0, y, duration: 0.8, delay, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
    })
  })
  const T = Tag as React.ElementType
  return <T ref={ref} className={className}>{children}</T>
}
