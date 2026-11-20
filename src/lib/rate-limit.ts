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

/** Keyed hash (HMAC-SHA256) so the stored value cannot be reversed by enumerating IPv4 space. */
export function hashIp(ip: string): string {
  const pepper = process.env.ENQUIRY_IP_PEPPER || 'ktc-enquiry-ip-pepper'
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
