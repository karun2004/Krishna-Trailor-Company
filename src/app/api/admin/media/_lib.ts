import 'server-only'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { ALLOWED_MIME, FORMAT_TO_MIME, validateFile, type AllowedMime } from '@/lib/validation/media'

export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

export type Decoded = { buffer: Buffer; mime: AllowedMime; ext: string; width: number; height: number; size: number }

/** Validates declared MIME+size, then decodes the bytes to prove they are a real image of that type. */
export async function checkAndDecode(file: File): Promise<Decoded | NextResponse> {
  const v = validateFile(file.type, file.size)
  if (!v.ok) return bad(v.reason)
  const buffer = Buffer.from(await file.arrayBuffer())
  try {
    const meta = await sharp(buffer, { failOn: 'error' }).metadata()
    const real = meta.format ? FORMAT_TO_MIME[meta.format] : undefined
    if (!real || !meta.width || !meta.height) return bad('The file is not a valid image.')
    if (real !== file.type) return bad(`File contents are ${real}, which does not match the declared type ${file.type}.`)
    return { buffer, mime: real, ext: ALLOWED_MIME[real], width: meta.width, height: meta.height, size: buffer.length }
  } catch {
    return bad('The file could not be decoded as an image.')
  }
}
