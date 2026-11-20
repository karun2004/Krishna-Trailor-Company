import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { MediaLibrary } from '@/components/admin/MediaLibrary'
import { mediaPublicUrl, type LibraryAsset } from '@/lib/media-library'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  await requireAdmin()
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('media_assets')
    .select('id, storage_path, bucket, alt, caption, category, mime_type, width, height, size_bytes, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw new Error('Failed to load media')
  const base = env.NEXT_PUBLIC_SUPABASE_URL
  const initial: LibraryAsset[] = (data ?? []).map((r) => ({ ...r, url: mediaPublicUrl(base, r.bucket, r.storage_path) }))

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-8">
      <h1 className="font-display text-2xl font-semibold text-navy">Media library</h1>
      <p className="mt-1 text-sm text-black/70">Upload, organise and reuse images across the site.</p>
      <MediaLibrary initial={initial} supabaseUrl={base} />
    </main>
  )
}
