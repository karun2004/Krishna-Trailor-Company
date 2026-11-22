import type { Metadata } from 'next'
import {
  getDivision, getFaqs, getFleetItems, getPageContent, getProjects, getSeo, getServices, getSiteSettings,
} from '@/lib/queries'
import { getSlots, withFallback } from '@/lib/queries/slots'
import { FLEET_FALLBACK, SERVICE_FALLBACK } from '@/lib/media-slots'

export type DivisionKey = 'krishna' | 'haulage' | 'radhe'

const CONFIG = {
  krishna: { divisionSlug: 'krishna-trailor', pageKey: 'krishna-trailor', path: '/krishna-trailor', serviceCategory: 'haulage', fleetCategories: ['tractor_pullers', 'low_bed_trailers', 'semi_bed_trailers', 'hydraulic_axle_systems'] },
  // No dedicated heavy-haulage division row: reuse krishna-trailor's haulage services and fleet categories.
  haulage: { divisionSlug: 'krishna-trailor', pageKey: 'heavy-haulage', path: '/heavy-haulage', serviceCategory: 'haulage', fleetCategories: ['tractor_pullers', 'low_bed_trailers', 'semi_bed_trailers', 'hydraulic_axle_systems'] },
  radhe: { divisionSlug: 'radhe-travels', pageKey: 'radhe-travels', path: '/radhe-travels', serviceCategory: null, fleetCategories: ['sleeper_buses', 'seater_buses'] },
} as const

const FALLBACK_META: Record<DivisionKey, { title: string; description: string }> = {
  krishna: { title: 'Krishna Trailor Company', description: 'Heavy haulage and trailer transport from Chandigarh.' },
  haulage: { title: 'Heavy Haulage | Krishna Trailor Company', description: 'Heavy haulage transport with trailers and hydraulic axle systems.' },
  radhe: { title: 'Radhe Travels', description: 'Passenger bus travel services.' },
}

export function text(v: unknown): string | undefined {
  if (typeof v === 'string' && v.trim()) return v.trim()
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    for (const k of ['text', 'body', 'content', 'value']) if (typeof o[k] === 'string' && (o[k] as string).trim()) return (o[k] as string).trim()
  }
  return undefined
}

export async function divisionMetadata(key: DivisionKey): Promise<Metadata> {
  const cfg = CONFIG[key]
  const seo = await getSeo(cfg.pageKey).catch(() => null)
  const fb = FALLBACK_META[key]
  return {
    title: seo?.title ?? fb.title,
    description: seo?.meta_description ?? fb.description,
    alternates: { canonical: seo?.canonical_url ?? cfg.path },
    ...(seo?.og_media ? { openGraph: { images: [{ url: seo.og_media.url }] } } : {}),
  }
}

export async function loadDivisionPage(key: DivisionKey) {
  const cfg = CONFIG[key]
  const [division, content, settings] = await Promise.all([
    getDivision(cfg.divisionSlug), getPageContent(cfg.pageKey), getSiteSettings(),
  ])
  const divisionId = division?.id
  const [allServices, allFleet, faqs, projects] = await Promise.all([
    divisionId ? getServices({ divisionId }) : Promise.resolve([]),
    getFleetItems(),
    divisionId ? getFaqs(divisionId) : Promise.resolve([]),
    divisionId ? getProjects({ divisionId }) : Promise.resolve([]),
  ])
  const slot = await getSlots(cfg.pageKey)
  const heroMedia = slot('hero')
  const services = (cfg.serviceCategory ? allServices.filter((s) => s.category === cfg.serviceCategory) : allServices)
    .map((s) => ({ ...s, media: withFallback(s.media, SERVICE_FALLBACK[s.slug], s.name) }))
  const fleet = allFleet
    .filter((f) => (divisionId && f.division_id === divisionId) || (!f.division_id && (cfg.fleetCategories as readonly string[]).includes(f.category)))
    .map((f) => ({ ...f, media: withFallback(f.media, FLEET_FALLBACK[f.category], f.name) }))
  const contact = (settings.contact && typeof settings.contact === 'object' ? settings.contact : {}) as Record<string, unknown>
  const phones: { name?: string; number: string }[] = []
  const office = text(contact.office_phone)
  if (office) phones.push({ name: 'Office', number: office })
  if (Array.isArray(contact.phones)) {
    for (const p of contact.phones) {
      const n = text((p as Record<string, unknown>)?.number)
      if (n) phones.push({ name: text((p as Record<string, unknown>)?.name), number: n })
    }
  }
  return { slot, heroMedia: heroMedia ?? division?.media ?? null, division, content, services, fleet, faqs, projects, phones, intro: text(content.intro?.content) }
}
