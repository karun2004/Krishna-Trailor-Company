import { requireAdmin } from '@/lib/auth'
import { MEDIA_SLOTS } from '@/lib/media-slots'
import { staticMedia } from '@/lib/queries/slots'
import { createServerClient } from '@/lib/supabase/server'
import { saveEntityMedia } from '@/lib/admin/section-actions'
import { SlotCard } from './SlotCard'

export default async function PageImagesPage() {
  await requireAdmin()
  const db = await createServerClient()
  const { data, error } = await db.from('page_content').select('page_key, block_key, media_id').in('page_key', [...new Set(MEDIA_SLOTS.map((s) => s.page))])
  if (error) throw new Error('Failed to load page images')
  const current = new Map((data ?? []).map((r) => [`${r.page_key}/${r.block_key}`, r.media_id as string | null]))
  const [fleet, services, divisions] = await Promise.all([
    db.from('fleet_items').select('id, name, main_media_id').order('sort_order'),
    db.from('services').select('id, name, main_media_id').order('sort_order'),
    db.from('business_divisions').select('id, name, hero_media_id').order('sort_order'),
  ])
  const entityGroups = [
    { title: 'Fleet cards', kind: 'fleet', rows: (fleet.data ?? []).map((r) => ({ id: r.id as string, name: r.name as string, media: r.main_media_id as string | null })) },
    { title: 'Service cards', kind: 'service', rows: (services.data ?? []).map((r) => ({ id: r.id as string, name: r.name as string, media: r.main_media_id as string | null })) },
    { title: 'Division panels (Home)', kind: 'division', rows: (divisions.data ?? []).map((r) => ({ id: r.id as string, name: r.name as string, media: r.hero_media_id as string | null })) },
  ]
  const groups = [...new Set(MEDIA_SLOTS.map((s) => s.pageLabel))]
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <h1 className="mb-2 font-display text-2xl font-semibold text-navy">Page images</h1>
      <p className="mb-6 max-w-2xl text-sm text-black/70">
        Every picture container on the public pages, by page. Upload photos in <a className="underline" href="/admin/media">Media</a>, then choose them here.
        Fleet, service and division cards are at the bottom. Project photos are managed in Gallery. Changes show on the site straight away.
      </p>
      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g} aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className="mb-3 font-display text-lg font-semibold text-navy">{g}</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {MEDIA_SLOTS.filter((s) => s.pageLabel === g).map((s) => (
                <SlotCard
                  key={s.id}
                  slotId={s.id}
                  label={s.label}
                  aspect={s.aspect}
                  file={s.file}
                  fallbackExists={staticMedia(s.file) !== null}
                  initialMediaId={current.get(`${s.page}/${s.block}`) ?? null}
                />
              ))}
            </ul>
          </section>
        ))}
        {entityGroups.map((g) => g.rows.length > 0 && (
          <section key={g.kind} aria-labelledby={`e-${g.kind}`}>
            <h2 id={`e-${g.kind}`} className="mb-3 font-display text-lg font-bold uppercase text-black">{g.title}</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {g.rows.map((r) => (
                <SlotCard key={r.id} slotId={`${g.kind}/${r.id}`} label={r.name} aspect="4/3" file="" fallbackExists={false} initialMediaId={r.media}
                  save={saveEntityMedia.bind(null, g.kind, r.id)} note={r.media ? 'Showing the image chosen here' : 'Using the default photo, or a placeholder if there is none'} />
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-black/70">Need an extra block (text, photos or videos) anywhere? Use <a className="underline" href="/admin/sections">Sections</a>.</p>
    </main>
  )
}
