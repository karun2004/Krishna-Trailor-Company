# Site components (`src/components/site`)

Import from `@/components/site`. Server components unless marked **client**. Colors: `bg-black|white|soft|blue|navy`, `text-orange`. Division accent: `var(--accent)` / `var(--accent-fg)` (see `data-division`).

- `SiteNav` (client) / `SiteFooter` (async server): already mounted by `src/app/(site)/layout.tsx`; do not add again. Footer reads `getSiteSettings` + `getOffices` and renders only what exists.
- `SectionShell` `{ variant?: 'white'|'black'|'soft'|'blue'|'navy' (white); as?: 'section'|'div'|'footer'; id?; labelledBy?; padded? (true); contained? (true, max-w-7xl px gutters); className? }` full-bleed hard-cut band. Use blue only for explainer zones.
- `MonoLabel` `{ index?: number|string (numbers zero-padded -> "01 — "); children; className? }`
- `GhostHeadline` `{ children; on?: 'light'|'dark' (light); as?: 'h1'|'h2'|'h3'|'p'|'div' (h2); className? }` oversized outlined text.
- `Button` `{ variant?: 'primary-orange'|'dark'|'light'|'outline'; href? (renders link; http/mailto/tel => <a>) ; external?; className?; ...native anchor/button props }`. `primary-orange` follows the division accent (navy under radhe). `buttonClass(variant, className)` for custom elements.
- `Card` `{ variant?: 'light'|'soft'|'dark'|'blue'; as?: 'div'|'article'|'li'; padded? (true); className? }`
- `MediaImage` `{ media: MediaRef|null|undefined; aspect?: string ("16/9" => fill + object-cover); sizes?; priority?; alt?; className?; imgClassName? }` null/blank => placeholder block (aria-hidden, `data-media-placeholder`). Never throws.
- `Reveal` (client) `{ children; as?: 'div'|'section'|'li'|'article'|'p'|'span'; delay?: s; y?: px (28); className? }` scroll fade-in.
- `StatCounter` (client) `{ value: number; prefix?; suffix?; duration?: s; grouping? (true; false for years); className? }` only pass verified numbers.
- `@/lib/motion`: `useScrollMotion(ref, ({gsap, ScrollTrigger}) => ..., deps?)` (client only; no-op under prefers-reduced-motion), `prefersReducedMotion()`.

Division theming: wrap a page in `<div data-division="krishna|haulage|radhe">`; sets `--bg --fg --accent --accent-fg --tint`. radhe = white/blue/navy, no orange.
