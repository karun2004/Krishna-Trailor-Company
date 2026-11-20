import { z } from 'zod'

/** Optional http(s) URL; '' / null -> null. Rejects javascript:, ftp:, data: etc. */
export const optionalHttpUrl = z
  .string()
  .trim()
  .max(500, 'Must be 500 characters or fewer')
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => {
    if (v === null) return true
    try {
      const u = new URL(v)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }, 'Enter a full http:// or https:// URL')

/** Loose phone check: digits plus + ( ) - . and spaces, 6-20 digits. */
export function isLoosePhone(v: string): boolean {
  if (!/^[+\d()\-.\s]+$/.test(v)) return false
  const digits = v.replace(/\D/g, '').length
  return digits >= 6 && digits <= 15
}
