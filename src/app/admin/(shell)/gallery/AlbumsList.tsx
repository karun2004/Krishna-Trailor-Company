'use client'

import { DataTable } from '@/components/admin/DataTable'
import { SortableList } from '@/components/admin/SortableList'
import { deleteAlbum, reorderAlbums, setAlbumPublished } from './actions'

type Row = { id: string; title: string; slug: string; published: boolean; updated_at: string }

export function AlbumsList({ rows }: { rows: Row[] }) {
  return (
    <>
      <DataTable
        rows={rows}
        entityLabel="albums"
        labelKey="title"
        basePath="/admin/gallery"
        columns={[
          { key: 'title', header: 'Title' },
          { key: 'slug', header: 'Slug' },
          { key: 'updated_at', header: 'Updated', kind: 'date' },
        ]}
        onSetPublished={setAlbumPublished}
        onDelete={deleteAlbum}
      />
      <section aria-labelledby="order" className="mt-10">
        <h2 id="order" className="font-display text-lg font-semibold text-navy">Display order</h2>
        <p className="mb-3 text-sm text-black/70">Use the arrows to change the display order.</p>
        <SortableList label="Album order" items={rows.map((r) => ({ id: r.id, label: r.title }))} onReorder={reorderAlbums} />
      </section>
    </>
  )
}
