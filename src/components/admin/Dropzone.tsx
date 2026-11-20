'use client'

import { useId, useRef, useState } from 'react'
import { MEDIA_CATEGORIES, validateFile } from '@/lib/validation/media'
import { altFromFilename, humanCategory, type LibraryAsset } from '@/lib/media-library'

type Item = { key: number; name: string; progress: number; status: 'uploading' | 'done' | 'error'; message?: string }

function uploadOne(file: File, category: string, onProgress: (p: number) => void) {
  return new Promise<LibraryAsset>((resolve, reject) => {
    const fd = new FormData()
    fd.set('file', file)
    fd.set('category', category)
    fd.set('alt', altFromFilename(file.name))
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/media')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
    xhr.onerror = () => reject(new Error('Network error. Check your connection and try again.'))
    xhr.onload = () => {
      let body: { error?: string } & Partial<LibraryAsset> = {}
      try { body = JSON.parse(xhr.responseText) } catch { /* non-JSON */ }
      if (xhr.status === 201) resolve(body as LibraryAsset)
      else reject(new Error(body.error ?? `Upload failed (${xhr.status}).`))
    }
    xhr.send(fd)
  })
}

/** Drag-and-drop / click-to-choose multi-file uploader with per-file progress and errors. */
export function Dropzone({ onUploaded }: { onUploaded: (raw: LibraryAsset) => void }) {
  const [category, setCategory] = useState<string>('gallery')
  const [items, setItems] = useState<Item[]>([])
  const [over, setOver] = useState(false)
  const seq = useRef(0)
  const catId = useId()

  const patch = (key: number, p: Partial<Item>) => setItems((l) => l.map((i) => (i.key === key ? { ...i, ...p } : i)))

  async function handle(files: FileList | File[]) {
    const list = [...files]
    const entries = list.map((f) => ({ f, key: ++seq.current }))
    setItems((l) => [...entries.map(({ f, key }): Item => ({ key, name: f.name, progress: 0, status: 'uploading' })), ...l])
    for (const { f, key } of entries) {
      const v = validateFile(f.type, f.size)
      if (!v.ok) { patch(key, { status: 'error', message: v.reason }); continue }
      try {
        const asset = await uploadOne(f, category, (progress) => patch(key, { progress }))
        patch(key, { status: 'done', progress: 100 })
        onUploaded(asset)
      } catch (e) {
        patch(key, { status: 'error', message: e instanceof Error ? e.message : 'Upload failed.' })
      }
    }
  }

  return (
    <section aria-label="Upload" className="rounded-lg border border-navy/10 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={catId} className="text-sm font-medium text-navy">Category for new uploads</label>
        <select
          id={catId}
          aria-label="Upload category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-navy/20 bg-white px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{humanCategory(c)}</option>)}
        </select>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void handle(e.dataTransfer.files) }}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-orange ${over ? 'border-orange bg-orange/10' : 'border-navy/30 bg-soft'}`}
      >
        <span className="font-medium text-navy">Drag and drop images here, or click to choose</span>
        <span className="mt-1 text-black/70">JPEG, PNG, WebP or AVIF, up to 10MB each</span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          aria-label="Choose images to upload"
          className="sr-only"
          onChange={(e) => { if (e.target.files) void handle(e.target.files); e.target.value = '' }}
        />
      </label>

      {items.length > 0 && (
        <ul aria-label="Upload queue" className="mt-3 space-y-2">
          {items.map((i) => (
            <li key={i.key} className="rounded-md border border-navy/10 p-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate">{i.name}</span>
                <span className={i.status === 'error' ? 'text-red-700' : 'text-black/70'}>
                  {i.status === 'uploading' ? `${i.progress}%` : i.status === 'done' ? 'Uploaded' : 'Failed'}
                </span>
              </div>
              {i.status === 'uploading' && (
                <progress aria-label={`Uploading ${i.name}`} max={100} value={i.progress} className="mt-1 h-1.5 w-full accent-orange" />
              )}
              {i.status === 'error' && <p role="alert" className="mt-1 text-red-700">{i.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
