import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadSchema } from '@/lib/validation/media'
import { bad, checkAndDecode } from './_lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return bad('Expected multipart/form-data.')
  }
  const file = form.get('file')
  if (!(file instanceof File)) return bad('Missing "file" field.')
  const parsed = uploadSchema.safeParse({
    category: form.get('category'),
    alt: form.get('alt') ?? undefined,
    caption: form.get('caption') ?? undefined,
  })
  if (!parsed.success) return bad(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '))

  const decoded = await checkAndDecode(file)
  if (decoded instanceof NextResponse) return decoded

  const { category, alt, caption } = parsed.data
  const path = `${category}/${crypto.randomUUID()}.${decoded.ext}`
  const admin = createAdminClient()
  const up = await admin.storage.from('media').upload(path, decoded.buffer, { contentType: decoded.mime })
  if (up.error) return bad('Storage upload failed.', 500)

  const { data, error } = await admin
    .from('media_assets')
    .insert({
      storage_path: path, bucket: 'media', category, alt: alt ?? null, caption: caption ?? null,
      mime_type: decoded.mime, width: decoded.width, height: decoded.height, size_bytes: decoded.size,
    })
    .select()
    .single()
  if (error) {
    await admin.storage.from('media').remove([path])
    return bad('Could not save media record.', 500)
  }
  return NextResponse.json(data, { status: 201 })
}
