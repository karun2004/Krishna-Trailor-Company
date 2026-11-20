'use client'

import { EntityForm } from '@/components/admin/EntityForm'
import type { ActionResult, Field } from '@/lib/admin/fields'
import { divisionSchema } from './schema'

/** Thin client wrapper: the zod schema stays on the client side of the boundary. */
export function DivisionForm(props: {
  fields: Field[]
  initial?: Record<string, unknown>
  action: (values: unknown) => Promise<ActionResult>
}) {
  return <EntityForm schema={divisionSchema} successHref="/admin/divisions" {...props} />
}
