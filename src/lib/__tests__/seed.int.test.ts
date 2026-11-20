/**
 * Integration test for supabase/seed.sql (applied by `supabase db reset`).
 * Ground truth is read with the service role; public visibility with the anon client.
 */
import { describe, expect, it } from 'vitest'
import { anonClient, serviceClient } from '../../../tests/support/db'

const svc = serviceClient()
const anon = anonClient()

async function all(table: string) {
  const { data, error } = await svc.from(table).select('*')
  expect(error).toBeNull()
  return data ?? []
}

describe('seed data', () => {
  it('has three published divisions', async () => {
    const rows = await all('business_divisions')
    expect(rows.map((r) => r.slug).sort()).toEqual(['heavy-machinery', 'krishna-trailor', 'radhe-travels'])
    expect(rows.every((r) => r.published)).toBe(true)
  })

  it('has 8 published services visible to anon', async () => {
    const { data, error } = await anon.from('services').select('slug').eq('published', true)
    expect(error).toBeNull()
    expect(data).toHaveLength(8)
  })

  it('keeps every testimonial unpublished with a verification note', async () => {
    const rows = await all('testimonials')
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      expect(r.published).toBe(false)
      expect(r.approved).toBe(false)
      expect(r.verification_note).toBeTruthy()
    }
    const { data } = await anon.from('testimonials').select('id')
    expect(data).toEqual([])
  })

  it('does not seed client logos', async () => {
    expect(await all('client_logos')).toHaveLength(0)
  })

  it('stores verbatim head office facts in site_settings', async () => {
    const rows = await all('site_settings')
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    const flat = JSON.stringify(byKey)
    for (const s of [
      'Shop No. 644, New Motor Market, Manimajra, Chandigarh – 160101',
      '0172-4640644',
      '9815413468',
      '7373000018',
      'Ktc087@gmail.com',
      'Kuldeep Singh',
      '1987',
    ]) {
      expect(flat).toContain(s)
    }
  })

  it('has Chandigarh (head) and Bhopal offices', async () => {
    const rows = await all('office_locations')
    const names = rows.map((r) => r.name)
    expect(names.some((n) => /Chandigarh/.test(n))).toBe(true)
    expect(names.some((n) => /Bhopal/.test(n))).toBe(true)
    expect(rows.find((r) => /Chandigarh/.test(r.name))?.is_head_office).toBe(true)
  })

  it('publishes the homepage hero and headline copy, and seo rows', async () => {
    const { data } = await anon.from('page_content').select('content').eq('page_key', 'home').eq('published', true)
    const flat = JSON.stringify(data)
    expect(flat).toContain('ANY LOAD. ANY ROAD.')
    expect(flat).toContain("WE MOVE WHAT OTHERS CAN'T.")
    const seo = await all('seo_metadata')
    expect(seo.length).toBeGreaterThan(0)
    expect(seo.every((r) => r.published)).toBe(true)
  })

  it('publishes no unverified claims', async () => {
    const pub = [
      ...(await all('timeline_milestones')),
      ...(await all('faqs')),
      ...(await all('page_content')),
      ...(await all('services')),
      ...(await all('business_divisions')),
    ].filter((r) => r.published)
    const flat = JSON.stringify(pub)
    expect(flat).not.toMatch(/38\+|250 ?MT|ISO/i)
    expect((await all('projects')).filter((r) => r.published)).toHaveLength(0)
    for (const t of await all('timeline_milestones')) {
      if (t.year !== '1987') expect(t.published || !!t.verification_note).toBe(true)
    }
  })
})
