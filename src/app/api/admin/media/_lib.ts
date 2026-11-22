import 'server-only'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { ALLOWED_MIME, ALLOWED_VIDEO_MIME, FORMAT_TO_MIME, isVideoMime, validateFile, type AllowedMime, type AllowedVideoMime } from '@/lib/validation/media'

export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

export type Decoded = { buffer: Buffer; mime: AllowedMime | AllowedVideoMime; ext: string; width: number | null; height: number | null; size: number }

/** MP4/MOV-family files carry an `ftyp` box at byte 4; WebM/Matroska starts with the EBML magic. */
function videoMatches(buf: Buffer, mime: AllowedVideoMime): boolean {
  if (mime === 'video/mp4') return buf.length > 12 && buf.subarray(4, 8).toString('ascii') === 'ftyp'
  return buf.length > 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3
}

/** Validates declared MIME+size, then decodes the bytes to prove they are a real image of that type. */
export async function checkAndDecode(file: File): Promise<Decoded | NextResponse> {
  const v = validateFile(file.type, file.size)
  if (!v.ok) return bad(v.reason)
  const buffer = Buffer.from(await file.arrayBuffer())
  if (isVideoMime(file.type)) {
    const vm = file.type as AllowedVideoMime
    if (!videoMatches(buffer, vm)) return bad(`The file is not a valid ${vm === 'video/mp4' ? 'MP4' : 'WebM'} video.`)
    return { buffer, mime: vm, ext: ALLOWED_VIDEO_MIME[vm], width: null, height: null, size: buffer.length }
  }
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
