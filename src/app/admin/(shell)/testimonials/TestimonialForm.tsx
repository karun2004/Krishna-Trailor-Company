'use client'

import { EntityForm } from '@/components/admin/EntityForm'
import type { ActionResult, Field } from '@/lib/admin/fields'
import { testimonialSchema } from './schema'

export function TestimonialForm(props: {
  fields: Field[]
  initial?: Record<string, unknown>
  action: (values: unknown) => Promise<ActionResult>
}) {
  return <EntityForm schema={testimonialSchema} successHref="/admin/testimonials" {...props} />
}
