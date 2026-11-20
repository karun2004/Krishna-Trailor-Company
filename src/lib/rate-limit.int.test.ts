import { afterAll, describe, expect, it } from 'vitest'
import { anonClient, serviceClient } from '../../tests/support/db'

const svc = serviceClient()
const hashes: string[] = []
const fresh = () => {
  const h = `inttest-${crypto.randomUUID()}`
  hashes.push(h)
  return h
}
const hit = (h: string, limit = 5, win = 600) =>
  svc.rpc('enquiry_rate_limit_hit', { p_ip_hash: h, p_limit: limit, p_window_seconds: win })

afterAll(async () => {
  await svc.from('enquiry_rate_events').delete().in('ip_hash', hashes)
})

describe('enquiry_rate_limit_hit', () => {
  it('allows 5 then blocks the 6th with a retry-after, recording nothing for the blocked hit', async () => {
    const h = fresh()
    for (let i = 0; i < 5; i++) {
      const { data, error } = await hit(h)
      expect(error).toBeNull()
      expect(data[0]).toMatchObject({ allowed: true, retry_after_seconds: 0 })
    }
    const sixth = await hit(h)
    expect(sixth.data[0].allowed).toBe(false)
    expect(sixth.data[0].retry_after_seconds).toBeGreaterThan(0)
    expect(sixth.data[0].retry_after_seconds).toBeLessThanOrEqual(600)
    const { count } = await svc.from('enquiry_rate_events').select('*', { count: 'exact', head: true }).eq('ip_hash', h)
    expect(count).toBe(5)
  })

  it('keeps separate budgets per hash', async () => {
    const a = fresh()
    const b = fresh()
    for (let i = 0; i < 5; i++) await hit(a)
    expect((await hit(a)).data[0].allowed).toBe(false)
    expect((await hit(b)).data[0].allowed).toBe(true)
  })

  it('is atomic under concurrency: 12 parallel calls allow exactly 5', async () => {
    const h = fresh()
    const results = await Promise.all(Array.from({ length: 12 }, () => hit(h)))
    expect(results.filter((r) => r.data[0].allowed)).toHaveLength(5)
  })

  it('forgets hits outside the window', async () => {
    const h = fresh()
    await svc.from('enquiry_rate_events').insert(
      Array.from({ length: 5 }, () => ({ ip_hash: h, created_at: new Date(Date.now() - 11 * 60_000).toISOString() })),
    )
    expect((await hit(h)).data[0].allowed).toBe(true)
  })

  it('purges stale rows opportunistically', async () => {
    const h = fresh()
    await svc.from('enquiry_rate_events').insert({ ip_hash: h, created_at: new Date(Date.now() - 2 * 3600_000).toISOString() })
    await hit(fresh())
    const { count } = await svc.from('enquiry_rate_events').select('*', { count: 'exact', head: true }).eq('ip_hash', h)
    expect(count).toBe(0)
  })

  it('is not executable by anon and the table is not readable by anon', async () => {
    const anon = anonClient()
    const r = await anon.rpc('enquiry_rate_limit_hit', { p_ip_hash: 'x' })
    expect(r.error).not.toBeNull()
    const t = await anon.from('enquiry_rate_events').select('*')
    expect(t.error).not.toBeNull()
  })
})
