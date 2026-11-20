'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/admin/fields'
import { canTransition, isEnquiryStatus } from '@/lib/admin/enquiries'

const idSchema = z.string().uuid()

export async function setEnquiryStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin()
  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Invalid enquiry.' }
  if (!isEnquiryStatus(status)) return { ok: false, error: 'Invalid status.' }
  const db = await createServerClient()
  const { data: cur, error: e1 } = await db.from('enquiries').select('status').eq('id', id).maybeSingle()
  if (e1 || !cur) return { ok: false, error: 'Enquiry not found.' }
  if (!canTransition(cur.status, status)) return { ok: false, error: `Cannot move from ${cur.status} to ${status}.` }
  const { error } = await db.from('enquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { ok: false, error: 'Could not update status.' }
  revalidatePath('/admin/enquiries')
  revalidatePath(`/admin/enquiries/${id}`)
  return { ok: true }
}

export async function saveEnquiryNotes(id: string, notes: string): Promise<ActionResult> {
  await requireAdmin()
  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Invalid enquiry.' }
  if (typeof notes !== 'string' || notes.length > 5000) return { ok: false, error: 'Notes must be 5000 characters or fewer.' }
  const db = await createServerClient()
  const { error } = await db
    .from('enquiries')
    .update({ internal_notes: notes.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: 'Could not save notes.' }
  revalidatePath(`/admin/enquiries/${id}`)
  return { ok: true }
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  await requireAdmin()
  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Invalid enquiry.' }
  const db = await createServerClient()
  const { data: row } = await db.from('enquiries').select('attachment_path').eq('id', id).maybeSingle()
  if (!row) return { ok: false, error: 'Enquiry not found.' }
  const { error } = await db.from('enquiries').delete().eq('id', id)
  if (error) return { ok: false, error: 'Could not delete enquiry.' }
  if (row.attachment_path) await db.storage.from('enquiry-attachments').remove([row.attachment_path])
  revalidatePath('/admin/enquiries')
  return { ok: true }
}
