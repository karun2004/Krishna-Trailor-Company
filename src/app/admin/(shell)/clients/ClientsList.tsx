'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteClient, reorderClients, setClientPublished } from './actions'

type Row = { id: string; name: string; website_url: string | null; published: boolean; updated_at: string }

export function ClientsList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="clients"
        labelKey="name"
        basePath="/admin/clients"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'website_url', header: 'Website' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setClientPublished}
        onDelete={deleteClient}
      />
      <section aria-labelledby="order" className="mt-10">
        <h2 id="order" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the display order.</p>
        <SortableList label="Client order" items={rows.map((r) => ({ id: r.id, label: r.name }))} onReorder={reorderClients} />
      </section>
    </>
  )
}
