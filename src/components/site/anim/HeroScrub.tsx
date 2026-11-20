'use client'
import { useRef } from 'react'
import { useScrollMotion } from '@/lib/motion'
import { cn } from '../cn'

export type HeroScrubProps = {
  /** Pre-rendered vehicle image (server-rendered MediaImage). Null renders the ghost-headline-only hero. */
  vehicle: React.ReactNode | null
  /** Headline, label and CTAs. */
  children: React.ReactNode
  className?: string
}

/**
 * Hero where the vehicle crosses the outlined ghost headline as the user scrolls.
 * Desktop (md+): the section pins and the vehicle is scrubbed across. Below md: unpinned, lighter drift.
 * Static (no scrub, no pin) under reduced motion or when JS fails; only transform is animated.
 */
export function HeroScrub({ vehicle, children, className }: HeroScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  useScrollMotion(ref, ({ gsap }) => {
    const root = ref.current
    const car = root?.querySelector<HTMLElement>('[data-hero-vehicle]')
    if (!root || !car) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      gsap.fromTo(car, { xPercent: 0 }, {
        xPercent: -75, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: '+=85%', scrub: 0.6, pin: true, anticipatePin: 1 },
      })
    })
    mm.add('(max-width: 767px)', () => {
      gsap.fromTo(car, { xPercent: 0 }, {
        xPercent: -25, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    })
  })
  return (
    <div ref={ref} data-hero-scrub className={cn('relative min-h-[88svh] w-full md:min-h-svh', className)}>
      {vehicle ? (
        <div data-hero-vehicle className="pointer-events-none absolute right-0 top-[18%] z-0 w-[85%] will-change-transform md:top-[14%] md:w-[62%]">
          {vehicle}
        </div>
      ) : null}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/30 to-transparent" aria-hidden="true" />
      <div className="relative z-[2] mx-auto flex min-h-[88svh] w-full max-w-7xl flex-col justify-end px-5 pb-16 pt-32 md:min-h-svh md:px-8">{children}</div>
    </div>
  )
}
