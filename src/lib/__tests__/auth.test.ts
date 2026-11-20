import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUser = vi.fn()
const single = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: async () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: single }) }) }),
  }),
}))
const redirect = vi.fn((to: string) => {
  throw new Error(`NEXT_REDIRECT:${to}`)
})
vi.mock('next/navigation', () => ({ redirect: (to: string) => redirect(to) }))

import { requireAdmin, requireAdminApi, getAdminUser } from '@/lib/auth'

const user = { id: 'u1', email: 'a@example.test' }

beforeEach(() => {
  getUser.mockReset()
  single.mockReset()
  redirect.mockClear()
})

describe('getAdminUser', () => {
  it('is null with no session', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: 'no session' } })
    expect(await getAdminUser()).toBeNull()
  })
  it('is null for an authenticated non-admin (no profile row)', async () => {
    getUser.mockResolvedValue({ data: { user }, error: null })
    single.mockResolvedValue({ data: null, error: null })
    expect(await getAdminUser()).toBeNull()
  })
  it('is null when the profile read errors (fail closed)', async () => {
    getUser.mockResolvedValue({ data: { user }, error: null })
    single.mockResolvedValue({ data: null, error: { message: 'boom' } })
    expect(await getAdminUser()).toBeNull()
  })
  it('returns the user for role=admin', async () => {
    getUser.mockResolvedValue({ data: { user }, error: null })
    single.mockResolvedValue({ data: { role: 'admin' }, error: null })
    expect(await getAdminUser()).toEqual(user)
  })
})

describe('requireAdmin (pages / server actions)', () => {
  it('redirects to /admin/login when not admin', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT:/admin/login')
  })
  it('returns the admin session', async () => {
    getUser.mockResolvedValue({ data: { user }, error: null })
    single.mockResolvedValue({ data: { role: 'admin' }, error: null })
    expect(await requireAdmin()).toEqual({ user })
  })
})

describe('requireAdminApi (route handlers)', () => {
  it('returns a 401 JSON response when anonymous', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    const r = await requireAdminApi()
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.response.status).toBe(401)
      expect(await r.response.json()).toEqual({ error: 'Unauthorized' })
    }
  })
  it('returns 401 for non-admin too', async () => {
    getUser.mockResolvedValue({ data: { user }, error: null })
    single.mockResolvedValue({ data: null, error: null })
    const r = await requireAdminApi()
    expect(r.ok).toBe(false)
  })
  it('returns ok + session for admin', async () => {
    getUser.mockResolvedValue({ data: { user }, error: null })
    single.mockResolvedValue({ data: { role: 'admin' }, error: null })
    const r = await requireAdminApi()
    expect(r).toEqual({ ok: true, session: { user } })
  })
})
