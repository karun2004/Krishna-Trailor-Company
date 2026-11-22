import Image from 'next/image'
import Link from 'next/link'
import { getOffices, getSiteSettings } from '@/lib/queries'
import { buildFooterData, type FooterData } from './footer-data'
import { NAV_LINKS } from './nav-links'
import { SectionShell } from './SectionShell'
import { MonoLabel } from './MonoLabel'

const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`

export async function SiteFooter() {
  let data: FooterData = { offices: [], phones: [] }
  try {
    const [settings, offices] = await Promise.all([getSiteSettings(), getOffices()])
    data = buildFooterData(settings, offices)
  } catch {
    // Footer degrades to links only; never take the page down.
  }
  const year = new Date().getFullYear()
  return (
    <SectionShell as="footer" variant="black" className="!py-16">
      <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1.4fr]">
        <div>
          <Image src="/logos/ktc-logo.jpeg" alt={data.companyName ?? 'Krishna Trailor Company'} width={2536} height={910} sizes="260px" className="h-auto w-64 rounded-lg bg-white p-2" />
        </div>
        <nav aria-label="Footer">
          <MonoLabel className="mb-4">Explore</MonoLabel>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="inline-block py-1 text-sm text-white/80 hover:text-[var(--accent)]">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        {(data.offices.length > 0 || data.phones.length > 0 || data.email) && (
          <div>
            <MonoLabel className="mb-4">Contact</MonoLabel>
            <div className="space-y-6 text-sm text-white/80">
              {data.offices.map((o) => (
                <address key={o.name} className="not-italic" data-office={o.isHead ? 'head' : undefined}>
                  <p className="font-semibold text-white">{o.name}</p>
                  {o.address && <p>{o.address}</p>}
                  {o.phone && <p><a href={tel(o.phone)} className="inline-block py-1 hover:text-[var(--accent)]">{o.phone}</a></p>}
                  {o.email && <p><a href={`mailto:${o.email}`} className="inline-block py-1 hover:text-[var(--accent)]">{o.email}</a></p>}
                  {o.mapUrl && <p><a href={o.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-1 underline">Map</a></p>}
                </address>
              ))}
              {(data.phones.length > 0 || (data.email && data.offices.every((o) => o.email !== data.email))) && (
                <ul className="space-y-1">
                  {data.phones.map((p) => (
                    <li key={p.number}>{p.name ? `${p.name}: ` : ''}<a href={tel(p.number)} className="inline-block py-1 hover:text-[var(--accent)]">{p.number}</a></li>
                  ))}
                  {data.email && data.offices.every((o) => o.email !== data.email) && (
                    <li><a href={`mailto:${data.email}`} className="inline-block py-1 hover:text-[var(--accent)]">{data.email}</a></li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="mt-14 border-t border-white/15 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
        © {year} {data.companyName ?? 'Krishna Trailor Company'}
      </p>
    </SectionShell>
  )
}
