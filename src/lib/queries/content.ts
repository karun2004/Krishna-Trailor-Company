import { check, getDb } from './db'
import { resolveMedia, resolveMediaMap, withMedia } from './media'
import type {
  ClientLogo, Division, Faq, FleetItem, GalleryAlbum, GalleryAlbumWithMedia, GalleryItem, Milestone,
  Office, PageBlock, Project, ProjectImage, ProjectWithImages, QueryOpts, Seo, Service, Testimonial,
  WithMedia,
} from './types'

const BASE = 'id, sort_order'
const ord = { ascending: true } as const

export async function getDivision(slug: string, opts?: QueryOpts): Promise<WithMedia<Division> | null> {
  const db = await getDb(opts)
  const { data, error } = await db
    .from('business_divisions')
    .select(`${BASE}, slug, name, tagline, summary, description, cta_label, cta_href, hero_media_id`)
    .eq('published', true).eq('slug', slug).maybeSingle()
  if (error) throw new Error(`divisions read failed: ${error.message}`)
  if (!data) return null
  return { ...(data as Division), media: await resolveMedia(db, (data as Division).hero_media_id) }
}

export async function getServices(
  opts?: QueryOpts & { divisionId?: string; featured?: boolean; limit?: number },
): Promise<WithMedia<Service>[]> {
  const db = await getDb(opts)
  let q = db.from('services')
    .select(`${BASE}, slug, name, category, summary, description, featured, seo_title, seo_description, division_id, main_media_id`)
    .eq('published', true).order('sort_order', ord)
  if (opts?.divisionId) q = q.eq('division_id', opts.divisionId)
  if (opts?.featured !== undefined) q = q.eq('featured', opts.featured)
  if (opts?.limit) q = q.limit(opts.limit)
  return withMedia(db, check<Service[]>(await q, 'services'), 'main_media_id')
}

export async function getFleetItems(
  opts?: QueryOpts & { category?: string; divisionId?: string; featured?: boolean; limit?: number },
): Promise<WithMedia<FleetItem>[]> {
  const db = await getDb(opts)
  let q = db.from('fleet_items')
    .select(`${BASE}, slug, name, category, description, specifications, capacity, availability_status, featured, division_id, main_media_id`)
    .eq('published', true).order('sort_order', ord)
  if (opts?.category) q = q.eq('category', opts.category)
  if (opts?.divisionId) q = q.eq('division_id', opts.divisionId)
  if (opts?.featured !== undefined) q = q.eq('featured', opts.featured)
  if (opts?.limit) q = q.limit(opts.limit)
  return withMedia(db, check<FleetItem[]>(await q, 'fleet_items'), 'main_media_id')
}

export async function getProjects(
  opts?: QueryOpts & { divisionId?: string; featured?: boolean; limit?: number },
): Promise<ProjectWithImages[]> {
  const db = await getDb(opts)
  let q = db.from('projects')
    .select(`${BASE}, slug, title, location, description, service_category, project_date, featured, division_id, featured_media_id`)
    .eq('published', true).order('sort_order', ord)
  if (opts?.divisionId) q = q.eq('division_id', opts.divisionId)
  if (opts?.featured !== undefined) q = q.eq('featured', opts.featured)
  if (opts?.limit) q = q.limit(opts.limit)
  const projects = await withMedia(db, check<Project[]>(await q, 'projects'), 'featured_media_id')
  if (projects.length === 0) return []
  const imgRows = check<(ProjectImage & { project_id: string })[]>(
    await db.from('project_images')
      .select('id, project_id, phase, caption, sort_order, media_id')
      .in('project_id', projects.map((p) => p.id))
      .not('media_id', 'is', null)
      .order('sort_order', ord),
    'project_images',
  )
  const mediaMap = await resolveMediaMap(db, imgRows.map((i) => i.media_id))
  return projects.map((p) => ({
    ...p,
    images: imgRows
      .filter((i) => i.project_id === p.id)
      .map((i) => ({ ...i, media: mediaMap.get(i.media_id) ?? null })),
  }))
}

export async function getGalleryAlbums(opts?: QueryOpts & { divisionId?: string }): Promise<GalleryAlbumWithMedia[]> {
  const db = await getDb(opts)
  let q = db.from('gallery_albums')
    .select(`${BASE}, slug, title, description, division_id, cover_media_id`)
    .eq('published', true).order('sort_order', ord)
  if (opts?.divisionId) q = q.eq('division_id', opts.divisionId)
  const albums = await withMedia(db, check<GalleryAlbum[]>(await q, 'gallery_albums'), 'cover_media_id')
  if (albums.length === 0) return []
  const rows = check<(GalleryItem & { album_id: string })[]>(
    await db.from('gallery_album_media')
      .select('id, album_id, caption, sort_order, media_id')
      .in('album_id', albums.map((a) => a.id))
      .not('media_id', 'is', null)
      .order('sort_order', ord),
    'gallery_album_media',
  )
  const mediaMap = await resolveMediaMap(db, rows.map((r) => r.media_id))
  return albums.map((a) => ({
    ...a,
    items: rows.filter((r) => r.album_id === a.id).map((r) => ({ ...r, media: mediaMap.get(r.media_id) ?? null })),
  }))
}

export async function getTimeline(opts?: QueryOpts): Promise<WithMedia<Milestone>[]> {
  const db = await getDb(opts)
  const q = db.from('timeline_milestones')
    .select(`${BASE}, year, title, description, media_id`).eq('published', true).order('sort_order', ord)
  return withMedia(db, check<Milestone[]>(await q, 'timeline_milestones'), 'media_id')
}

/** Returns [] when nothing is published: callers omit the whole section. */
export async function getTestimonials(opts?: QueryOpts): Promise<Testimonial[]> {
  const db = await getDb(opts)
  return check<Testimonial[]>(
    await db.from('testimonials')
      .select(`${BASE}, author_name, author_role, company, quote, division_id`)
      .eq('published', true).eq('approved', true).order('sort_order', ord),
    'testimonials',
  )
}

export async function getFaqs(divisionId?: string, opts?: QueryOpts): Promise<Faq[]> {
  const db = await getDb(opts)
  let q = db.from('faqs').select(`${BASE}, question, answer, division_id`).eq('published', true).order('sort_order', ord)
  if (divisionId) q = q.eq('division_id', divisionId)
  return check<Faq[]>(await q, 'faqs')
}

/** Returns [] when nothing is published: callers omit the whole section. */
export async function getClientLogos(opts?: QueryOpts): Promise<WithMedia<ClientLogo>[]> {
  const db = await getDb(opts)
  const q = db.from('client_logos')
    .select(`${BASE}, name, website_url, media_id`).eq('published', true).order('sort_order', ord)
  return withMedia(db, check<ClientLogo[]>(await q, 'client_logos'), 'media_id')
}

export async function getOffices(opts?: QueryOpts): Promise<Office[]> {
  const db = await getDb(opts)
  return check<Office[]>(
    await db.from('office_locations')
      .select(`${BASE}, name, address, phone, email, is_head_office, map_url, division_id`)
      .eq('published', true).order('sort_order', ord),
    'office_locations',
  )
}

export async function getSiteSettings(opts?: QueryOpts): Promise<Record<string, unknown>> {
  const db = await getDb(opts)
  const rows = check<{ key: string; value: unknown }[]>(await db.from('site_settings').select('key, value'), 'site_settings')
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

export async function getPageContent(pageKey: string, opts?: QueryOpts): Promise<Record<string, PageBlock>> {
  const db = await getDb(opts)
  const rows = check<{ block_key: string; content: unknown; media_id: string | null }[]>(
    await db.from('page_content').select('block_key, content, media_id')
      .eq('published', true).eq('page_key', pageKey).order('sort_order', ord),
    'page_content',
  )
  const mediaMap = await resolveMediaMap(db, rows.map((r) => r.media_id))
  return Object.fromEntries(
    rows.map((r) => [r.block_key, { content: r.content, media: (r.media_id && mediaMap.get(r.media_id)) || null }]),
  )
}

export async function getSeo(pageKey: string, opts?: QueryOpts): Promise<Seo | null> {
  const db = await getDb(opts)
  const { data, error } = await db.from('seo_metadata')
    .select('page_key, slug, title, meta_description, canonical_url, og_media_id')
    .eq('published', true).eq('page_key', pageKey).maybeSingle()
  if (error) throw new Error(`seo_metadata read failed: ${error.message}`)
  if (!data) return null
  const { og_media_id, ...rest } = data as Omit<Seo, 'og_media'> & { og_media_id: string | null }
  return { ...rest, og_media: await resolveMedia(db, og_media_id) }
}
