import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

const order: string[] = []
const requireAdmin = vi.fn(async () => {
  order.push('auth')
})
const createServerClient = vi.fn(async () => {
  order.push('db')
  return { from: () => ({ update: () => ({ eq: () => ({ select: async () => ({ data: [{ id: 'x' }], error: null }) }) }) }) }
})
const revalidatePath = vi.fn()
vi.mock('@/lib/auth', () => ({ requireAdmin: () => requireAdmin() }))
vi.mock('@/lib/supabase/server', () => ({ createServerClient: () => createServerClient() }))
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePath(p) }))

import { ADMIN_TABLES, createEntityActions } from '../entity-actions'

const schema = z.object({ name: z.string().min(1) })
const make = () => createEntityActions({ table: 'services', schema, revalidate: ['/admin/services', '/'] })
const ID = '11111111-1111-4111-8111-111111111111'

beforeEach(() => {
  order.length = 0
  requireAdmin.mockClear()
  createServerClient.mockClear()
  revalidatePath.mockClear()
  requireAdmin.mockImplementation(async () => {
    order.push('auth')
  })
})

describe('createEntityActions', () => {
  it('rejects tables outside the whitelist', () => {
    // @ts-expect-error not an AdminTable
    expect(() => createEntityActions({ table: 'profiles', schema, revalidate: [] })).toThrow(/not allowed/)
    expect(ADMIN_TABLES).not.toContain('profiles')
    expect(ADMIN_TABLES).not.toContain('enquiries')
    expect(ADMIN_TABLES).not.toContain('media_assets')
  })

  it('every action calls requireAdmin first and touches no db when it rejects', async () => {
    requireAdmin.mockImplementation(async () => {
      throw new Error('NEXT_REDIRECT')
    })
    const a = make()
    await expect(a.save(null, { name: 'x' })).rejects.toThrow('NEXT_REDIRECT')
    await expect(a.setPublished(ID, true)).rejects.toThrow('NEXT_REDIRECT')
    await expect(a.remove(ID)).rejects.toThrow('NEXT_REDIRECT')
    await expect(a.reorder([ID])).rejects.toThrow('NEXT_REDIRECT')
    expect(createServerClient).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('validates input before the database and returns field errors', async () => {
    const r = await make().save(null, { name: '' })
    expect(r).toMatchObject({ ok: false, fieldErrors: { name: expect.any(String) } })
    expect(createServerClient).not.toHaveBeenCalled()
  })

  it('rejects malformed ids and orders without a db call', async () => {
    const a = make()
    expect(await a.remove('nope')).toMatchObject({ ok: false })
    expect(await a.setPublished('nope', true)).toMatchObject({ ok: false })
    expect(await a.reorder([ID, ID])).toMatchObject({ ok: false })
    expect(await a.reorder([])).toMatchObject({ ok: false })
    expect(createServerClient).not.toHaveBeenCalled()
  })

  it('authenticates, then writes, then revalidates', async () => {
    const r = await make().setPublished(ID, true)
    expect(r).toEqual({ ok: true })
    expect(order).toEqual(['auth', 'db'])
    expect(revalidatePath).toHaveBeenCalledWith('/admin/services')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
})
