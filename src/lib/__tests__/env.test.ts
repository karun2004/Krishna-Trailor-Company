import { afterEach, describe, expect, it, vi } from 'vitest'

const createClientSpy = vi.hoisted(() => vi.fn(() => ({ __client: true })))
vi.mock('@supabase/supabase-js', () => ({ createClient: createClientSpy }))

import { parseEnv } from '../env'

const valid: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
}

describe('parseEnv', () => {
  it('throws naming the missing URL variable', () => {
    expect(() => parseEnv({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })

  it('throws naming the missing anon key variable', () => {
    expect(() =>
      parseEnv({ NEXT_PUBLIC_SUPABASE_URL: valid.NEXT_PUBLIC_SUPABASE_URL }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/)
  })

  it('throws naming the URL variable when it is not a URL', () => {
    expect(() =>
      parseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })

  it('returns the typed object for valid input', () => {
    const env = parseEnv(valid)
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('http://127.0.0.1:54321')
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('anon-key')
  })
})

describe('env module', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('throws at import time when a required variable is missing', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    await expect(import('../env')).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })
})

describe('createAdminClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function load() {
    vi.resetModules()
    return import('../supabase/admin')
  }

  it('throws a readable error naming SUPABASE_SERVICE_ROLE_KEY when it is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', undefined)
    const { createAdminClient } = await load()
    expect(() => createAdminClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/)
  })

  it.each(['', '   \t\n'])('throws when the key is empty or whitespace-only (%j)', async (value) => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', value)
    const { createAdminClient } = await load()
    expect(() => createAdminClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/)
  })

  it('hands the (trimmed) service key and public URL to the supabase-js client factory', async () => {
    createClientSpy.mockClear()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '  svc-key  ')
    const { createAdminClient } = await load()
    const client = createAdminClient()
    expect(client).toEqual({ __client: true })
    expect(createClientSpy).toHaveBeenCalledTimes(1)
    const [url, key, options] = createClientSpy.mock.calls[0] as unknown as [string, string, unknown]
    expect(url).toBe('http://127.0.0.1:54321')
    expect(key).toBe('svc-key')
    expect(options).toMatchObject({ auth: { persistSession: false } })
  })
})
