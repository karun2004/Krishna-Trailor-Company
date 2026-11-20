'use client'

import { useId, useState, useTransition } from 'react'
import { fieldErrors } from '@/lib/admin/fields'
import { saveSettings } from './actions'
import { settingsSchema } from './schema'

export type SettingsState = Record<
  'office_phone' | 'phones' | 'email' | 'whatsapp' | 'address' | 'map_url' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'twitter',
  string
>

const GROUPS: { title: string; fields: { name: keyof SettingsState; label: string; help?: string; textarea?: boolean; type?: string }[] }[] = [
  {
    title: 'Contact details',
    fields: [
      { name: 'office_phone', label: 'Office phone', type: 'tel' },
      { name: 'phones', label: 'Additional phones', textarea: true, help: 'One per line, as "Name: number".' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'whatsapp', label: 'WhatsApp', type: 'tel', help: 'Number with country code, e.g. +91 98765 43210.' },
      { name: 'address', label: 'Head-office address', textarea: true },
      { name: 'map_url', label: 'Map URL', help: 'Full https:// link to the head office on a map.' },
    ],
  },
  {
    title: 'Social links',
    fields: [
      { name: 'facebook', label: 'Facebook' },
      { name: 'instagram', label: 'Instagram' },
      { name: 'linkedin', label: 'LinkedIn' },
      { name: 'youtube', label: 'YouTube' },
      { name: 'twitter', label: 'X (Twitter)' },
    ],
  },
]

const inputCls = 'w-full rounded border border-navy/30 bg-white px-3 py-2 aria-[invalid=true]:border-red-700'

export function SettingsForm({ initial }: { initial: SettingsState }) {
  const uid = useId()
  const [state, setState] = useState<SettingsState>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    const parsed = settingsSchema.safeParse(state)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    startTransition(async () => {
      const res = await saveSettings(state)
      if (res.ok) setMessage({ ok: true, text: 'Settings saved' })
      else {
        setErrors(res.fieldErrors ?? {})
        setMessage({ ok: false, text: res.error })
      }
    })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-8" aria-busy={pending}>
      {message && (
        <p role={message.ok ? 'status' : 'alert'} className="rounded bg-blue px-3 py-2 text-sm text-navy">{message.text}</p>
      )}
      {GROUPS.map((g) => (
        <fieldset key={g.title} className="space-y-5">
          <legend className="mb-2 font-display text-lg font-semibold text-navy">{g.title}</legend>
          {g.fields.map((f) => {
            const id = `${uid}-${f.name}`
            const err = errors[f.name]
            const common = {
              id,
              name: f.name,
              value: state[f.name],
              'aria-invalid': err ? (true as const) : undefined,
              'aria-describedby': [f.help ? `${id}-help` : '', err ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined,
              onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setState((s) => ({ ...s, [f.name]: ev.target.value })),
              className: inputCls,
            }
            return (
              <div key={f.name} className="space-y-1">
                <label htmlFor={id} className="block text-sm font-medium">{f.label}</label>
                {f.textarea ? <textarea {...common} rows={3} /> : <input {...common} type={f.type ?? 'text'} />}
                {f.help && <p id={`${id}-help`} className="text-sm text-black/70">{f.help}</p>}
                {err && <p id={`${id}-err`} className="text-sm text-red-700">{err}</p>}
              </div>
            )
          })}
        </fieldset>
      ))}
      <button type="submit" disabled={pending}
        className="rounded bg-orange px-4 py-2 font-medium text-black hover:opacity-90 focus-visible:outline-2 focus-visible:outline-navy disabled:opacity-60">
        {pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
