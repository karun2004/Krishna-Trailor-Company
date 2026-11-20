'use client'

import { EntityForm } from '@/components/admin/EntityForm'
import type { ActionResult, Field } from '@/lib/admin/fields'
import { projectSchema } from './schema'

export function ProjectForm(props: {
  fields: Field[]
  initial?: Record<string, unknown>
  action: (values: unknown) => Promise<ActionResult>
}) {
  return <EntityForm schema={projectSchema} successHref="/admin/projects" {...props} />
}
