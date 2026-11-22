'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export const ADMIN_SECTIONS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/page-images', label: 'Page images' },
  { href: '/admin/sections', label: 'Sections' },
  { href: '/admin/divisions', label: 'Divisions' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/fleet', label: 'Fleet' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/timeline', label: 'Timeline' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/faqs', label: 'FAQs' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/offices', label: 'Offices' },
  { href: '/admin/homepage', label: 'Homepage' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/seo', label: 'SEO' },
  { href: '/admin/enquiries', label: 'Enquiries' },
] as const

/**
 * Fixed sidebar at >= md; below md a drawer opened by the header toggle.
 * Escape closes the drawer and returns focus to the toggle.
 */
export function Sidebar({ signOut, email }: { signOut: () => Promise<void>; email: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => {
    setOpen(false)
    toggleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-navy/10 bg-white px-4 md:pl-64">
        <div className="flex items-center gap-3">
          <button
            ref={toggleRef}
            type="button"
            aria-label="Navigation menu"
            aria-expanded={open}
            aria-controls="admin-nav"
            onClick={() => setOpen((o) => !o)}
            className="rounded p-2 text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange md:hidden"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <span className="font-display text-base font-extrabold uppercase text-black md:hidden">KTC Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-black/70 sm:inline">{email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded border border-navy/20 px-3 py-1.5 text-sm font-medium text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {open && (
        <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={close} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-black text-white transition-transform md:z-40 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full invisible md:visible'
        }`}
      >
        <div className="flex h-14 items-center gap-2 px-5 font-display text-xl font-extrabold uppercase tracking-tight">KTC <span className="font-mono text-[10px] font-medium tracking-[0.18em] text-orange">Admin</span></div>
        <nav id="admin-nav" aria-label="Admin sections" className="px-3 pb-6">
          <ul className="space-y-1">
            {ADMIN_SECTIONS.map(({ href, label }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`block rounded-full px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] focus-visible:outline-2 focus-visible:outline-orange ${
                      active ? 'bg-orange text-black' : 'text-white/85 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
