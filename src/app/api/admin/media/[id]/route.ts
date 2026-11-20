import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { patchSchema } from '@/lib/validation/media'
import { bad, checkAndDecode } from '../_lib'

export const runtime = 'nodejs'
type Ctx = { params: Promise<{ id: string }> }

const idOk = (id: string) => z.uuid().safeParse(id).success

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!idOk(id)) return bad('Invalid id.')
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return bad(parsed.error.issues.map((i) => i.message).join('; '))
  const { data, error } = await createAdminClient()
    .from('media_assets').update(parsed.data).eq('id', id).select().maybeSingle()
  if (error) return bad('Could not update media.', 500)
  if (!data) return bad('Media not found.', 404)
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!idOk(id)) return bad('Invalid id.')
  const admin = createAdminClient()
  const { data: row } = await admin.from('media_assets').select('storage_path,bucket').eq('id', id).maybeSingle()
  if (!row) return bad('Media not found.', 404)
  // Row first: referencing FKs are ON DELETE SET NULL, so content falls back to a placeholder.
  const del = await admin.from('media_assets').delete().eq('id', id)
  if (del.error) return bad('Could not delete media.', 500)
  await admin.storage.from(row.bucket).remove([row.storage_path])
  return NextResponse.json({ deleted: id })
}

/** Replace the file while keeping the asset id (new storage path, since extension may change). */
export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!idOk(id)) return bad('Invalid id.')
  const admin = createAdminClient()
  const { data: row } = await admin.from('media_assets').select('storage_path,bucket,category').eq('id', id).maybeSingle()
  if (!row) return bad('Media not found.', 404)
  let form: FormData
  try { form = await req.formData() } catch { return bad('Expected multipart/form-data.') }
  const file = form.get('file')
  if (!(file instanceof File)) return bad('Missing "file" field.')
  const decoded = await checkAndDecode(file)
  if (decoded instanceof NextResponse) return decoded

  const path = `${row.category}/${crypto.randomUUID()}.${decoded.ext}`
  const up = await admin.storage.from(row.bucket).upload(path, decoded.buffer, { contentType: decoded.mime })
  if (up.error) return bad('Storage upload failed.', 500)
  const { data, error } = await admin.from('media_assets')
    .update({ storage_path: path, mime_type: decoded.mime, width: decoded.width, height: decoded.height, size_bytes: decoded.size })
    .eq('id', id).select().single()
  if (error) {
    await admin.storage.from(row.bucket).remove([path])
    return bad('Could not save media record.', 500)
  }
  await admin.storage.from(row.bucket).remove([row.storage_path])
  return NextResponse.json(data)
}
