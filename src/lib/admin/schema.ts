import { z } from 'zod'

/** Reusable zod building blocks for admin entity schemas (client- and server-safe). */
export const requiredText = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or fewer`)

/** '' / null / undefined -> null. */
export const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .nullish()
    .transform((v) => (v ? v : null))

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120, 'Slug must be 120 characters or fewer')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only')

/** Foreign key / media id: valid uuid or null. */
export const uuidOrNull = z
  .string()
  .uuid('Invalid selection')
  .nullish()
  .transform((v) => v ?? null)

export const intField = (min = 0, max = 1_000_000) =>
  z.number({ error: 'Enter a number' }).int('Enter a whole number').min(min).max(max)
