'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { fieldErrors, type ActionResult } from '@/lib/admin/fields'
import { createServerClient } from '@/lib/supabase/server'
import { parsePhoneLines, SOCIAL_KEYS, settingsSchema } from './schema'

const nullable = (v: string | null) => v ?? undefined

/**
 * Persists contact details as two site_settings rows: `contact` and `social` (upsert by key).
 * Existing keys we do not edit are preserved; cleared fields are removed.
 */
export async function saveSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the highlighted fields', fieldErrors: fieldErrors(parsed.error) }
  }
  const v = parsed.data
  const db = await createServerClient()
  const { data: existing, error: readErr } = await db.from('site_settings').select('key, value').in('key', ['contact', 'social'])
  if (readErr) return { ok: false, error: 'Could not save. Please try again.' }
  const prev = (k: string) => ((existing ?? []).find((r) => r.key === k)?.value ?? {}) as Record<string, unknown>

  const clean = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined && x !== ''))
  const contact = clean({
    ...prev('contact'),
    office_phone: nullable(v.office_phone),
    phones: parsePhoneLines(v.phones)?.map((p) => ({ name: p.name, number: p.number })),
    email: nullable(v.email),
    whatsapp: nullable(v.whatsapp),
    address: nullable(v.address),
    map_url: nullable(v.map_url),
  })
  if (Array.isArray(contact.phones) && contact.phones.length === 0) delete contact.phones
  const social = clean({
    ...prev('social'),
    ...Object.fromEntries(SOCIAL_KEYS.map((k) => [k, nullable(v[k])])),
  })

  const { error } = await db.from('site_settings').upsert(
    [
      { key: 'contact', value: contact },
      { key: 'social', value: social },
    ],
    { onConflict: 'key' },
  )
  if (error) return { ok: false, error: 'Could not save. Please try again.' }
  for (const p of ['/admin/settings', '/contact', '/']) revalidatePath(p)
  return { ok: true }
}
