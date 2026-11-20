'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from './cn'
import { isActive, NAV_LINKS } from './nav-links'

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => { setOpen(false); toggleRef.current?.focus() }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const drawer = drawerRef.current
    const items = () => Array.from(drawer?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    items()[0]?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab') return
      const els = items()
      if (!els.length) return
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      else if (!drawer?.contains(document.activeElement)) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, close])

  const linkCls = (href: string) =>
    cn('font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]',
      isActive(pathname, href) && 'text-[var(--accent)]')

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 text-black backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Link href="/" className="font-display text-lg font-extrabold uppercase tracking-tight" aria-label="Krishna Trailor Company home">KTC</Link>
          <nav aria-label="Primary" className="hidden items-center gap-4 md:flex lg:gap-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={linkCls(l.href)} aria-current={isActive(pathname, l.href) ? 'page' : undefined}>{l.label}</Link>
            ))}
          </nav>
          <button
            ref={toggleRef} type="button" aria-expanded={open} aria-controls="site-drawer" aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full font-mono text-xs uppercase tracking-widest md:hidden"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      {open && (
        <div id="site-drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-label="Site menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-black text-white md:hidden">
          <nav aria-label="Mobile" className="flex flex-col px-5 py-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                aria-current={isActive(pathname, l.href) ? 'page' : undefined}
                className="border-b border-white/15 py-4 font-display text-2xl font-bold uppercase tracking-tight hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <Link href="/contact"
        className="fixed bottom-5 right-5 z-30 inline-flex min-h-11 items-center rounded-full bg-black px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-white shadow-xl ring-1 ring-white/30 transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
        Get a Quote
      </Link>
    </>
  )
}
