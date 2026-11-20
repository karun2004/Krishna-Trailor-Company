import { describe, expect, it } from 'vitest'
import { DEV_ONLY_IP_PEPPER, hashIp, resolvePepper } from '../rate-limit'

const env = (o: Record<string, string | undefined>) => o as unknown as NodeJS.ProcessEnv

describe('resolvePepper', () => {
  it('production without a pepper throws', () => {
    expect(() => resolvePepper(env({ NODE_ENV: 'production' }))).toThrow(/ENQUIRY_IP_PEPPER/)
  })
  it('production with a short pepper throws', () => {
    expect(() => resolvePepper(env({ NODE_ENV: 'production', ENQUIRY_IP_PEPPER: 'short' }))).toThrow(/ENQUIRY_IP_PEPPER/)
  })
  it('production with a long pepper uses it', () => {
    expect(resolvePepper(env({ NODE_ENV: 'production', ENQUIRY_IP_PEPPER: 'x'.repeat(16) }))).toBe('x'.repeat(16))
  })
  it('development and test fall back to the dev-only default', () => {
    expect(resolvePepper(env({ NODE_ENV: 'development' }))).toBe(DEV_ONLY_IP_PEPPER)
    expect(resolvePepper(env({ NODE_ENV: 'test' }))).toBe(DEV_ONLY_IP_PEPPER)
  })
})

describe('hashIp', () => {
  it('is deterministic under the test env and 64 hex chars', () => {
    expect(hashIp('1.2.3.4')).toMatch(/^[0-9a-f]{64}$/)
    expect(hashIp('1.2.3.4')).toBe(hashIp('1.2.3.4'))
  })
})
