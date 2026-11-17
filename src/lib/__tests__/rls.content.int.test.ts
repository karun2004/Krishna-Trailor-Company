/**
 * Integration tests for migration 0002_content against the LOCAL Supabase stack.
 * Run with `pnpm test:int` (excluded from the default `pnpm test`).
 *
 * "Rejected" assertions are deliberately non-vacuous: every denial is either an
 * explicit 42501 error, or a zero-affected result that is then proven by
 * re-reading the row with the service role (RLS silently filters UPDATE/DELETE).
 *
 * Cleanup: every row this file creates carries a `rls-<run>` marker in a text
 * column, and afterAll sweeps by that marker, so a failed test cannot leak rows.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  anonClient,
  createTestUser,
  serviceClient,
  type TestUser,
} from '../../../tests/support/db'

const RLS_VIOLATION = '42501'
const CHECK_VIOLATION = '23514'
const UNIQUE_VIOLATION = '23505'
const INVALID_ENUM = '22P02'

const run = crypto.randomUUID().slice(0, 8)
const mk = (s: string) => `rls-${run}-${s}`

const svc = serviceClient()
const anon = anonClient()
let admin: TestUser
let member: TestUser // authenticated, but NOT an admin

const createdMediaIds: string[] = []
const createdDivisionIds: string[] = []
const createdObjectPaths: string[] = []

// ---------------------------------------------------------------------------
// Table specs
// ---------------------------------------------------------------------------
type Spec = {
  table: string
  /** text column that carries the rls-<run> marker (used for the afterAll sweep) */
  marker: string
  /** minimal valid insert row for a given tag */
  row: (tag: string) => Record<string, unknown>
  /** columns that FK to media_assets (ON DELETE SET NULL) */
  mediaCols: string[]
  /** column that FKs to business_divisions (ON DELETE SET NULL), if any */
  divisionCol?: string
}

const publishedTables: Spec[] = [
  {
    table: 'services',
    marker: 'slug',
    row: (t) => ({ name: `Service ${t}`, slug: mk(t) }),
    mediaCols: ['main_media_id'],
    divisionCol: 'division_id',
  },
  {
    table: 'fleet_items',
    marker: 'slug',
    row: (t) => ({ name: `Fleet ${t}`, slug: mk(t), category: 'cranes' }),
    mediaCols: ['main_media_id'],
    divisionCol: 'division_id',
  },
  {
    table: 'projects',
    marker: 'slug',
    row: (t) => ({ title: `Project ${t}`, slug: mk(t) }),
    mediaCols: ['featured_media_id'],
    divisionCol: 'division_id',
  },
  {
    table: 'gallery_albums',
    marker: 'slug',
    row: (t) => ({ title: `Album ${t}`, slug: mk(t) }),
    mediaCols: ['cover_media_id'],
    divisionCol: 'division_id',
  },
  {
    table: 'timeline_milestones',
    marker: 'title',
    row: (t) => ({ year: '2000', title: mk(t) }),
    mediaCols: ['media_id'],
  },
  {
    table: 'testimonials',
    marker: 'author_name',
    row: (t) => ({ author_name: mk(t), quote: 'q' }),
    mediaCols: [],
    divisionCol: 'division_id',
  },
  {
    table: 'faqs',
    marker: 'question',
    row: (t) => ({ question: mk(t), answer: 'a' }),
    mediaCols: [],
    divisionCol: 'division_id',
  },
  {
    table: 'client_logos',
    marker: 'name',
    row: (t) => ({ name: mk(t) }),
    mediaCols: ['media_id'],
  },
  {
    table: 'office_locations',
    marker: 'name',
    row: (t) => ({ name: mk(t) }),
    mediaCols: [],
    divisionCol: 'division_id',
  },
  {
    table: 'page_content',
    marker: 'page_key',
    row: (t) => ({ page_key: mk(t), block_key: 'hero', content: { a: 1 } }),
    mediaCols: ['media_id'],
  },
  {
    table: 'seo_metadata',
    marker: 'page_key',
    row: (t) => ({ page_key: mk(t), title: 't' }),
    mediaCols: ['og_media_id'],
  },
]

const sweepOnly: Array<{ table: string; marker: string }> = [
  { table: 'enquiries', marker: 'name' },
]

// ---------------------------------------------------------------------------
// Seed helpers (service role; ground truth)
// ---------------------------------------------------------------------------
async function seedMedia(name: string): Promise<string> {
  const { data, error } = await svc
    .from('media_assets')
    .insert({ storage_path: `rls-${run}/${name}.jpg`, category: 'other', mime_type: 'image/jpeg' })
    .select('id')
    .single()
  if (error) throw new Error(`seed media: ${error.message}`)
  createdMediaIds.push(data.id)
  return data.id as string
}

async function seedDivision(name: string): Promise<string> {
  const { data, error } = await svc
    .from('business_divisions')
    .insert({ slug: mk(`div-${name}`), name })
    .select('id')
    .single()
  if (error) throw new Error(`seed division: ${error.message}`)
  createdDivisionIds.push(data.id)
  return data.id as string
}

async function seed(
  spec: Spec,
  tag: string,
  extra: Record<string, unknown> = {},
): Promise<string> {
  const { data, error } = await svc
    .from(spec.table)
    .insert({ ...spec.row(tag), ...extra })
    .select('id')
    .single()
  if (error) throw new Error(`seed ${spec.table}: ${error.message}`)
  return data.id as string
}

beforeAll(async () => {
  admin = await createTestUser({ admin: true })
  member = await createTestUser({ admin: false })
})

afterAll(async () => {
  const pattern = `rls-${run}%`
  const failures: string[] = []
  const attempt = async (label: string, p: PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await p
    if (error) failures.push(`${label}: ${error.message}`)
  }
  for (const s of [...publishedTables, ...sweepOnly]) {
    await attempt(s.table, svc.from(s.table).delete().like(s.marker, pattern))
  }
  if (createdObjectPaths.length) {
    await attempt('storage', svc.storage.from('enquiry-attachments').remove(createdObjectPaths) as never)
  }
  await attempt('media_assets', svc.from('media_assets').delete().like('storage_path', pattern))
  await attempt('business_divisions', svc.from('business_divisions').delete().like('slug', pattern))
  await admin?.remove()
  await member?.remove()
  if (failures.length) throw new Error(`teardown sweep failed: ${failures.join('; ')}`)
})

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------
async function expectDeniedInsert(client: SupabaseClient, table: string, row: object) {
  const { data, error } = await client.from(table).insert(row).select()
  expect(error, `INSERT into ${table} must raise an error`).not.toBeNull()
  expect(error?.code).toBe(RLS_VIOLATION)
  expect(data ?? []).toHaveLength(0)
}

/**
 * UPDATE and DELETE on `id` must have no effect: either an explicit 42501 (no table
 * privilege) or zero affected rows (RLS filtered) -- and the service role must
 * still see the row unchanged.
 */
async function expectNoUpdateDelete(
  client: SupabaseClient,
  table: string,
  id: string,
  patch: Record<string, unknown> = { verification_note: 'hacked' },
) {
  const col = Object.keys(patch)[0]
  const before = await svc.from(table).select(col).eq('id', id).single()
  expect(before.error).toBeNull()

  const upd = await client.from(table).update(patch).eq('id', id).select()
  if (upd.error) expect(upd.error.code).toBe(RLS_VIOLATION)
  else expect(upd.data).toHaveLength(0)

  const del = await client.from(table).delete().eq('id', id).select()
  if (del.error) expect(del.error.code).toBe(RLS_VIOLATION)
  else expect(del.data).toHaveLength(0)

  const after = await svc.from(table).select(col).eq('id', id).single()
  expect(after.error, `${table} row ${id} must still exist`).toBeNull()
  expect(after.data).toEqual(before.data)
}

/** Extra columns a row needs to be anon-visible besides published = true. */
const visibleExtra = (spec: Spec): Record<string, unknown> =>
  spec.table === 'testimonials' ? { approved: true } : {}

async function visibleTo(client: SupabaseClient, table: string, id: string) {
  const { data, error } = await client.from(table).select('id').eq('id', id)
  expect(error).toBeNull()
  return (data ?? []).length === 1
}

// ---------------------------------------------------------------------------
// Published-gated content tables
// ---------------------------------------------------------------------------
describe.each(publishedTables)('$table', (spec) => {
  it('defaults: published=false, sort_order=0, timestamps set', async () => {
    const id = await seed(spec, 'defaults')
    const { data, error } = await svc.from(spec.table).select('*').eq('id', id).single()
    expect(error).toBeNull()
    expect(data?.published).toBe(false)
    expect(data?.sort_order).toBe(0)
    expect(data?.verification_note).toBeNull()
    expect(data?.created_at).toBeTruthy()
    expect(data?.updated_at).toBeTruthy()
  })

  it('anon sees published rows, not unpublished ones (which exist)', async () => {
    const pub = await seed(spec, 'anon-pub', { published: true, ...visibleExtra(spec) })
    const unpub = await seed(spec, 'anon-unpub', { published: false })
    const truth = await svc.from(spec.table).select('id').eq('id', unpub)
    expect(truth.data).toHaveLength(1)
    expect(await visibleTo(anon, spec.table, pub)).toBe(true)
    expect(await visibleTo(anon, spec.table, unpub)).toBe(false)
  })

  it('a signed-in non-admin sees only what anon sees (published), never drafts', async () => {
    const pub = await seed(spec, 'member-pub', { published: true, ...visibleExtra(spec) })
    const unpub = await seed(spec, 'member-unpub', { published: false })
    expect(await visibleTo(member.client, spec.table, pub)).toBe(true)
    expect(await visibleTo(member.client, spec.table, unpub)).toBe(false)
  })

  it('anon cannot INSERT, UPDATE or DELETE', async () => {
    const id = await seed(spec, 'anon-write', { published: true, ...visibleExtra(spec) })
    await expectDeniedInsert(anon, spec.table, { ...spec.row('anon-ins'), published: true })
    await expectNoUpdateDelete(anon, spec.table, id)
    const none = await svc.from(spec.table).select('id').eq(spec.marker, mk('anon-ins'))
    expect(none.data).toHaveLength(0)
  })

  it('a signed-in non-admin cannot INSERT, UPDATE or DELETE', async () => {
    const id = await seed(spec, 'member-write', { published: true, ...visibleExtra(spec) })
    await expectDeniedInsert(member.client, spec.table, { ...spec.row('member-ins'), published: true })
    await expectNoUpdateDelete(member.client, spec.table, id)
    const none = await svc.from(spec.table).select('id').eq(spec.marker, mk('member-ins'))
    expect(none.data).toHaveLength(0)
  })

  it('a signed-in non-admin cannot publish an unpublished row', async () => {
    const id = await seed(spec, 'member-publish')
    await expectNoUpdateDelete(member.client, spec.table, id, { published: true })
    const after = await svc.from(spec.table).select('published').eq('id', id).single()
    expect(after.data?.published).toBe(false)
  })

  it('admin can read drafts and INSERT / UPDATE / DELETE', async () => {
    const draft = await seed(spec, 'admin-draft')
    expect(await visibleTo(admin.client, spec.table, draft)).toBe(true)

    const ins = await admin.client.from(spec.table).insert(spec.row('admin-ins')).select('id').single()
    expect(ins.error).toBeNull()
    const id = ins.data!.id as string

    const before = await svc.from(spec.table).select('updated_at').eq('id', id).single()
    await new Promise((r) => setTimeout(r, 20))
    const upd = await admin.client
      .from(spec.table)
      .update({ verification_note: 'checked', published: true })
      .eq('id', id)
      .select('verification_note,published,updated_at')
    expect(upd.error).toBeNull()
    expect(upd.data).toHaveLength(1)
    expect(upd.data![0].verification_note).toBe('checked')
    expect(upd.data![0].published).toBe(true)
    expect(new Date(upd.data![0].updated_at).getTime()).toBeGreaterThan(
      new Date(before.data!.updated_at).getTime(),
    )

    const del = await admin.client.from(spec.table).delete().eq('id', id).select()
    expect(del.error).toBeNull()
    expect(del.data).toHaveLength(1)
    const gone = await svc.from(spec.table).select('id').eq('id', id)
    expect(gone.data).toHaveLength(0)
  })

  for (const col of spec.mediaCols) {
    it(`deleting the media asset nulls ${col} and keeps the row`, async () => {
      const mediaId = await seedMedia(`fk-${spec.table}-${col}`)
      const id = await seed(spec, `fk-${col}`, { [col]: mediaId })
      const del = await svc.from('media_assets').delete().eq('id', mediaId)
      expect(del.error).toBeNull()
      const { data, error } = await svc.from(spec.table).select(`id,${col}`).eq('id', id).single()
      expect(error).toBeNull()
      expect(data).toEqual({ id, [col]: null })
    })
  }

  if (spec.divisionCol) {
    const dcol = spec.divisionCol
    it(`deleting the division nulls ${dcol} and keeps the row`, async () => {
      const divId = await seedDivision(`fk-${spec.table}`)
      const id = await seed(spec, 'fk-div', { [dcol]: divId })
      const del = await svc.from('business_divisions').delete().eq('id', divId)
      expect(del.error).toBeNull()
      const { data, error } = await svc.from(spec.table).select(`id,${dcol}`).eq('id', id).single()
      expect(error).toBeNull()
      expect(data).toEqual({ id, [dcol]: null })
    })
  }
})

// ---------------------------------------------------------------------------
// Table-specific rules
// ---------------------------------------------------------------------------
describe('slug uniqueness', () => {
  for (const spec of publishedTables.filter((s) => s.marker === 'slug')) {
    it(`${spec.table}.slug is unique`, async () => {
      await seed(spec, 'dup')
      const again = await svc.from(spec.table).insert(spec.row('dup'))
      expect(again.error?.code).toBe(UNIQUE_VIOLATION)
    })
  }

  it('page_content is unique on (page_key, block_key) but allows another block', async () => {
    const spec = publishedTables.find((s) => s.table === 'page_content')!
    await seed(spec, 'pc')
    const dup = await svc.from('page_content').insert(spec.row('pc'))
    expect(dup.error?.code).toBe(UNIQUE_VIOLATION)
    const other = await svc.from('page_content').insert({ ...spec.row('pc'), block_key: 'intro' })
    expect(other.error).toBeNull()
  })

  it('seo_metadata.page_key is unique', async () => {
    const spec = publishedTables.find((s) => s.table === 'seo_metadata')!
    await seed(spec, 'seo')
    const dup = await svc.from('seo_metadata').insert(spec.row('seo'))
    expect(dup.error?.code).toBe(UNIQUE_VIOLATION)
  })
})

describe('testimonials: anon needs published AND approved', () => {
  const spec = publishedTables.find((s) => s.table === 'testimonials')!

  it('approved defaults to false', async () => {
    const id = await seed(spec, 'appr-default')
    const { data } = await svc.from('testimonials').select('approved,published').eq('id', id).single()
    expect(data).toEqual({ approved: false, published: false })
  })

  it.each([
    { published: true, approved: true, visible: true },
    { published: true, approved: false, visible: false },
    { published: false, approved: true, visible: false },
    { published: false, approved: false, visible: false },
  ])('published=$published approved=$approved -> anon visible=$visible', async (c) => {
    const id = await seed(spec, `t-${c.published}-${c.approved}`, {
      published: c.published,
      approved: c.approved,
    })
    const truth = await svc.from('testimonials').select('id').eq('id', id)
    expect(truth.data).toHaveLength(1)
    expect(await visibleTo(anon, 'testimonials', id)).toBe(c.visible)
    expect(await visibleTo(member.client, 'testimonials', id)).toBe(c.visible)
    expect(await visibleTo(admin.client, 'testimonials', id)).toBe(true)
  })
})

describe('fleet_items category', () => {
  const spec = publishedTables.find((s) => s.table === 'fleet_items')!
  const cats = [
    'tractor_pullers',
    'low_bed_trailers',
    'semi_bed_trailers',
    'hydraulic_axle_systems',
    'cranes',
    'forklifts',
    'excavators',
    'other',
    'sleeper_buses',
    'seater_buses',
  ]
  it.each(cats)('accepts %s', async (category) => {
    const r = await svc.from('fleet_items').insert({ ...spec.row(`cat-${category}`), category })
    expect(r.error).toBeNull()
  })
  it('rejects an unknown category', async () => {
    const r = await svc.from('fleet_items').insert({ ...spec.row('cat-bad'), category: 'hovercraft' })
    expect(r.error?.code).toBe(INVALID_ENUM)
  })
  it('stores specifications as jsonb', async () => {
    const id = await seed(spec, 'specs', { specifications: { axles: 3, load_t: 40 }, capacity: 'x' })
    const { data } = await svc.from('fleet_items').select('specifications').eq('id', id).single()
    expect(data?.specifications).toEqual({ axles: 3, load_t: 40 })
  })
})

// ---------------------------------------------------------------------------
// Child tables gated through the published parent
// ---------------------------------------------------------------------------
describe('project_images (gated by the parent project)', () => {
  const projects = publishedTables.find((s) => s.table === 'projects')!
  let pubProject: string
  let draftProject: string
  let pubImage: string
  let draftImage: string

  beforeAll(async () => {
    pubProject = await seed(projects, 'pi-pub', { published: true })
    draftProject = await seed(projects, 'pi-draft', { published: false })
    const m1 = await seedMedia('pi-1')
    const m2 = await seedMedia('pi-2')
    const a = await svc
      .from('project_images')
      .insert({ project_id: pubProject, media_id: m1, phase: 'before' })
      .select('id')
      .single()
    const b = await svc
      .from('project_images')
      .insert({ project_id: draftProject, media_id: m2, phase: 'after' })
      .select('id')
      .single()
    if (a.error || b.error) throw new Error(`seed project_images: ${a.error?.message ?? b.error?.message}`)
    pubImage = a.data.id
    draftImage = b.data.id
  })

  it('anon sees an image under a published project, not under an unpublished one', async () => {
    const truth = await svc.from('project_images').select('id').eq('id', draftImage)
    expect(truth.data).toHaveLength(1)
    expect(await visibleTo(anon, 'project_images', pubImage)).toBe(true)
    expect(await visibleTo(anon, 'project_images', draftImage)).toBe(false)
  })

  it('visibility follows the parent: unpublishing hides, publishing reveals', async () => {
    await svc.from('projects').update({ published: true }).eq('id', draftProject)
    expect(await visibleTo(anon, 'project_images', draftImage)).toBe(true)
    await svc.from('projects').update({ published: false }).eq('id', draftProject)
    expect(await visibleTo(anon, 'project_images', draftImage)).toBe(false)
  })

  it('a non-admin sees the same as anon', async () => {
    expect(await visibleTo(member.client, 'project_images', pubImage)).toBe(true)
    expect(await visibleTo(member.client, 'project_images', draftImage)).toBe(false)
  })

  it('anon and non-admin cannot write', async () => {
    const row = { project_id: pubProject, phase: 'during' }
    await expectDeniedInsert(anon, 'project_images', row)
    await expectDeniedInsert(member.client, 'project_images', row)
    await expectNoUpdateDelete(anon, 'project_images', pubImage, { caption: 'hacked' })
    await expectNoUpdateDelete(member.client, 'project_images', pubImage, { caption: 'hacked' })
  })

  it('admin sees drafts and can insert/update/delete', async () => {
    expect(await visibleTo(admin.client, 'project_images', draftImage)).toBe(true)
    const ins = await admin.client
      .from('project_images')
      .insert({ project_id: draftProject, phase: 'during', sort_order: 2 })
      .select('id')
      .single()
    expect(ins.error).toBeNull()
    const upd = await admin.client.from('project_images').update({ caption: 'c' }).eq('id', ins.data!.id).select()
    expect(upd.data).toHaveLength(1)
    const del = await admin.client.from('project_images').delete().eq('id', ins.data!.id).select()
    expect(del.data).toHaveLength(1)
  })

  it('phase accepts before/during/after and rejects others', async () => {
    for (const phase of ['before', 'during', 'after']) {
      const r = await svc.from('project_images').insert({ project_id: pubProject, phase })
      expect(r.error, phase).toBeNull()
    }
    const bad = await svc.from('project_images').insert({ project_id: pubProject, phase: 'later' })
    expect(bad.error?.code).toBe(INVALID_ENUM)
  })

  it('deleting a media asset nulls media_id and keeps the image row', async () => {
    const mediaId = await seedMedia('pi-fk')
    const ins = await svc
      .from('project_images')
      .insert({ project_id: pubProject, media_id: mediaId, phase: 'after' })
      .select('id')
      .single()
    expect(ins.error).toBeNull()
    await svc.from('media_assets').delete().eq('id', mediaId)
    const { data } = await svc.from('project_images').select('id,media_id').eq('id', ins.data!.id).single()
    expect(data).toEqual({ id: ins.data!.id, media_id: null })
  })

  it('deleting the project cascades to its images', async () => {
    const pid = await seed(projects, 'pi-cascade')
    const ins = await svc.from('project_images').insert({ project_id: pid, phase: 'before' }).select('id').single()
    expect(ins.error).toBeNull()
    const del = await svc.from('projects').delete().eq('id', pid)
    expect(del.error).toBeNull()
    const left = await svc.from('project_images').select('id').eq('id', ins.data!.id)
    expect(left.data).toHaveLength(0)
  })
})

describe('gallery_album_media (gated by the parent album)', () => {
  const albums = publishedTables.find((s) => s.table === 'gallery_albums')!
  let pubAlbum: string
  let draftAlbum: string
  let pubItem: string
  let draftItem: string

  beforeAll(async () => {
    pubAlbum = await seed(albums, 'ga-pub', { published: true })
    draftAlbum = await seed(albums, 'ga-draft', { published: false })
    const a = await svc
      .from('gallery_album_media')
      .insert({ album_id: pubAlbum, media_id: await seedMedia('ga-1') })
      .select('id')
      .single()
    const b = await svc
      .from('gallery_album_media')
      .insert({ album_id: draftAlbum, media_id: await seedMedia('ga-2') })
      .select('id')
      .single()
    if (a.error || b.error) throw new Error(`seed gallery_album_media: ${a.error?.message ?? b.error?.message}`)
    pubItem = a.data.id
    draftItem = b.data.id
  })

  it('anon sees an item in a published album, not in an unpublished one', async () => {
    const truth = await svc.from('gallery_album_media').select('id').eq('id', draftItem)
    expect(truth.data).toHaveLength(1)
    expect(await visibleTo(anon, 'gallery_album_media', pubItem)).toBe(true)
    expect(await visibleTo(anon, 'gallery_album_media', draftItem)).toBe(false)
    expect(await visibleTo(member.client, 'gallery_album_media', pubItem)).toBe(true)
    expect(await visibleTo(member.client, 'gallery_album_media', draftItem)).toBe(false)
  })

  it('anon and non-admin cannot write', async () => {
    const row = { album_id: pubAlbum, media_id: await seedMedia('ga-denied') }
    await expectDeniedInsert(anon, 'gallery_album_media', row)
    await expectDeniedInsert(member.client, 'gallery_album_media', row)
    await expectNoUpdateDelete(anon, 'gallery_album_media', pubItem, { caption: 'hacked' })
    await expectNoUpdateDelete(member.client, 'gallery_album_media', pubItem, { caption: 'hacked' })
  })

  it('admin sees drafts and can insert/update/delete', async () => {
    expect(await visibleTo(admin.client, 'gallery_album_media', draftItem)).toBe(true)
    const ins = await admin.client
      .from('gallery_album_media')
      .insert({ album_id: draftAlbum, media_id: await seedMedia('ga-admin'), sort_order: 3 })
      .select('id')
      .single()
    expect(ins.error).toBeNull()
    const upd = await admin.client.from('gallery_album_media').update({ caption: 'c' }).eq('id', ins.data!.id).select()
    expect(upd.data).toHaveLength(1)
    const del = await admin.client.from('gallery_album_media').delete().eq('id', ins.data!.id).select()
    expect(del.data).toHaveLength(1)
  })

  it('the same media cannot be in an album twice', async () => {
    const mediaId = await seedMedia('ga-dup')
    const first = await svc.from('gallery_album_media').insert({ album_id: pubAlbum, media_id: mediaId })
    expect(first.error).toBeNull()
    const second = await svc.from('gallery_album_media').insert({ album_id: pubAlbum, media_id: mediaId })
    expect(second.error?.code).toBe(UNIQUE_VIOLATION)
  })

  it('deleting a media asset nulls media_id and keeps the row; deleting the album cascades', async () => {
    const mediaId = await seedMedia('ga-fk')
    const albumId = await seed(albums, 'ga-cascade')
    const ins = await svc
      .from('gallery_album_media')
      .insert({ album_id: albumId, media_id: mediaId })
      .select('id')
      .single()
    expect(ins.error).toBeNull()
    await svc.from('media_assets').delete().eq('id', mediaId)
    const kept = await svc.from('gallery_album_media').select('id,media_id').eq('id', ins.data!.id).single()
    expect(kept.data).toEqual({ id: ins.data!.id, media_id: null })
    await svc.from('gallery_albums').delete().eq('id', albumId)
    const gone = await svc.from('gallery_album_media').select('id').eq('id', ins.data!.id)
    expect(gone.data).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// enquiries: no anon access of any kind; admin-only
// ---------------------------------------------------------------------------
describe('enquiries', () => {
  const base = (tag: string, extra: Record<string, unknown> = {}) => ({
    division: 'heavy_haulage',
    enquiry_type: 'quote',
    name: mk(tag),
    phone: '+910000000000',
    email: 'someone@example.test',
    details: { cargo: 'transformer', weight_t: 90 },
    message: 'hello',
    ...extra,
  })

  async function seedEnquiry(tag: string, extra: Record<string, unknown> = {}) {
    const { data, error } = await svc.from('enquiries').insert(base(tag, extra)).select('*').single()
    if (error) throw new Error(`seed enquiry: ${error.message}`)
    return data as { id: string; status: string; updated_at: string }
  }

  it('service role can insert; defaults status to new', async () => {
    const row = await seedEnquiry('svc')
    expect(row.status).toBe('new')
  })

  it('anon INSERT is rejected with 42501 and nothing is stored', async () => {
    await expectDeniedInsert(anon, 'enquiries', base('anon-ins'))
    const none = await svc.from('enquiries').select('id').eq('name', mk('anon-ins'))
    expect(none.data).toHaveLength(0)
  })

  it('anon SELECT is rejected with 42501 even though rows exist', async () => {
    const row = await seedEnquiry('anon-sel')
    const { data, error } = await anon.from('enquiries').select('id').eq('id', row.id)
    expect(error).not.toBeNull()
    expect(error?.code).toBe(RLS_VIOLATION)
    expect(data ?? []).toHaveLength(0)
  })

  it('anon UPDATE and DELETE are rejected with 42501', async () => {
    const row = await seedEnquiry('anon-upd')
    const upd = await anon.from('enquiries').update({ status: 'archived' }).eq('id', row.id).select()
    expect(upd.error?.code).toBe(RLS_VIOLATION)
    const del = await anon.from('enquiries').delete().eq('id', row.id).select()
    expect(del.error?.code).toBe(RLS_VIOLATION)
    const after = await svc.from('enquiries').select('status').eq('id', row.id).single()
    expect(after.data?.status).toBe('new')
  })

  it('a signed-in non-admin cannot insert, select, update or delete', async () => {
    const row = await seedEnquiry('member')
    await expectDeniedInsert(member.client, 'enquiries', base('member-ins'))
    const none = await svc.from('enquiries').select('id').eq('name', mk('member-ins'))
    expect(none.data).toHaveLength(0)

    const sel = await member.client.from('enquiries').select('id').eq('id', row.id)
    expect(sel.error).toBeNull()
    expect(sel.data).toHaveLength(0) // the row exists (service-role seeded) but is invisible
    const truth = await svc.from('enquiries').select('id').eq('id', row.id)
    expect(truth.data).toHaveLength(1)

    await expectNoUpdateDelete(member.client, 'enquiries', row.id, { status: 'archived' })
    const notes = await member.client.from('enquiries').update({ internal_notes: 'x' }).eq('id', row.id).select()
    expect(notes.data ?? []).toHaveLength(0)
  })

  it('admin can select, insert, move through every status, and delete', async () => {
    const row = await seedEnquiry('admin')
    const sel = await admin.client.from('enquiries').select('id,status,internal_notes').eq('id', row.id)
    expect(sel.error).toBeNull()
    expect(sel.data).toHaveLength(1)

    for (const status of ['contacted', 'in_progress', 'completed', 'archived', 'new']) {
      const upd = await admin.client
        .from('enquiries')
        .update({ status, internal_notes: `moved to ${status}` })
        .eq('id', row.id)
        .select('status,internal_notes')
      expect(upd.error, status).toBeNull()
      expect(upd.data).toEqual([{ status, internal_notes: `moved to ${status}` }])
    }

    const ins = await admin.client.from('enquiries').insert(base('admin-ins')).select('id').single()
    expect(ins.error).toBeNull()

    const del = await admin.client.from('enquiries').delete().eq('id', row.id).select()
    expect(del.error).toBeNull()
    expect(del.data).toHaveLength(1)
    const gone = await svc.from('enquiries').select('id').eq('id', row.id)
    expect(gone.data).toHaveLength(0)
  })

  it('updated_at is bumped on update', async () => {
    const row = await seedEnquiry('ts')
    await new Promise((r) => setTimeout(r, 20))
    const upd = await svc.from('enquiries').update({ status: 'contacted' }).eq('id', row.id).select('updated_at').single()
    expect(new Date(upd.data!.updated_at).getTime()).toBeGreaterThan(new Date(row.updated_at).getTime())
  })

  it('rejects an invalid status and an invalid division', async () => {
    const s = await svc.from('enquiries').insert(base('bad-status', { status: 'spam' }))
    expect(s.error?.code).toBe(INVALID_ENUM)
    const d = await svc.from('enquiries').insert(base('bad-div', { division: 'catering' }))
    expect(d.error?.code).toBe(INVALID_ENUM)
    for (const division of ['krishna_trailor', 'heavy_haulage', 'radhe_travels']) {
      const ok = await svc.from('enquiries').insert(base(`div-${division}`, { division }))
      expect(ok.error, division).toBeNull()
    }
  })

  describe('length guards (abuse control), even via the service role', () => {
    const limits: Array<[string, number]> = [
      ['name', 200],
      ['phone', 50],
      ['email', 320],
      ['company', 200],
      ['enquiry_type', 100],
      ['message', 5000],
      ['attachment_path', 500],
      ['internal_notes', 5000],
    ]
    it.each(limits)('%s: %i chars accepted, one more rejected', async (col, max) => {
      const prefix = col === 'name' ? mk(`len-${col}`) : ''
      const fill = (n: number) => prefix + 'x'.repeat(n - prefix.length)
      const ok = await svc.from('enquiries').insert(base(`len-ok-${col}`, { [col]: fill(max) }))
      expect(ok.error, `${col} at limit`).toBeNull()
      const tooLong = await svc.from('enquiries').insert(base(`len-bad-${col}`, { [col]: fill(max + 1) }))
      expect(tooLong.error?.code, `${col} over limit`).toBe(CHECK_VIOLATION)
      // the rejected row must not exist
      if (col !== 'name') {
        const none = await svc.from('enquiries').select('id').eq('name', mk(`len-bad-${col}`))
        expect(none.data).toHaveLength(0)
      }
    })

    it('oversized details jsonb is rejected', async () => {
      const bad = await svc
        .from('enquiries')
        .insert(base('len-details', { details: { blob: 'x'.repeat(25_000) } }))
      expect(bad.error?.code).toBe(CHECK_VIOLATION)
    })

    it('an over-length UPDATE is rejected too', async () => {
      const row = await seedEnquiry('len-upd')
      const upd = await svc.from('enquiries').update({ message: 'x'.repeat(5001) }).eq('id', row.id)
      expect(upd.error?.code).toBe(CHECK_VIOLATION)
    })
  })
})

// ---------------------------------------------------------------------------
// Private bucket `enquiry-attachments`
// ---------------------------------------------------------------------------
describe('storage bucket "enquiry-attachments"', () => {
  const BUCKET = 'enquiry-attachments'
  const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const png = () => new Blob([bytes], { type: 'image/png' })
  const path = `rls-${run}/doc.png`

  beforeAll(async () => {
    const { error } = await svc.storage.from(BUCKET).upload(path, png(), { contentType: 'image/png' })
    if (error) throw new Error(`service-role upload failed: ${error.message}`)
    createdObjectPaths.push(path)
  })

  it('exists, is private, with a 10 MB limit and an image/pdf allow-list', async () => {
    const { data, error } = await svc.storage.getBucket(BUCKET)
    expect(error).toBeNull()
    expect(data?.public).toBe(false)
    expect(data?.file_size_limit).toBe(10 * 1024 * 1024)
    expect([...(data?.allowed_mime_types ?? [])].sort()).toEqual(
      ['application/pdf', 'image/avif', 'image/jpeg', 'image/png', 'image/webp'].sort(),
    )
  })

  it('rejects a disallowed mime type even from the service role', async () => {
    const { error } = await svc.storage
      .from(BUCKET)
      .upload(`rls-${run}/bad.txt`, new Blob(['hi'], { type: 'text/plain' }), { contentType: 'text/plain' })
    expect(error).not.toBeNull()
  })

  it('anon cannot list, download, sign, or fetch the public URL', async () => {
    const list = await anon.storage.from(BUCKET).list(`rls-${run}`)
    expect(list.error ?? null).toBeNull()
    expect(list.data ?? []).toHaveLength(0) // RLS-filtered: not "empty bucket" (service sees it below)
    const truth = await svc.storage.from(BUCKET).list(`rls-${run}`)
    expect((truth.data ?? []).map((o) => o.name)).toContain('doc.png')

    const dl = await anon.storage.from(BUCKET).download(path)
    expect(dl.error).not.toBeNull()
    expect(dl.data).toBeNull()

    const signed = await anon.storage.from(BUCKET).createSignedUrl(path, 60)
    expect(signed.error).not.toBeNull()
    expect(signed.data).toBeNull()

    const pub = await fetch(anon.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
    expect(pub.status).not.toBe(200)
  })

  it('a signed-in non-admin cannot list, download or sign', async () => {
    const list = await member.client.storage.from(BUCKET).list(`rls-${run}`)
    expect(list.data ?? []).toHaveLength(0)
    const dl = await member.client.storage.from(BUCKET).download(path)
    expect(dl.error).not.toBeNull()
    expect(dl.data).toBeNull()
    const signed = await member.client.storage.from(BUCKET).createSignedUrl(path, 60)
    expect(signed.error).not.toBeNull()
    expect(signed.data).toBeNull()
  })

  it('anon and a non-admin cannot upload or overwrite', async () => {
    const a = await anon.storage.from(BUCKET).upload(`rls-${run}/anon.png`, png(), { contentType: 'image/png' })
    expect(a.error).not.toBeNull()
    const m = await member.client.storage
      .from(BUCKET)
      .upload(`rls-${run}/member.png`, png(), { contentType: 'image/png' })
    expect(m.error).not.toBeNull()
    const over = await member.client.storage
      .from(BUCKET)
      .upload(path, new Blob([new Uint8Array([1])], { type: 'image/png' }), { contentType: 'image/png', upsert: true })
    expect(over.error).not.toBeNull()
    const list = await svc.storage.from(BUCKET).list(`rls-${run}`)
    const names = (list.data ?? []).map((o) => o.name)
    expect(names).not.toContain('anon.png')
    expect(names).not.toContain('member.png')
  })

  it('anon and a non-admin cannot delete (object survives)', async () => {
    const a = await anon.storage.from(BUCKET).remove([path])
    expect(a.data ?? []).toHaveLength(0)
    const m = await member.client.storage.from(BUCKET).remove([path])
    expect(m.data ?? []).toHaveLength(0)
    const still = await svc.storage.from(BUCKET).download(path)
    expect(still.error).toBeNull()
  })

  it('an admin can sign a URL, fetch it, and download the object', async () => {
    const signed = await admin.client.storage.from(BUCKET).createSignedUrl(path, 60)
    expect(signed.error).toBeNull()
    const res = await fetch(signed.data!.signedUrl)
    expect(res.status).toBe(200)
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes)

    const dl = await admin.client.storage.from(BUCKET).download(path)
    expect(dl.error).toBeNull()
    expect(new Uint8Array(await dl.data!.arrayBuffer())).toEqual(bytes)

    const list = await admin.client.storage.from(BUCKET).list(`rls-${run}`)
    expect((list.data ?? []).map((o) => o.name)).toContain('doc.png')
  })

  it('an admin cannot upload directly (uploads go through the service role)', async () => {
    const { error } = await admin.client.storage
      .from(BUCKET)
      .upload(`rls-${run}/admin-up.png`, png(), { contentType: 'image/png' })
    expect(error).not.toBeNull()
  })

  it('an admin can delete an object', async () => {
    const p = `rls-${run}/admin-del.png`
    const up = await svc.storage.from(BUCKET).upload(p, png(), { contentType: 'image/png' })
    expect(up.error).toBeNull()
    createdObjectPaths.push(p)
    const del = await admin.client.storage.from(BUCKET).remove([p])
    expect(del.error).toBeNull()
    expect(del.data).toHaveLength(1)
    const gone = await svc.storage.from(BUCKET).download(p)
    expect(gone.error).not.toBeNull()
  })

  it('the public "media" bucket is unchanged: still public-readable', async () => {
    const { data } = await svc.storage.getBucket('media')
    expect(data?.public).toBe(true)
  })
})
