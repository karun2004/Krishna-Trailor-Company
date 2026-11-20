/**
 * Migration 0003: verification_note is an internal editorial field and must never be
 * readable by anon (column-level grants), while admins keep full access.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { anonClient, createTestUser, type TestUser } from '../../../tests/support/db'

const TABLES = [
  'business_divisions', 'services', 'fleet_items', 'projects', 'gallery_albums',
  'timeline_milestones', 'testimonials', 'faqs', 'client_logos', 'office_locations',
  'page_content', 'seo_metadata',
] as const

const anon = anonClient()
let admin: TestUser

beforeAll(async () => {
  admin = await createTestUser({ admin: true })
})
afterAll(async () => {
  await admin?.remove()
})

describe('verification_note is hidden from anon', () => {
  for (const t of TABLES) {
    it(`${t}: anon select verification_note -> 42501`, async () => {
      const { error } = await anon.from(t).select('verification_note').limit(1)
      expect(error?.code).toBe('42501')
    })
    it(`${t}: anon select * -> 42501`, async () => {
      const { error } = await anon.from(t).select('*').limit(1)
      expect(error?.code).toBe('42501')
    })
    it(`${t}: anon can still select id, published`, async () => {
      const { error } = await anon.from(t).select('id, published').limit(1)
      expect(error).toBeNull()
    })
    it(`${t}: admin can still read verification_note`, async () => {
      const { error } = await admin.client.from(t).select('verification_note').limit(1)
      expect(error).toBeNull()
    })
  }
})
