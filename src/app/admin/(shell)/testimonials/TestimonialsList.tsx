'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteTestimonial, reorderTestimonials, setTestimonialPublished } from './actions'

type Row = { id: string; author_name: string; company: string | null; approved: boolean; published: boolean; updated_at: string }

export function TestimonialsList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="testimonials"
        labelKey="author_name"
        basePath="/admin/testimonials"
        columns={[
          { key: 'author_name', header: 'Author' },
          { key: 'company', header: 'Company' },
          { key: 'approved', header: 'Approved', kind: 'boolean' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setTestimonialPublished}
        onDelete={deleteTestimonial}
      />
      <section aria-labelledby="order" className="mt-10">
        <h2 id="order" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the display order.</p>
        <SortableList label="Testimonial order" items={rows.map((r) => ({ id: r.id, label: r.author_name }))} onReorder={reorderTestimonials} />
      </section>
    </>
  )
}
