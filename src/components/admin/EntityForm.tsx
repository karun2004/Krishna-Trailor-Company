'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import type { z } from 'zod'
import {
  coerceValues,
  fieldErrors,
  slugify,
  toFormState,
  type ActionResult,
  type Field,
  type FormState,
} from '@/lib/admin/fields'
import { MediaPicker } from './MediaPicker'

export type EntityFormProps<T extends Record<string, unknown>> = {
  /** Same zod schema the Server Action validates with (client check is UX only). */
  schema: z.ZodType<T, unknown>
  fields: Field[]
  /** Existing row (edit) — keys matching field names. Omit for create. */
  initial?: Record<string, unknown>
  /** Server Action (bind the id for edit): receives schema-shaped values, returns ActionResult. */
  action: (values: unknown) => Promise<ActionResult>
  /** Navigated to after a successful save. */
  successHref: string
  cancelHref?: string
  submitLabel?: string
}

const inputCls = 'w-full rounded border border-navy/30 bg-white px-3 py-2 aria-[invalid=true]:border-red-700'

export function EntityForm<T extends Record<string, unknown>>({
  schema, fields, initial, action, successHref, cancelHref = successHref, submitLabel = 'Save',
}: EntityFormProps<T>) {
  const uid = useId()
  const router = useRouter()
  const isEdit = initial !== undefined
  const [state, setState] = useState<FormState>(() => toFormState(fields, initial))
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function set(name: string, value: string | boolean) {
    setState((s) => ({ ...s, [name]: value }))
  }
  function onText(f: Field, value: string) {
    setState((s) => {
      const next = { ...s, [f.name]: value }
      // keep any untouched slug fields in sync with their source field
      for (const sf of fields) {
        if (sf.type === 'slug' && sf.from === f.name && !slugTouched) next[sf.name] = slugify(value)
      }
      return next
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const values = coerceValues(fields, state)
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    startTransition(async () => {
      const res = await action(values)
      if (res.ok) {
        router.push(successHref)
        router.refresh()
        return
      }
      setErrors(res.fieldErrors ?? {})
      setFormError(res.error)
    })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={pending}>
      {formError && <p role="alert" className="rounded bg-blue px-3 py-2 text-sm text-navy">{formError}</p>}
      {fields.map((f) => {
        const id = `${uid}-${f.name}`
        const err = errors[f.name]
        const describedBy = [f.help ? `${id}-help` : '', err ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
        const common = { id, name: f.name, 'aria-invalid': err ? true : undefined, 'aria-describedby': describedBy } as const
        const v = state[f.name]
        let control: React.ReactNode
        switch (f.type) {
          case 'textarea':
            control = <textarea {...common} rows={f.rows ?? 4} placeholder={f.placeholder} value={String(v ?? '')} onChange={(e) => onText(f, e.target.value)} className={inputCls} />
            break
          case 'number':
            control = <input {...common} type="number" inputMode="numeric" min={f.min} max={f.max} step={f.step} placeholder={f.placeholder} value={String(v ?? '')} onChange={(e) => set(f.name, e.target.value)} className={inputCls} />
            break
          case 'select':
            control = (
              <select {...common} value={String(v ?? '')} onChange={(e) => set(f.name, e.target.value)} className={inputCls}>
                <option value="">{f.emptyLabel ?? 'None'}</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )
            break
          case 'slug':
            control = <input {...common} type="text" autoCapitalize="none" spellCheck={false} placeholder={f.placeholder} value={String(v ?? '')}
              onChange={(e) => { setSlugTouched(true); set(f.name, e.target.value) }} className={`${inputCls} font-mono`} />
            break
          case 'media':
            control = <MediaPicker id={id} label={f.label} category={f.category} value={(v as string) || null} onChange={(m) => set(f.name, m ?? '')} error={err} />
            break
          case 'boolean':
            return (
              <div key={f.name}>
                <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
                  <input {...common} type="checkbox" checked={v === true} onChange={(e) => set(f.name, e.target.checked)} className="h-4 w-4 accent-orange" />
                  {f.label}
                </label>
                {f.help && <p id={`${id}-help`} className="mt-1 text-sm text-black/70">{f.help}</p>}
                {err && <p id={`${id}-err`} className="mt-1 text-sm text-red-700">{err}</p>}
              </div>
            )
          default:
            control = <input {...common} type="text" placeholder={f.placeholder} value={String(v ?? '')} onChange={(e) => onText(f, e.target.value)} className={inputCls} />
        }
        return (
          <div key={f.name} className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium">{f.label}</label>
            {control}
            {f.help && <p id={`${id}-help`} className="text-sm text-black/70">{f.help}</p>}
            {err && f.type !== 'media' && <p id={`${id}-err`} className="text-sm text-red-700">{err}</p>}
          </div>
        )
      })}
      <div className="flex gap-3">
        <button type="submit" disabled={pending}
          className="rounded bg-orange px-4 py-2 font-medium text-black hover:opacity-90 focus-visible:outline-2 focus-visible:outline-navy disabled:opacity-60">
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link href={cancelHref} className="rounded border border-navy/20 px-4 py-2 font-medium text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange">
          Cancel
        </Link>
      </div>
    </form>
  )
}
