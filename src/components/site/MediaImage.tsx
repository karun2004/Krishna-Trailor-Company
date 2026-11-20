import Image from 'next/image'
import type { MediaRef } from '@/lib/queries/types'
import { cn } from './cn'
import { resolveMediaImage } from './media-image.helpers'

export type MediaImageProps = {
  media: MediaRef | null | undefined
  /** CSS aspect-ratio of the box, e.g. "16/9". When set the image fills and crops (object-cover). */
  aspect?: string
  /** next/image `sizes`; default full viewport width. */
  sizes?: string
  priority?: boolean
  /** Override alt (otherwise media.alt; empty = decorative). */
  alt?: string
  className?: string
  imgClassName?: string
}

export function MediaImage({ media, aspect, sizes = '100vw', priority, alt, className, imgClassName }: MediaImageProps) {
  const m = resolveMediaImage(media)
  const style = aspect ? { aspectRatio: aspect } : undefined
  if (!m) {
    return (
      <div
        aria-hidden="true"
        data-media-placeholder
        style={style ?? { aspectRatio: '16/10' }}
        className={cn(
          'relative w-full overflow-hidden bg-[linear-gradient(135deg,#1c1c1c,#2a2a2a)]',
          "after:absolute after:inset-0 after:bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgba(255,255,255,.04)_14px_15px)] after:content-['']",
          className,
        )}
      />
    )
  }
  const text = alt ?? m.alt
  if (aspect) {
    return (
      <div style={style} className={cn('relative w-full overflow-hidden', className)}>
        <Image src={m.src} alt={text} fill sizes={sizes} priority={priority} className={cn('object-cover', imgClassName)} />
      </div>
    )
  }
  return (
    <Image
      src={m.src}
      alt={text}
      width={m.width}
      height={m.height}
      sizes={sizes}
      priority={priority}
      className={cn('h-auto w-full', className, imgClassName)}
    />
  )
}
