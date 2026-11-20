'use client'

import { EntityForm } from '@/components/admin/EntityForm'
import type { ActionResult, Field } from '@/lib/admin/fields'
import { albumSchema } from './schema'

export function AlbumForm(props: {
  fields: Field[]
  initial?: Record<string, unknown>
  action: (values: unknown) => Promise<ActionResult>
}) {
  return <EntityForm schema={albumSchema} successHref="/admin/gallery" {...props} />
}
