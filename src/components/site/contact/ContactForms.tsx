'use client'

import { useId, useRef, useState } from 'react'
import { Button } from '../Button'
import { cn } from '../cn'
import {
  ENQUIRY_ATTACHMENT_MIME,
  attachmentMetaSchema,
  fieldErrors,
  industrialEnquirySchema,
  travelEnquirySchema,
} from '@/lib/validation/enquiry'

export type EnquiryKind = 'industrial' | 'travel'
type Errors = Record<string, string>
type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success'; kind: EnquiryKind }
  | { state: 'error'; message: string; tone: 'error' | 'rate' }

const ACCEPT = [...Object.keys(ENQUIRY_ATTACHMENT_MIME), '.pdf'].join(',')
const input =
  'min-h-11 w-full border border-black/40 bg-white px-4 py-3 text-base text-black placeholder:text-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] aria-[invalid=true]:border-red-700'

function Field({
  name, label, error, required, hint, children,
}: {
  name: string; label: string; error?: string; required?: boolean; hint?: string
  children: (p: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string; 'aria-required'?: boolean }) => React.ReactNode
}) {
  const uid = useId()
  const id = `${uid}-${name}`
  const errId = `${id}-err`
  const hintId = `${id}-hint`
  const describedBy = [error ? errId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.14em]">
        {label}{required && <span aria-hidden="true"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy, 'aria-required': required || undefined })}
      {hint && <p id={hintId} className="text-xs text-black/70">{hint}</p>}
      {error && <p id={errId} data-field-error={name} className="text-sm font-medium text-red-700">{error}</p>}
    </div>
  )
}

export function ContactForms({ initialType = 'industrial' }: { initialType?: EnquiryKind }) {
  const [kind, setKind] = useState<EnquiryKind>(initialType)
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const [errors, setErrors] = useState<Errors>({})
  const [file, setFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const submitting = status.state === 'submitting'

  function switchKind(k: EnquiryKind) {
    if (submitting || k === kind) return
    setKind(k)
    setErrors({})
    setFile(null)
    setStatus({ state: 'idle' })
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (!f) return setErrors((p) => omit(p, 'attachment'))
    const r = attachmentMetaSchema.safeParse({ type: f.type, size: f.size })
    setErrors((p) => (r.success ? omit(p, 'attachment') : { ...p, attachment: r.error.issues[0].message }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const raw: Record<string, string> = {}
    for (const [k, v] of fd.entries()) if (typeof v === 'string') raw[k] = v

    const result =
      kind === 'industrial'
        ? industrialEnquirySchema.safeParse({ ...raw, attachment: file ? { type: file.type, size: file.size } : undefined })
        : travelEnquirySchema.safeParse(raw)
    if (!result.success) {
      const errs = fieldErrors(result.error)
      setErrors(errs)
      setStatus({ state: 'error', tone: 'error', message: 'Please check the highlighted fields and try again.' })
      requestAnimationFrame(() => {
        const first = Object.keys(errs).find((k) => form.querySelector(`[name="${k}"]`)) ?? Object.keys(errs)[0]
        ;(form.querySelector(`[name="${first}"]`) as HTMLElement | null)?.focus()
      })
      return
    }

    const body = new FormData()
    body.set('type', kind)
    for (const [k, v] of Object.entries(raw)) if (v !== '') body.set(k, v)
    if (kind === 'industrial' && file) body.set('attachment', file)

    setErrors({})
    setStatus({ state: 'submitting' })
    try {
      const res = await fetch('/api/enquiry', { method: 'POST', body })
      if (res.ok) {
        form.reset()
        setFile(null)
        setStatus({ state: 'success', kind })
        return
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Errors }
      if (res.status === 429) {
        const secs = Number(res.headers.get('Retry-After'))
        const wait = Number.isFinite(secs) && secs > 0 ? ` You can try again in about ${Math.max(1, Math.ceil(secs / 60))} minute(s).` : ''
        setStatus({
          state: 'error', tone: 'rate',
          message: `${data.error ?? 'You have sent several enquiries recently. Please wait a few minutes before trying again, or call us directly.'}${wait}`,
        })
      } else if (res.status === 400 && data.fields) {
        setErrors(data.fields)
        setStatus({ state: 'error', tone: 'error', message: data.error ?? 'Please check the highlighted fields and try again.' })
      } else {
        setStatus({ state: 'error', tone: 'error', message: data.error ?? 'Something went wrong. Please try again, or call us directly.' })
      }
    } catch {
      setStatus({ state: 'error', tone: 'error', message: 'We could not reach the server. Check your connection and try again, or call us directly.' })
    }
  }

  const tab = (k: EnquiryKind, label: string) => (
    <button
      type="button" role="tab" id={`tab-${k}`} aria-selected={kind === k} aria-controls="enquiry-panel"
      tabIndex={kind === k ? 0 : -1} onClick={() => switchKind(k)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault()
          const next = k === 'industrial' ? 'travel' : 'industrial'
          switchKind(next)
          document.getElementById(`tab-${next}`)?.focus()
        }
      }}
      className={cn(
        'min-h-11 flex-1 px-4 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        kind === k ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/10',
      )}
    >{label}</button>
  )

  const message = status.state === 'error' ? status.message : status.state === 'success' ? 'Enquiry sent' : status.state === 'submitting' ? 'Sending your enquiry...' : ''

  return (
    <div>
      <div role="tablist" aria-label="Enquiry type" className="flex border border-black">
        {tab('industrial', 'Industrial enquiry')}
        {tab('travel', 'Travel enquiry')}
      </div>

      <div role="status" aria-live="polite" className="sr-only" data-testid="form-status">{message}</div>

      <div id="enquiry-panel" role="tabpanel" aria-labelledby={`tab-${kind}`} className="mt-6">
        {status.state === 'success' ? (
          <div className="border-2 border-black bg-white p-6 text-black" data-testid="enquiry-success">
            <h3 className="font-display text-2xl uppercase">Thank you, enquiry received</h3>
            <p className="mt-3">
              Our team will contact you on the phone number you provided as soon as possible.
              For anything urgent, please call us directly.
            </p>
            <Button className="mt-6" variant="dark" onClick={() => setStatus({ state: 'idle' })}>Send another enquiry</Button>
          </div>
        ) : (
          <form ref={formRef} key={kind} onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-label={kind === 'industrial' ? 'Industrial enquiry form' : 'Travel enquiry form'}>
            {status.state === 'error' && (
              <p
                role="alert" data-testid="form-error"
                className={cn('border-l-4 p-4 text-sm font-medium', status.tone === 'rate' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-red-700 bg-red-50 text-red-900')}
              >{status.message}</p>
            )}

            {/* Honeypot: hidden from users and assistive tech; bots fill it. */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
              <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            {kind === 'industrial' ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="name" label="Name" required error={errors.name}>{(p) => <input {...p} name="name" autoComplete="name" className={input} />}</Field>
                  <Field name="company" label="Company" error={errors.company}>{(p) => <input {...p} name="company" autoComplete="organization" className={input} />}</Field>
                  <Field name="phone" label="Phone" required error={errors.phone}>{(p) => <input {...p} name="phone" type="tel" autoComplete="tel" className={input} />}</Field>
                  <Field name="email" label="Email" error={errors.email}>{(p) => <input {...p} name="email" type="email" autoComplete="email" className={input} />}</Field>
                  <Field name="division" label="Service" error={errors.division}>
                    {(p) => (
                      <select {...p} name="division" defaultValue="heavy_haulage" className={input}>
                        <option value="heavy_haulage">Heavy haulage</option>
                        <option value="krishna_trailor">Trailer transport</option>
                      </select>
                    )}
                  </Field>
                  <Field name="cargoType" label="Cargo type" required error={errors.cargoType}>{(p) => <input {...p} name="cargoType" className={input} />}</Field>
                  <Field name="weight" label="Weight" error={errors.weight}>{(p) => <input {...p} name="weight" placeholder="e.g. 45 tonnes" className={input} />}</Field>
                  <Field name="dimensions" label="Dimensions" error={errors.dimensions}>{(p) => <input {...p} name="dimensions" placeholder="L x W x H" className={input} />}</Field>
                  <Field name="pickup" label="Pickup location" required error={errors.pickup}>{(p) => <input {...p} name="pickup" className={input} />}</Field>
                  <Field name="destination" label="Destination" required error={errors.destination}>{(p) => <input {...p} name="destination" className={input} />}</Field>
                  <Field name="requiredDate" label="Required date" error={errors.requiredDate}>{(p) => <input {...p} name="requiredDate" type="date" className={input} />}</Field>
                </div>
                <Field name="message" label="Message" error={errors.message}>{(p) => <textarea {...p} name="message" rows={4} className={input} />}</Field>
                <Field name="attachment" label="Attachment" error={errors.attachment} hint="Optional. JPEG, PNG, WebP, AVIF or PDF, up to 10MB.">
                  {(p) => (
                    <input {...p} ref={fileRef} name="attachment-picker" type="file" accept={ACCEPT} onChange={onFileChange}
                      className={cn(input, 'file:mr-4 file:border-0 file:bg-black file:px-4 file:py-2 file:text-white')} />
                  )}
                </Field>
              </>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="name" label="Name" required error={errors.name}>{(p) => <input {...p} name="name" autoComplete="name" className={input} />}</Field>
                  <Field name="phone" label="Phone" required error={errors.phone}>{(p) => <input {...p} name="phone" type="tel" autoComplete="tel" className={input} />}</Field>
                  <Field name="requirement" label="Requirement" required error={errors.requirement}>{(p) => <input {...p} name="requirement" placeholder="e.g. Sleeper bus for a wedding" className={input} />}</Field>
                  <Field name="passengerCount" label="Passengers" error={errors.passengerCount}>{(p) => <input {...p} name="passengerCount" type="number" inputMode="numeric" min={1} max={500} className={input} />}</Field>
                  <Field name="route" label="Route" error={errors.route}>{(p) => <input {...p} name="route" placeholder="From and to" className={input} />}</Field>
                  <Field name="travelDate" label="Travel date" error={errors.travelDate}>{(p) => <input {...p} name="travelDate" type="date" className={input} />}</Field>
                </div>
                <Field name="message" label="Message" error={errors.message}>{(p) => <textarea {...p} name="message" rows={4} className={input} />}</Field>
              </>
            )}

            <div>
              <Button type="submit" variant="dark" disabled={submitting} aria-disabled={submitting}>
                {submitting ? 'Sending...' : 'Send enquiry'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function omit(o: Errors, k: string): Errors {
  const { [k]: _drop, ...rest } = o
  void _drop
  return rest
}
