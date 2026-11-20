'use client'

import { DataTable } from '@/components/admin/DataTable'
import { deleteSeo, setSeoPublished } from './actions'

type Row = { id: string; page_key: string; slug: string | null; title: string | null; published: boolean; updated_at: string }

export function SeoList({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      entityLabel="pages"
      labelKey="page_key"
      basePath="/admin/seo"
      columns={[
        { key: 'page_key', header: 'Page' },
        { key: 'slug', header: 'Path' },
        { key: 'title', header: 'Title' },
        { key: 'updated_at', header: 'Updated', kind: 'date' },
      ]}
      onSetPublished={setSeoPublished}
      onDelete={deleteSeo}
    />
  )
}
