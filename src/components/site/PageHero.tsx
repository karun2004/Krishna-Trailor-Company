import Image from 'next/image'
import type { MediaRef } from '@/lib/queries/types'
import { cn } from './cn'
import { resolveMediaImage } from './media-image.helpers'
import { MonoLabel } from './MonoLabel'

export type PageHeroProps = {
  label: string
  /** Use "\n" to force a line break; lines stack tight like a poster. */
  title: React.ReactNode
  lead?: React.ReactNode
  media: MediaRef | null | undefined
  /** 'dark' (default) for KTC pages, 'light' for Radhe Travels. */
  tone?: 'dark' | 'light'
  /** Buttons etc. */
  children?: React.ReactNode
  className?: string
}

/**
 * Page header in the poster style: giant outlined type stacked from the top-left over a darkened photo.
 * Text sits at the top of the band (no dead space above it); the photo shows through on the right.
 */
export function PageHero({ label, title, lead, media, tone = 'dark', children, className }: PageHeroProps) {
  const img = resolveMediaImage(media)
  const dark = tone === 'dark'
  return (
    <section
      data-page-hero
      style={{ '--outline': dark ? '#ffffff' : '#14243A' } as React.CSSProperties}
      className={cn(
        'relative isolate flex w-full items-start overflow-hidden',
        dark ? 'bg-black text-white' : 'bg-blue text-navy',
        className,
      )}
    >
      {img ? (
        <Image
          src={img.src}
          alt={img.alt}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[70%_center] md:object-center"
        />
      ) : (
        <div
          aria-hidden="true"
          data-media-placeholder
          className={cn(
            '-z-20 absolute inset-0',
            dark ? 'bg-[linear-gradient(135deg,#101010,#2a2a2a)]' : 'bg-[linear-gradient(135deg,#DCEBFF,#BFD8FA)]',
          )}
        />
      )}
      <div
        aria-hidden="true"
        className={cn(
          '-z-10 absolute inset-0',
          dark
            ? 'bg-gradient-to-b from-black/85 via-black/65 to-black/80 md:bg-gradient-to-r md:from-black/90 md:via-black/70 md:to-black/35'
            : 'bg-gradient-to-b from-blue/95 via-blue/80 to-blue/90 md:bg-gradient-to-r md:from-blue/95 md:via-blue/80 md:to-blue/30',
        )}
      />
      <div className="mx-auto w-full max-w-7xl px-5 pb-8 pt-7 sm:pb-10 md:px-8 md:pb-12 md:pt-9">
        <MonoLabel>{label}</MonoLabel>
        <h1 className="outline-text mt-3 max-w-6xl whitespace-pre-line break-words font-[family-name:var(--font-hero)] text-[clamp(2.75rem,11.5vw,9rem)] uppercase leading-[0.88] tracking-tight">
          {title}
        </h1>
        {lead ? <p className={cn('mt-5 max-w-xl text-base sm:text-lg', dark ? 'text-white/85' : 'text-navy/85')}>{lead}</p> : null}
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  )
}
