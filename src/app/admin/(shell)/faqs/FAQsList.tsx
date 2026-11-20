'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteFAQ, reorderFAQs, setFAQPublished } from './actions'

type Row = { id: string; question: string; published: boolean; updated_at: string }

export function FAQsList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="faqs"
        labelKey="question"
        basePath="/admin/faqs"
        columns={[
          { key: 'question', header: 'Question' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setFAQPublished}
        onDelete={deleteFAQ}
      />
      <section aria-labelledby="ord" className="mt-10">
        <h2 id="ord" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the order items appear in.</p>
        <SortableList label="FAQs order" items={rows.map((r) => ({ id: r.id, label: r.question }))} onReorder={reorderFAQs} />
      </section>
    </>
  )
}
