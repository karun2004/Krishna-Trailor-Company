import 'server-only'
import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import type { SupabaseClient } from '@supabase/supabase-js'

export const ENQUIRY_LIMIT = 5
export const ENQUIRY_WINDOW_SECONDS = 600

/**
 * Client IP from the proxy headers: first hop of x-forwarded-for, else x-real-ip.
 * Only syntactically valid IPs are accepted (junk values cannot pollute the key space).
 */
export function getClientIp(headers: Headers): string {
  const candidates = [headers.get('x-forwarded-for')?.split(',')[0], headers.get('x-real-ip')]
  for (const c of candidates) {
    const v = c?.trim()
    if (v && isIP(v)) return v
  }
  return 'unknown'
}

/** Development/test-only default. NEVER used when NODE_ENV === 'production'. */
export const DEV_ONLY_IP_PEPPER = 'ktc-enquiry-ip-pepper'
export const MIN_PEPPER_LENGTH = 16

/**
 * The IP-hash pepper. In production a missing or short (<16 chars) ENQUIRY_IP_PEPPER throws (fail closed)
 * instead of silently using a public constant; dev/test fall back to DEV_ONLY_IP_PEPPER.
 */
export function resolvePepper(env: NodeJS.ProcessEnv = process.env): string {
  const pepper = env.ENQUIRY_IP_PEPPER
  if (env.NODE_ENV === 'production') {
    if (!pepper || pepper.length < MIN_PEPPER_LENGTH) {
      throw new Error(`ENQUIRY_IP_PEPPER must be set to a secret of at least ${MIN_PEPPER_LENGTH} characters in production`)
    }
    return pepper
  }
  return pepper || DEV_ONLY_IP_PEPPER
}

/** Keyed hash (HMAC-SHA256) so the stored value cannot be reversed by enumerating IPv4 space. */
export function hashIp(ip: string): string {
  const pepper = resolvePepper()
  return createHmac('sha256', pepper).update(ip).digest('hex')
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number }
  | { ok: false; error: true }

/** Atomic check-and-increment in Postgres. Fails closed on infrastructure errors. */
export async function checkEnquiryRateLimit(admin: SupabaseClient, ip: string): Promise<RateLimitResult> {
  const { data, error } = await admin.rpc('enquiry_rate_limit_hit', {
    p_ip_hash: hashIp(ip),
    p_limit: ENQUIRY_LIMIT,
    p_window_seconds: ENQUIRY_WINDOW_SECONDS,
  })
  const row = Array.isArray(data) ? data[0] : data
  if (error || !row) return { ok: false, error: true }
  if (row.allowed) return { ok: true }
  return { ok: false, retryAfterSeconds: Math.max(1, Number(row.retry_after_seconds) || ENQUIRY_WINDOW_SECONDS) }
}
