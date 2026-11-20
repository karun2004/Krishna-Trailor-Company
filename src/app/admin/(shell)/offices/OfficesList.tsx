'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteOffice, reorderOffices, setOfficePublished } from './actions'

type Row = { id: string; name: string; address: string | null; phone: string | null; is_head_office: boolean; published: boolean; updated_at: string }

export function OfficesList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="offices"
        labelKey="name"
        basePath="/admin/offices"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'address', header: 'Address' },
          { key: 'phone', header: 'Phone' },
          { key: 'is_head_office', header: 'Head office', kind: 'boolean' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setOfficePublished}
        onDelete={deleteOffice}
      />
      <section aria-labelledby="off-order" className="mt-10">
        <h2 id="off-order" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the order offices appear in.</p>
        <SortableList label="Office order" items={rows.map((r) => ({ id: r.id, label: r.name }))} onReorder={reorderOffices} />
      </section>
    </>
  )
}
