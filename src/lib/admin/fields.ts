import type { z } from 'zod'

/** Result every admin Server Action returns (never throws for expected failures). */
export type ActionResult<D = Record<never, never>> =
  | ({ ok: true } & D)
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export type SelectOption = { value: string; label: string }

type Base = { name: string; label: string; help?: string; placeholder?: string }

/**
 * Serializable field descriptors (safe to build in a Server Component and pass to <EntityForm>).
 * `name` must match a key of the zod schema.
 */
export type Field =
  | (Base & { type: 'text' })
  | (Base & { type: 'textarea'; rows?: number })
  | (Base & { type: 'number'; min?: number; max?: number; step?: number })
  | (Base & { type: 'boolean' })
  | (Base & { type: 'select'; options: SelectOption[]; emptyLabel?: string })
  /** Auto-derives from the `from` field while creating, until edited by hand. */
  | (Base & { type: 'slug'; from: string })
  /** Stores a media_assets.id; opens the MediaPicker. */
  | (Base & { type: 'media'; category?: string })

export type FormState = Record<string, string | boolean>

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/** Row values (nullable DB columns) -> controlled-input state. */
export function toFormState(fields: Field[], initial: Record<string, unknown> = {}): FormState {
  const out: FormState = {}
  for (const f of fields) {
    const v = initial[f.name]
    if (f.type === 'boolean') out[f.name] = v === true
    else out[f.name] = v === null || v === undefined ? '' : String(v)
  }
  return out
}

/** Controlled-input state -> typed values for the zod schema. Empty select/media/number -> null. */
export function coerceValues(fields: Field[], state: FormState): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    const v = state[f.name]
    if (f.type === 'boolean') out[f.name] = v === true
    else if (f.type === 'number') out[f.name] = v === '' || v === undefined ? null : Number(v)
    else if (f.type === 'select' || f.type === 'media') out[f.name] = v === '' || v === undefined ? null : v
    else out[f.name] = typeof v === 'string' ? v : ''
  }
  return out
}

/** First message per field path. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : '_form'
    if (!(key in out)) out[key] = issue.message
  }
  return out
}

/** Swap item at `index` by `delta` (-1 up, +1 down); returns the same array if out of range. */
export function moveItem<T>(list: readonly T[], index: number, delta: -1 | 1): T[] {
  const to = index + delta
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return [...list]
  const next = [...list]
  ;[next[index], next[to]] = [next[to]!, next[index]!]
  return next
}

/** Case-insensitive substring match across the given keys. Empty query matches all. */
export function matchesQuery(row: Record<string, unknown>, keys: readonly string[], query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return keys.some((k) => {
    const v = row[k]
    return v !== null && v !== undefined && String(v).toLowerCase().includes(q)
  })
}
