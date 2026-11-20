'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteFleetItem, reorderFleet, setFleetItemPublished } from './actions'

type Row = { id: string; name: string; category: string; featured: boolean; published: boolean; updated_at: string }

export function FleetList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="fleet"
        labelKey="name"
        basePath="/admin/fleet"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'category', header: 'Category' },
          { key: 'featured', header: 'Featured', kind: 'boolean' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setFleetItemPublished}
        onDelete={deleteFleetItem}
      />
      <section aria-labelledby="ord" className="mt-10">
        <h2 id="ord" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the order items appear in.</p>
        <SortableList label="Fleet order" items={rows.map((r) => ({ id: r.id, label: r.name }))} onReorder={reorderFleet} />
      </section>
    </>
  )
}
