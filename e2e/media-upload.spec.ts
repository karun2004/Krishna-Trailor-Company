import { chromium, expect, request as pwRequest, test, type APIRequestContext } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const created: { ids: string[]; paths: string[] } = { ids: [], paths: [] }

async function objectCount(folder: string) {
  const { data, error } = await svc.storage.from('media').list(folder)
  if (error) throw error
  return data.filter((o) => o.name !== '.emptyFolderPlaceholder').length
}
const png = () => sharp({ create: { width: 40, height: 30, channels: 3, background: '#f28c28' } }).png().toBuffer()
const form = (buf: Buffer, type: string, name: string, category = 'gallery') => ({
  multipart: { file: { name, mimeType: type, buffer: buf }, category },
})

async function adminCtx(): Promise<APIRequestContext> {
  // sign in through the real login page so cookies are set by the app
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3100' })
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin$/)
  const state = await page.context().storageState()
  await browser.close()
  return pwRequest.newContext({ baseURL: 'http://127.0.0.1:3100', storageState: state })
}

test.afterAll(async () => {
  if (created.ids.length) await svc.from('media_assets').delete().in('id', created.ids)
  if (created.paths.length) await svc.storage.from('media').remove(created.paths)
})

test('no cookie -> 401 and no object', async ({ request }) => {
  const before = await objectCount('gallery')
  const res = await request.post('/api/admin/media', form(await png(), 'image/png', 'a.png'))
  expect(res.status()).toBe(401)
  expect(await objectCount('gallery')).toBe(before)
})

test('admin pipeline: upload, reject bad files, patch, replace, delete', async () => {
  const api = await adminCtx()
  const before = await objectCount('gallery')

  // valid png
  const ok = await api.post('/api/admin/media', form(await png(), 'image/png', 'a.png'))
  expect(ok.status()).toBe(201)
  const row = await ok.json()
  created.ids.push(row.id)
  created.paths.push(row.storage_path)
  expect(row).toMatchObject({ category: 'gallery', mime_type: 'image/png', width: 40, height: 30, bucket: 'media' })
  expect(row.storage_path).toMatch(/^gallery\/[0-9a-f-]{36}\.png$/)
  expect(await objectCount('gallery')).toBe(before + 1)
  const { data: dbRow } = await svc.from('media_assets').select('id').eq('id', row.id).single()
  expect(dbRow?.id).toBe(row.id)

  const afterOk = await objectCount('gallery')
  const rejects: [string, Buffer, string, RegExp][] = [
    ['svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'image/svg+xml', /not allowed/i],
    ['pdf', Buffer.from('%PDF-1.4 x'), 'application/pdf', /not allowed/i],
    ['11MB jpeg', Buffer.alloc(11 * 1024 * 1024, 1), 'image/jpeg', /10MB/],
    ['spoofed mime (text as png)', Buffer.from('not really an image at all'), 'image/png', /image/i],
    ['png declared as jpeg', await png(), 'image/jpeg', /does not match/i],
  ]
  for (const [label, buf, type, msg] of rejects) {
    const r = await api.post('/api/admin/media', form(buf, type, 'x.bin'))
    expect(r.status(), label).toBe(400)
    expect((await r.json()).error, label).toMatch(msg)
  }
  expect(await objectCount('gallery')).toBe(afterOk)

  // bad category
  const bc = await api.post('/api/admin/media', form(await png(), 'image/png', 'a.png', 'bogus'))
  expect(bc.status()).toBe(400)

  // patch
  const p = await api.patch(`/api/admin/media/${row.id}`, { data: { alt: 'Crane', caption: 'On site' } })
  expect(p.status()).toBe(200)
  expect(await p.json()).toMatchObject({ alt: 'Crane', caption: 'On site' })

  // replace keeps id
  const jpg = await sharp({ create: { width: 20, height: 10, channels: 3, background: '#000' } }).jpeg().toBuffer()
  const rep = await api.put(`/api/admin/media/${row.id}`, { multipart: { file: { name: 'b.jpg', mimeType: 'image/jpeg', buffer: jpg } } })
  expect(rep.status()).toBe(200)
  const repRow = await rep.json()
  expect(repRow).toMatchObject({ id: row.id, mime_type: 'image/jpeg', width: 20, height: 10 })
  created.paths.push(repRow.storage_path)
  expect(await objectCount('gallery')).toBe(afterOk) // old object removed, new one added

  // delete
  const d = await api.delete(`/api/admin/media/${row.id}`)
  expect(d.status()).toBe(200)
  expect(await objectCount('gallery')).toBe(before)
  const { data: gone } = await svc.from('media_assets').select('id').eq('id', row.id)
  expect(gone).toEqual([])
  expect((await api.delete(`/api/admin/media/${row.id}`)).status()).toBe(404)
  await api.dispose()
})

test('no cookie PATCH/PUT/DELETE -> 401', async ({ request }) => {
  const id = crypto.randomUUID()
  expect((await request.patch(`/api/admin/media/${id}`, { data: { alt: 'x' } })).status()).toBe(401)
  expect((await request.delete(`/api/admin/media/${id}`)).status()).toBe(401)
  expect((await request.put(`/api/admin/media/${id}`, form(await png(), 'image/png', 'a.png'))).status()).toBe(401)
})
