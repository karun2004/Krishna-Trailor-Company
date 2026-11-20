'use client'

import { DataTable } from '@/components/admin/DataTable'
import { setBlockPublished } from './actions'

type Row = { id: string; block_key: string; preview: string; published: boolean; updated_at: string }

export function BlocksList({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      entityLabel="blocks"
      labelKey="block_key"
      basePath="/admin/homepage"
      columns={[
        { key: 'block_key', header: 'Block' },
        { key: 'preview', header: 'Content' },
        { key: 'updated_at', header: 'Updated', kind: 'date' },
      ]}
      onSetPublished={setBlockPublished}
    />
  )
}
