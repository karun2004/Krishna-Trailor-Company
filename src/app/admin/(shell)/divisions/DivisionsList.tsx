'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteDivision, reorderDivisions, setDivisionPublished } from './actions'

type Row = { id: string; name: string; slug: string; tagline: string | null; published: boolean; updated_at: string }

export function DivisionsList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="divisions"
        labelKey="name"
        basePath="/admin/divisions"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'slug', header: 'Slug' },
          { key: 'tagline', header: 'Tagline' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setDivisionPublished}
        onDelete={deleteDivision}
      />
      <section aria-labelledby="ord" className="mt-10">
        <h2 id="ord" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the order items appear in.</p>
        <SortableList label="Divisions order" items={rows.map((r) => ({ id: r.id, label: r.name }))} onReorder={reorderDivisions} />
      </section>
    </>
  )
}
