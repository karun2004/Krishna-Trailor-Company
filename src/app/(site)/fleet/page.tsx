import { Button, Card, GhostHeadline, MediaImage, MonoLabel, SectionShell } from '@/components/site'
import { CtaBlock } from '@/components/site/pages/CtaBlock'
import { pageMetadata } from '@/components/site/pages/seo'
import { getFleetItems } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const generateMetadata = () => pageMetadata('fleet', 'Our Fleet')

const label = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())

function specRows(spec: Record<string, unknown>): [string, string][] {
  return Object.entries(spec ?? {})
    .filter(([, v]) => ['string', 'number'].includes(typeof v) && String(v).trim() !== '')
    .map(([k, v]) => [label(k), String(v)])
}

export default async function FleetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const sp = await searchParams
  const all = await getFleetItems()
  const categories = [...new Set(all.map((i) => i.category))]
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category
  const active = raw && categories.includes(raw) ? raw : null
  const items = active ? all.filter((i) => i.category === active) : all

  return (
    <>
      <SectionShell variant="black">
        <MonoLabel index={1}>Fleet</MonoLabel>
        <GhostHeadline as="h1" on="dark" className="mt-6">Our Fleet</GhostHeadline>
      </SectionShell>

      {all.length === 0 ? (
        <CtaBlock label="Fleet" title="Fleet details coming soon" body="We are preparing our fleet listing. Contact us for current equipment and availability." />
      ) : (
        <SectionShell variant="white" labelledBy="fleet-h">
          <h2 id="fleet-h" className="sr-only">Fleet items</h2>
          {categories.length > 1 && (
            <nav aria-label="Fleet categories" className="mb-8 flex flex-wrap gap-2">
              {[null, ...categories].map((c) => (
                <Button key={c ?? 'all'} href={c ? `/fleet?category=${c}` : '/fleet'} variant={c === active ? 'dark' : 'outline'} aria-current={c === active ? 'page' : undefined}>
                  {c ? label(c) : 'All'}
                </Button>
              ))}
            </nav>
          )}
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((i) => {
              const rows = specRows(i.specifications)
              if (i.capacity) rows.unshift(['Capacity', i.capacity])
              return (
                <Card key={i.id} as="li" variant="soft" padded={false}>
                  {i.media && <MediaImage media={i.media} aspect="4/3" sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" />}
                  <div className="p-6">
                    <p className="font-mono text-xs uppercase tracking-wider text-black/60">{label(i.category)}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold uppercase tracking-tight">{i.name}</h3>
                    {i.description && <p className="mt-3 text-sm text-black/70">{i.description}</p>}
                    {rows.length > 0 && (
                      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="font-mono text-xs uppercase text-black/60">{k}</dt><dd>{v}</dd></div>))}
                      </dl>
                    )}
                  </div>
                </Card>
              )
            })}
          </ul>
        </SectionShell>
      )}
      {all.length > 0 && <CtaBlock label="Enquire" title="Need equipment for your project?" body="Contact us for availability and specifications." />}
    </>
  )
}
