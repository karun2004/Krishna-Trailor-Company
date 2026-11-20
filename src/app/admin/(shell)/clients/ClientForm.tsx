'use client'

import { EntityForm } from '@/components/admin/EntityForm'
import type { ActionResult, Field } from '@/lib/admin/fields'
import { clientSchema } from './schema'

export function ClientForm(props: {
  fields: Field[]
  initial?: Record<string, unknown>
  action: (values: unknown) => Promise<ActionResult>
}) {
  return <EntityForm schema={clientSchema} successHref="/admin/clients" {...props} />
}
