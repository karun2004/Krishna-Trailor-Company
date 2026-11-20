import { notFound } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { saveAlbum } from '../actions'
import { AlbumForm } from '../AlbumForm'
import { albumFields } from '../schema'
import { loadMediaItems } from '../../projects/_media/loader'
import { AlbumMedia } from '../AlbumMedia'

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const db = await createServerClient()
  const [{ data: row }, { data: divisions }] = await Promise.all([
    db.from('gallery_albums').select('*').eq('id', id).maybeSingle(),
    db.from('business_divisions').select('id, name').order('sort_order'),
  ])
  if (!row) notFound()
  const items = await loadMediaItems('gallery_album_media', 'album_id', id)
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Edit album</h1>
      <AlbumForm fields={albumFields(divisions ?? [])} initial={row} action={saveAlbum.bind(null, id)} />
      <AlbumMedia key={items.map((i) => i.id + i.caption).join()} albumId={id} items={items} />
    </main>
  )
}
