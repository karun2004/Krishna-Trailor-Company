import { z } from 'zod'
import { optionalText } from '@/lib/admin/schema'
import { isLoosePhone, optionalHttpUrl } from './validators'

const phone = z
  .string()
  .trim()
  .max(30, 'Must be 30 characters or fewer')
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isLoosePhone(v), 'Enter a valid phone number')

const email = z
  .string()
  .trim()
  .max(320)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address')

/** One "Name: number" (or bare number) per line. */
export function parsePhoneLines(text: string): { name: string; number: string }[] | null {
  const out: { name: string; number: string }[] = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const i = line.lastIndexOf(':')
    const name = i >= 0 ? line.slice(0, i).trim() : ''
    const number = (i >= 0 ? line.slice(i + 1) : line).trim()
    if (!isLoosePhone(number) || name.length > 100) return null
    out.push({ name, number })
  }
  return out
}

export const phonesText = z
  .string()
  .max(2000, 'Too long')
  .nullish()
  .transform((v) => v ?? '')
  .refine((v) => parsePhoneLines(v) !== null, 'One per line as "Name: number"; numbers may use digits, spaces, + ( ) -')

export const settingsSchema = z.object({
  office_phone: phone,
  phones: phonesText,
  email,
  whatsapp: phone,
  address: optionalText(500),
  map_url: optionalHttpUrl,
  facebook: optionalHttpUrl,
  instagram: optionalHttpUrl,
  linkedin: optionalHttpUrl,
  youtube: optionalHttpUrl,
  twitter: optionalHttpUrl,
})
export type SettingsInput = z.infer<typeof settingsSchema>

export const SOCIAL_KEYS = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter'] as const
