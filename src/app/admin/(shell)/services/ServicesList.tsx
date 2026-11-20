'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteService, reorderServices, setServicePublished } from './actions'

type Row = { id: string; name: string; slug: string; category: string | null; featured: boolean; published: boolean; updated_at: string }

export function ServicesList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="services"
        labelKey="name"
        basePath="/admin/services"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'slug', header: 'Slug' },
          { key: 'category', header: 'Category' },
          { key: 'featured', header: 'Featured', kind: 'boolean' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setServicePublished}
        onDelete={deleteService}
      />
      <section aria-labelledby="svc-order" className="mt-10">
        <h2 id="svc-order" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the order services appear in.</p>
        <SortableList label="Service order" items={rows.map((r) => ({ id: r.id, label: r.name }))} onReorder={reorderServices} />
      </section>
    </>
  )
}
