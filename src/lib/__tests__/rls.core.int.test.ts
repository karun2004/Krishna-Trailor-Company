/**
 * Integration tests for migration 0001_core against the LOCAL Supabase stack.
 * Run with `pnpm test:int` (excluded from the default `pnpm test`).
 *
 * "Rejected" assertions are deliberately non-vacuous: a policy-less table with RLS
 * enabled silently returns zero rows / affects zero rows, so for every denial we
 * either assert an explicit RLS error (INSERT) or re-read the row with the
 * service role to prove it was not changed/deleted (UPDATE/DELETE).
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
const run = crypto.randomUUID().slice(0, 8)
const slug = (s: string) => `rls-${run}-${s}`

const svc = serviceClient()
const anon = anonClient()
let admin: TestUser
let member: TestUser // authenticated, but NOT an admin

let publishedId: string
let unpublishedId: string
let mediaId: string
let settingKey: string

const createdDivisionIds: string[] = []
const createdMediaIds: string[] = []
const createdSettingKeys: string[] = []
const createdObjectPaths: string[] = []

async function seedDivision(name: string, published: boolean) {
  const { data, error } = await svc
    .from('business_divisions')
    .insert({ slug: slug(name), name, published })
    .select('id')
    .single()
  if (error) throw new Error(`seed division: ${error.message}`)
  createdDivisionIds.push(data.id)
  return data.id as string
}

async function seedMedia(name: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await svc
    .from('media_assets')
    .insert({
      storage_path: `rls-${run}/${name}.jpg`,
      category: 'other',
      mime_type: 'image/jpeg',
      ...extra,
    })
    .select('id')
    .single()
  if (error) throw new Error(`seed media: ${error.message}`)
  createdMediaIds.push(data.id)
  return data.id as string
}

beforeAll(async () => {
  admin = await createTestUser({ admin: true })
  member = await createTestUser({ admin: false })
  publishedId = await seedDivision('published', true)
  unpublishedId = await seedDivision('unpublished', false)
  mediaId = await seedMedia('seed')
  settingKey = `rls-${run}-contact`
  const { error } = await svc.from('site_settings').insert({ key: settingKey, value: { phone: 'x' } })
  if (error) throw new Error(`seed setting: ${error.message}`)
  createdSettingKeys.push(settingKey)
})

afterAll(async () => {
  if (createdObjectPaths.length) await svc.storage.from('media').remove(createdObjectPaths)
  if (createdMediaIds.length) await svc.from('media_assets').delete().in('id', createdMediaIds)
  if (createdDivisionIds.length) {
    await svc.from('business_divisions').delete().in('id', createdDivisionIds)
  }
  if (createdSettingKeys.length) await svc.from('site_settings').delete().in('key', createdSettingKeys)
  await admin?.remove()
  await member?.remove()
})

/** Run a write as `client`; returns the RLS-visible outcome. */
async function expectDeniedInsert(client: SupabaseClient, table: string, row: object) {
  const { data, error } = await client.from(table).insert(row).select()
  expect(error, `INSERT into ${table} must raise an RLS error`).not.toBeNull()
  expect(error?.code).toBe(RLS_VIOLATION)
  expect(data ?? []).toHaveLength(0)
}

describe('anon: business_divisions', () => {
  it('can SELECT a published division', async () => {
    const { data, error } = await anon.from('business_divisions').select('id,name').eq('id', publishedId)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('gets zero rows for an unpublished division (which does exist)', async () => {
    const truth = await svc.from('business_divisions').select('id').eq('id', unpublishedId)
    expect(truth.data).toHaveLength(1)
    const { data, error } = await anon.from('business_divisions').select('id').eq('id', unpublishedId)
    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('cannot INSERT, UPDATE or DELETE', async () => {
    await expectDeniedInsert(anon, 'business_divisions', { slug: slug('anon'), name: 'anon', published: true })

    const upd = await anon.from('business_divisions').update({ name: 'hacked' }).eq('id', publishedId).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await anon.from('business_divisions').delete().eq('id', publishedId).select()
    expect(del.data ?? []).toHaveLength(0)

    const after = await svc.from('business_divisions').select('name').eq('id', publishedId).single()
    expect(after.data?.name).toBe('published')
  })
})

describe('anon: media_assets', () => {
  it('can SELECT (public URLs must resolve)', async () => {
    const { data, error } = await anon.from('media_assets').select('id').eq('id', mediaId)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('INSERT is rejected', async () => {
    await expectDeniedInsert(anon, 'media_assets', {
      storage_path: `rls-${run}/anon.jpg`,
      category: 'other',
      mime_type: 'image/jpeg',
    })
    const truth = await svc.from('media_assets').select('id').eq('storage_path', `rls-${run}/anon.jpg`)
    expect(truth.data).toHaveLength(0)
  })

  it('cannot UPDATE or DELETE', async () => {
    const upd = await anon.from('media_assets').update({ alt: 'hacked' }).eq('id', mediaId).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await anon.from('media_assets').delete().eq('id', mediaId).select()
    expect(del.data ?? []).toHaveLength(0)
    const after = await svc.from('media_assets').select('alt').eq('id', mediaId).single()
    expect(after.data?.alt).toBeNull()
  })
})

describe('anon: site_settings', () => {
  it('can SELECT', async () => {
    const { data, error } = await anon.from('site_settings').select('key').eq('key', settingKey)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('cannot INSERT, UPDATE or DELETE', async () => {
    await expectDeniedInsert(anon, 'site_settings', { key: `rls-${run}-anon`, value: {} })
    const upd = await anon.from('site_settings').update({ value: { phone: 'hacked' } }).eq('key', settingKey).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await anon.from('site_settings').delete().eq('key', settingKey).select()
    expect(del.data ?? []).toHaveLength(0)
    const after = await svc.from('site_settings').select('value').eq('key', settingKey).single()
    expect(after.data?.value).toEqual({ phone: 'x' })
  })
})

describe('anon: profiles', () => {
  it('sees nothing and cannot write', async () => {
    const truth = await svc.from('profiles').select('id').eq('id', admin.id)
    expect(truth.data).toHaveLength(1)
    const { data } = await anon.from('profiles').select('id')
    expect(data ?? []).toHaveLength(0)
    await expectDeniedInsert(anon, 'profiles', { id: member.id, role: 'admin' })
  })
})

describe('authenticated non-admin', () => {
  it('can still read published divisions but not unpublished ones', async () => {
    const pub = await member.client.from('business_divisions').select('id').eq('id', publishedId)
    expect(pub.data).toHaveLength(1)
    const unpub = await member.client.from('business_divisions').select('id').eq('id', unpublishedId)
    expect(unpub.data ?? []).toHaveLength(0)
  })

  it('cannot write business_divisions', async () => {
    await expectDeniedInsert(member.client, 'business_divisions', { slug: slug('member'), name: 'm' })
    const upd = await member.client.from('business_divisions').update({ name: 'hacked' }).eq('id', publishedId).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await member.client.from('business_divisions').delete().eq('id', publishedId).select()
    expect(del.data ?? []).toHaveLength(0)
    const after = await svc.from('business_divisions').select('name').eq('id', publishedId).single()
    expect(after.data?.name).toBe('published')
  })

  it('cannot write media_assets', async () => {
    await expectDeniedInsert(member.client, 'media_assets', {
      storage_path: `rls-${run}/member.jpg`,
      category: 'other',
      mime_type: 'image/jpeg',
    })
    const upd = await member.client.from('media_assets').update({ alt: 'hacked' }).eq('id', mediaId).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await member.client.from('media_assets').delete().eq('id', mediaId).select()
    expect(del.data ?? []).toHaveLength(0)
    const after = await svc.from('media_assets').select('alt').eq('id', mediaId).single()
    expect(after.data?.alt).toBeNull()
  })

  it('cannot write site_settings', async () => {
    await expectDeniedInsert(member.client, 'site_settings', { key: `rls-${run}-member`, value: {} })
    const upd = await member.client.from('site_settings').update({ value: { phone: 'hacked' } }).eq('key', settingKey).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await member.client.from('site_settings').delete().eq('key', settingKey).select()
    expect(del.data ?? []).toHaveLength(0)
    const after = await svc.from('site_settings').select('value').eq('key', settingKey).single()
    expect(after.data?.value).toEqual({ phone: 'x' })
  })

  it('profiles: sees only their own row (none, as a non-admin has no profile)', async () => {
    const { data, error } = await member.client.from('profiles').select('id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  })

  it('cannot self-promote by inserting an admin profile', async () => {
    await expectDeniedInsert(member.client, 'profiles', { id: member.id, role: 'admin' })
    const truth = await svc.from('profiles').select('id').eq('id', member.id)
    expect(truth.data).toHaveLength(0)
    const check = await member.client.rpc('is_admin')
    expect(check.data).toBe(false)
  })

  it('cannot update or delete a profile (their own admin-less state, or an admin\'s)', async () => {
    const upd = await member.client.from('profiles').update({ role: 'admin' }).eq('id', admin.id).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await member.client.from('profiles').delete().eq('id', admin.id).select()
    expect(del.data ?? []).toHaveLength(0)
    const truth = await svc.from('profiles').select('role').eq('id', admin.id).single()
    expect(truth.data?.role).toBe('admin')
  })
})

describe('authenticated admin', () => {
  it('can read every division including unpublished', async () => {
    const { data } = await admin.client.from('business_divisions').select('id').eq('id', unpublishedId)
    expect(data).toHaveLength(1)
  })

  it('can insert/update/delete business_divisions', async () => {
    const ins = await admin.client
      .from('business_divisions')
      .insert({ slug: slug('admin'), name: 'a' })
      .select('id')
      .single()
    expect(ins.error).toBeNull()
    createdDivisionIds.push(ins.data!.id)
    const upd = await admin.client.from('business_divisions').update({ name: 'b' }).eq('id', ins.data!.id).select()
    expect(upd.error).toBeNull()
    expect(upd.data).toHaveLength(1)
    const del = await admin.client.from('business_divisions').delete().eq('id', ins.data!.id).select()
    expect(del.error).toBeNull()
    expect(del.data).toHaveLength(1)
  })

  it('can insert/update/delete media_assets', async () => {
    const ins = await admin.client
      .from('media_assets')
      .insert({ storage_path: `rls-${run}/admin.jpg`, category: 'fleet', mime_type: 'image/jpeg' })
      .select('id')
      .single()
    expect(ins.error).toBeNull()
    createdMediaIds.push(ins.data!.id)
    const upd = await admin.client.from('media_assets').update({ alt: 'ok' }).eq('id', ins.data!.id).select()
    expect(upd.data).toHaveLength(1)
    const del = await admin.client.from('media_assets').delete().eq('id', ins.data!.id).select()
    expect(del.data).toHaveLength(1)
  })

  it('can insert/update/delete site_settings', async () => {
    const key = `rls-${run}-admin`
    createdSettingKeys.push(key)
    const ins = await admin.client.from('site_settings').insert({ key, value: { a: 1 } }).select()
    expect(ins.error).toBeNull()
    const upd = await admin.client.from('site_settings').update({ value: { a: 2 } }).eq('key', key).select()
    expect(upd.data).toHaveLength(1)
    const del = await admin.client.from('site_settings').delete().eq('key', key).select()
    expect(del.data).toHaveLength(1)
  })

  it('can read their own profile and only their own', async () => {
    const { data, error } = await admin.client.from('profiles').select('id,role')
    expect(error).toBeNull()
    expect(data).toEqual([{ id: admin.id, role: 'admin' }])
  })

  it('still cannot write profiles via the API (service role only)', async () => {
    await expectDeniedInsert(admin.client, 'profiles', { id: member.id, role: 'admin' })
    const upd = await admin.client.from('profiles').update({ role: 'admin' }).eq('id', admin.id).select()
    expect(upd.data ?? []).toHaveLength(0)
    const del = await admin.client.from('profiles').delete().eq('id', admin.id).select()
    expect(del.data ?? []).toHaveLength(0)
    const truth = await svc.from('profiles').select('id').eq('id', admin.id)
    expect(truth.data).toHaveLength(1)
  })
})

describe('public.is_admin()', () => {
  it('is false for anon, false for a non-admin, true for an admin', async () => {
    const a = await anon.rpc('is_admin')
    expect(a.error).toBeNull()
    expect(a.data).toBe(false)
    const m = await member.client.rpc('is_admin')
    expect(m.error).toBeNull()
    expect(m.data).toBe(false)
    const ad = await admin.client.rpc('is_admin')
    expect(ad.error).toBeNull()
    expect(ad.data).toBe(true)
  })
})

describe('schema invariants', () => {
  it('deleting a media asset nulls hero_media_id and keeps the division', async () => {
    const heroId = await seedMedia('hero')
    const divId = await seedDivision('hero-div', true)
    const set = await svc.from('business_divisions').update({ hero_media_id: heroId }).eq('id', divId)
    expect(set.error).toBeNull()
    const del = await svc.from('media_assets').delete().eq('id', heroId)
    expect(del.error).toBeNull()
    const { data, error } = await svc.from('business_divisions').select('id,hero_media_id').eq('id', divId).single()
    expect(error).toBeNull()
    expect(data).toEqual({ id: divId, hero_media_id: null })
  })

  it('deleting a division nulls media_assets.division_id and keeps the asset', async () => {
    const divId = await seedDivision('owner-div', true)
    const assetId = await seedMedia('owned', { division_id: divId })
    const del = await svc.from('business_divisions').delete().eq('id', divId)
    expect(del.error).toBeNull()
    const { data, error } = await svc.from('media_assets').select('id,division_id').eq('id', assetId).single()
    expect(error).toBeNull()
    expect(data).toEqual({ id: assetId, division_id: null })
  })

  it('set_updated_at bumps updated_at on update', async () => {
    const before = await svc.from('business_divisions').select('updated_at').eq('id', publishedId).single()
    await new Promise((r) => setTimeout(r, 20))
    await svc.from('business_divisions').update({ tagline: 't' }).eq('id', publishedId)
    const after = await svc.from('business_divisions').select('updated_at').eq('id', publishedId).single()
    expect(new Date(after.data!.updated_at).getTime()).toBeGreaterThan(new Date(before.data!.updated_at).getTime())
  })

  it('rejects an unknown media_category and a non-admin profile role', async () => {
    const bad = await svc
      .from('media_assets')
      .insert({ storage_path: `rls-${run}/bad.jpg`, category: 'not_a_category', mime_type: 'image/jpeg' })
    expect(bad.error).not.toBeNull()
    const role = await svc.from('profiles').insert({ id: member.id, role: 'superuser' })
    expect(role.error).not.toBeNull()
  })
})

describe('storage bucket "media"', () => {
  const png = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' })

  it('bucket exists and is public', async () => {
    const { data, error } = await svc.storage.getBucket('media')
    expect(error).toBeNull()
    expect(data?.public).toBe(true)
  })

  it('rejects an anon upload', async () => {
    const path = `rls-${run}/anon.png`
    const { data, error } = await anon.storage.from('media').upload(path, png, { contentType: 'image/png' })
    expect(error).not.toBeNull()
    expect(data).toBeNull()
    const list = await svc.storage.from('media').list(`rls-${run}`)
    expect((list.data ?? []).map((o) => o.name)).not.toContain('anon.png')
  })

  it('rejects a non-admin authenticated upload', async () => {
    const path = `rls-${run}/member.png`
    const { error } = await member.client.storage.from('media').upload(path, png, { contentType: 'image/png' })
    expect(error).not.toBeNull()
    const list = await svc.storage.from('media').list(`rls-${run}`)
    expect((list.data ?? []).map((o) => o.name)).not.toContain('member.png')
  })

  it('lets an admin upload, and the object is publicly readable', async () => {
    const path = `rls-${run}/admin.png`
    const { error } = await admin.client.storage.from('media').upload(path, png, { contentType: 'image/png' })
    expect(error).toBeNull()
    createdObjectPaths.push(path)

    const { data } = anon.storage.from('media').getPublicUrl(path)
    const res = await fetch(data.publicUrl)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('image/png')
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))
  })

  it('does not let anon or a non-admin overwrite or delete an object', async () => {
    const path = `rls-${run}/admin.png`
    const evil = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })
    const up = await anon.storage.from('media').upload(path, evil, { contentType: 'image/png', upsert: true })
    expect(up.error).not.toBeNull()
    const delAnon = await anon.storage.from('media').remove([path])
    expect(delAnon.data ?? []).toHaveLength(0)
    const delMember = await member.client.storage.from('media').remove([path])
    expect(delMember.data ?? []).toHaveLength(0)
    const { data } = anon.storage.from('media').getPublicUrl(path)
    const res = await fetch(data.publicUrl)
    expect(res.status).toBe(200)
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))
  })

  it('lets an admin delete an object', async () => {
    const path = `rls-${run}/admin-del.png`
    const up = await admin.client.storage.from('media').upload(path, png, { contentType: 'image/png' })
    expect(up.error).toBeNull()
    createdObjectPaths.push(path)
    const del = await admin.client.storage.from('media').remove([path])
    expect(del.error).toBeNull()
    expect(del.data).toHaveLength(1)
  })
})
