'use client'
import { useEffect, type RefObject } from 'react'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export type MotionKit = { gsap: typeof import('gsap').gsap; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }

/**
 * Runs `setup` with gsap + ScrollTrigger scoped to `scope` after mount; reverts everything on unmount.
 * No-ops entirely (setup never called, gsap never loaded) when the user prefers reduced motion,
 * so server-rendered content stays in its final, visible state.
 */
export function useScrollMotion(scope: RefObject<HTMLElement | null>, setup: (kit: MotionKit) => void, deps: unknown[] = []) {
  useEffect(() => {
    if (!scope.current || prefersReducedMotion()) return
    let cancelled = false
    let revert: (() => void) | undefined
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
      if (cancelled || !scope.current) return
      const { gsap } = g
      const { ScrollTrigger } = st
      gsap.registerPlugin(ScrollTrigger)
      const ctx = gsap.context(() => setup({ gsap, ScrollTrigger }), scope)
      revert = () => ctx.revert()
    })
    return () => {
      cancelled = true
      revert?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
