/** Integration tests for the published-content query layer (local Supabase). Self-contained fixtures, swept in afterAll. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { anonClient, serviceClient } from '../../../../tests/support/db'
import {
  getClientLogos, getDivision, getFaqs, getFleetItems, getGalleryAlbums, getOffices, getPageContent,
  getProjects, getSeo, getServices, getSiteSettings, getTestimonials, getTimeline, resolveMedia,
} from '..'

const run = crypto.randomUUID().slice(0, 8)
const mk = (s: string) => `q-${run}-${s}`
const svc = serviceClient()
const opts = { client: anonClient() }

let divId: string
let mediaId: string
let deadMediaId: string
const projectIds: string[] = []
const albumIds: string[] = []

async function ins<T = { id: string }>(table: string, row: Record<string, unknown>): Promise<T> {
  const { data, error } = await svc.from(table).insert(row).select().single()
  if (error) throw new Error(`${table}: ${error.message}`)
  return data as T
}

beforeAll(async () => {
  divId = (await ins('business_divisions', { slug: mk('div'), name: 'D', published: true })).id
  await ins('business_divisions', { slug: mk('draftdiv'), name: 'Draft', published: false })
  mediaId = (await ins('media_assets', { storage_path: mk('m.jpg'), alt: 'alt-m', category: 'other', mime_type: 'image/jpeg', width: 800, height: 600 })).id
  deadMediaId = (await ins('media_assets', { storage_path: mk('dead.jpg'), category: 'other', mime_type: 'image/jpeg' })).id
})

afterAll(async () => {
  for (const t of ['services', 'fleet_items', 'projects', 'gallery_albums', 'testimonials', 'faqs', 'client_logos', 'timeline_milestones']) {
    const col = { projects: 'slug', services: 'slug', fleet_items: 'slug', gallery_albums: 'slug', testimonials: 'author_name', faqs: 'question', client_logos: 'name', timeline_milestones: 'title' }[t]!
    await svc.from(t).delete().like(col, `q-${run}-%`)
  }
  await svc.from('office_locations').delete().like('name', `q-${run}-%`)
  await svc.from('page_content').delete().like('page_key', `q-${run}-%`)
  await svc.from('seo_metadata').delete().like('page_key', `q-${run}-%`)
  await svc.from('site_settings').delete().like('key', `q-${run}-%`)
  await svc.from('business_divisions').delete().like('slug', `q-${run}-%`)
  await svc.from('media_assets').delete().like('storage_path', `q-${run}-%`)
})

describe('query layer', () => {
  it('getDivision returns published only, with resolved hero media', async () => {
    await svc.from('business_divisions').update({ hero_media_id: mediaId }).eq('id', divId)
    const d = await getDivision(mk('div'), opts)
    expect(d?.name).toBe('D')
    expect(d?.media).toMatchObject({ alt: 'alt-m', width: 800, height: 600 })
    expect(d?.media?.url).toContain(mk('m.jpg'))
    expect(await getDivision(mk('draftdiv'), opts)).toBeNull()
  })

  it('services: published only, ordered, division filter', async () => {
    await ins('services', { name: 'B', slug: mk('s2'), published: true, sort_order: 2, division_id: divId })
    await ins('services', { name: 'A', slug: mk('s1'), published: true, sort_order: 1, division_id: divId })
    await ins('services', { name: 'Draft', slug: mk('s3'), published: false, division_id: divId })
    const rows = await getServices({ ...opts, divisionId: divId })
    expect(rows.map((r) => r.name)).toEqual(['A', 'B'])
  })

  it('fleet: category filter, published only', async () => {
    await ins('fleet_items', { name: 'T', slug: mk('f1'), category: 'cranes', published: true, division_id: divId })
    await ins('fleet_items', { name: 'U', slug: mk('f2'), category: 'forklifts', published: true, division_id: divId })
    await ins('fleet_items', { name: 'V', slug: mk('f3'), category: 'cranes', published: false, division_id: divId })
    const rows = await getFleetItems({ ...opts, category: 'cranes', divisionId: divId })
    expect(rows.map((r) => r.name)).toEqual(['T'])
  })

  // Review Focus 4: dangling media reference
  it('null media_id resolves to null without throwing', async () => {
    await ins('services', { name: 'NoImg', slug: mk('s4'), published: true, division_id: divId })
    const rows = await getServices({ ...opts, divisionId: divId })
    expect(rows.find((r) => r.name === 'NoImg')?.media).toBeNull()
  })

  it('a deleted asset resolves to null and the row still renders', async () => {
    const p = await ins('projects', { title: 'P', slug: mk('p1'), published: true, featured_media_id: deadMediaId, division_id: divId })
    projectIds.push(p.id)
    await svc.from('media_assets').delete().eq('id', deadMediaId)
    expect(await resolveMedia(opts.client, deadMediaId)).toBeNull()
    const rows = await getProjects({ ...opts, divisionId: divId })
    expect(rows).toHaveLength(1)
    expect(rows[0].media).toBeNull()
  })

  it('project images: null-media rows filtered, ordered, drafts hidden', async () => {
    const [p] = await getProjects({ ...opts, divisionId: divId })
    const m2 = await ins('media_assets', { storage_path: mk('m2.jpg'), category: 'projects', mime_type: 'image/jpeg' })
    await ins('project_images', { project_id: p.id, media_id: mediaId, phase: 'before', sort_order: 2 })
    await ins('project_images', { project_id: p.id, media_id: m2.id, phase: 'after', sort_order: 1 })
    await ins('project_images', { project_id: p.id, media_id: null, phase: 'during', sort_order: 0 })
    const [again] = await getProjects({ ...opts, divisionId: divId })
    expect(again.images.map((i) => i.phase)).toEqual(['after', 'before'])
    expect(again.images.every((i) => i.media !== null)).toBe(true)
    await ins('projects', { title: 'Draft', slug: mk('p2'), published: false, division_id: divId })
    expect(await getProjects({ ...opts, divisionId: divId })).toHaveLength(1)
  })

  it('gallery albums: null-media items filtered', async () => {
    const a = await ins('gallery_albums', { title: 'A', slug: mk('g1'), published: true })
    albumIds.push(a.id)
    await ins('gallery_album_media', { album_id: a.id, media_id: mediaId, sort_order: 1 })
    await ins('gallery_album_media', { album_id: a.id, media_id: null, sort_order: 0 })
    const mine = (await getGalleryAlbums(opts)).find((x) => x.id === a.id)
    expect(mine?.items).toHaveLength(1)
    expect(mine?.items[0].media?.alt).toBe('alt-m')
  })

  it('timeline, faqs, offices, page content, seo, settings', async () => {
    await ins('timeline_milestones', { year: '1987', title: mk('t1'), published: true })
    await ins('timeline_milestones', { year: '2000', title: mk('t2'), published: false })
    expect((await getTimeline(opts)).filter((t) => t.title.startsWith(`q-${run}`))).toHaveLength(1)

    await ins('faqs', { question: mk('q1'), answer: 'a', published: true, division_id: divId })
    await ins('faqs', { question: mk('q2'), answer: 'a', published: false, division_id: divId })
    expect((await getFaqs(divId, opts)).map((f) => f.question)).toEqual([mk('q1')])

    await ins('office_locations', { name: mk('o1'), published: true })
    await ins('office_locations', { name: mk('o2'), published: false })
    expect((await getOffices(opts)).filter((o) => o.name.startsWith(`q-${run}`)).map((o) => o.name)).toEqual([mk('o1')])

    await ins('page_content', { page_key: mk('home'), block_key: 'hero', content: { h: 1 }, media_id: mediaId, published: true })
    await ins('page_content', { page_key: mk('home'), block_key: 'draft', content: {}, published: false })
    const blocks = await getPageContent(mk('home'), opts)
    expect(Object.keys(blocks)).toEqual(['hero'])
    expect(blocks.hero.media?.alt).toBe('alt-m')

    await ins('seo_metadata', { page_key: mk('home'), title: 'T', og_media_id: mediaId, published: true })
    expect((await getSeo(mk('home'), opts))?.og_media?.alt).toBe('alt-m')
    await ins('seo_metadata', { page_key: mk('draft'), title: 'T', published: false })
    expect(await getSeo(mk('draft'), opts)).toBeNull()

    await ins('site_settings', { key: mk('phone'), value: '123' })
    expect((await getSiteSettings(opts))[mk('phone')]).toBe('123')
  })

  // Review Focus 5: entirely unpublished section
  it('getTestimonials returns [] when all are unpublished', async () => {
    // Other agents' seed rows may exist; assert on our own rows being excluded and, if the table has no
    // published rows at all, that the result is exactly [].
    await ins('testimonials', { author_name: mk('a1'), quote: 'q', published: false })
    await ins('testimonials', { author_name: mk('a2'), quote: 'q', published: false })
    const all = await getTestimonials(opts)
    expect(all.some((t) => t.author_name.startsWith(`q-${run}`))).toBe(false)
    const { count } = await svc.from('testimonials').select('*', { count: 'exact', head: true }).eq('published', true)
    if (count === 0) expect(all).toEqual([])
  })

  it('getClientLogos returns only published, [] when none', async () => {
    await ins('client_logos', { name: mk('c1'), published: false })
    const all = await getClientLogos(opts)
    expect(all.some((c) => c.name.startsWith(`q-${run}`))).toBe(false)
    await ins('client_logos', { name: mk('c2'), published: true, media_id: mediaId })
    const after = await getClientLogos(opts)
    expect(after.find((c) => c.name === mk('c2'))?.media?.alt).toBe('alt-m')
  })
})
