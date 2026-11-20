import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { saveAlbum } from '../actions'
import { AlbumForm } from '../AlbumForm'
import { albumFields } from '../schema'

export default async function NewAlbumPage() {
  await requireAdmin()
  const db = await createServerClient()
  const { data: divisions } = await db.from('business_divisions').select('id, name').order('sort_order')
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New album</h1>
      <AlbumForm fields={albumFields(divisions ?? [])} action={saveAlbum.bind(null, null)} />
    </main>
  )
}
