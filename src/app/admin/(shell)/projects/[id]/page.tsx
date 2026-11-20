import { notFound } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { saveProject } from '../actions'
import { ProjectForm } from '../ProjectForm'
import { projectFields } from '../schema'
import { loadMediaItems } from '../_media/loader'
import { ProjectImages } from '../ProjectImages'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const db = await createServerClient()
  const [{ data: row }, { data: divisions }] = await Promise.all([
    db.from('projects').select('*').eq('id', id).maybeSingle(),
    db.from('business_divisions').select('id, name').order('sort_order'),
  ])
  if (!row) notFound()
  const images = await loadMediaItems('project_images', 'project_id', id)
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Edit project</h1>
      <ProjectForm fields={projectFields(divisions ?? [])} initial={row} action={saveProject.bind(null, id)} />
      <ProjectImages key={images.map((i) => i.id + i.phase + i.caption).join()} projectId={id} items={images} />
    </main>
  )
}
