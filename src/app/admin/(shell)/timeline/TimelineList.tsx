'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteMilestone, reorderTimeline, setMilestonePublished } from './actions'

type Row = { id: string; year: string; title: string; published: boolean; updated_at: string }

export function TimelineList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="timeline"
        labelKey="title"
        basePath="/admin/timeline"
        columns={[
          { key: 'year', header: 'Year' },
          { key: 'title', header: 'Title' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setMilestonePublished}
        onDelete={deleteMilestone}
      />
      <section aria-labelledby="ord" className="mt-10">
        <h2 id="ord" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the order items appear in.</p>
        <SortableList label="Timeline order" items={rows.map((r) => ({ id: r.id, label: r.title }))} onReorder={reorderTimeline} />
      </section>
    </>
  )
}
