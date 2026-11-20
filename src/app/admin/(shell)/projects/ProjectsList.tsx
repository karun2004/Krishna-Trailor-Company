'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteProject, reorderProjects, setProjectPublished } from './actions'

type Row = { id: string; title: string; slug: string; location: string | null; featured: boolean; published: boolean; updated_at: string }

export function ProjectsList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="projects"
        labelKey="title"
        basePath="/admin/projects"
        columns={[
          { key: 'title', header: 'Title' },
          { key: 'slug', header: 'Slug' },
          { key: 'location', header: 'Location' },
          { key: 'featured', header: 'Featured', kind: 'boolean' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setProjectPublished}
        onDelete={deleteProject}
      />
      <section aria-labelledby="order" className="mt-10">
        <h2 id="order" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the display order.</p>
        <SortableList label="Project order" items={rows.map((r) => ({ id: r.id, label: r.title }))} onReorder={reorderProjects} />
      </section>
    </>
  )
}
