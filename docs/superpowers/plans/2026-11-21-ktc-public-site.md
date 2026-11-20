# KTC Public Site (Plan 2) — Implementation Plan

> Execution: superpowers:subagent-driven-development, sonnet/haiku subagents only. Spec: `~/.claude/plans/users-karun-downloads-priyanshi-devi-bh-dazzling-zebra.md` (Visual direction, Content integrity, Verification). Plan 1 (CMS) is complete and tagged `cms-complete`.

**Goal:** A cinematic, CMS-driven public site separating the three divisions. Every piece of content is read through `src/lib/queries` (published only). It must look premium with animation off, work with `prefers-reduced-motion`, and publish nothing invented.

## Global Constraints

- Route group `src/app/(site)/` (pages: `/`, `/about`, `/krishna-trailor`, `/heavy-haulage`, `/radhe-travels`, `/fleet`, `/projects`, `/contact`). Admin and API routes untouched.
- Data only via `src/lib/queries` (no direct Supabase calls in pages, no hardcoded copy except UI chrome). Missing media → tasteful placeholder (never throw, never broken image). A section with no published rows renders nothing: no empty heading.
- Palette/fonts exactly as in `globals.css` tokens (black #101010, white, soft #F5F6F7, orange #F28C28, blue #DCEBFF, navy #14243A; Sora/Manrope/JetBrains Mono). Radhe Travels: light/blue/navy, **no orange**. Heavy Haulage: darkest, mono data.
- Animation: GSAP + ScrollTrigger (and `motion` only if truly needed). **No Three.js.** Every animation honours `prefers-reduced-motion` (static fallback fully usable). Animation code lives in client components only; pages stay Server Components.
- No invented facts. Draft/unverified items stay absent (the query layer already hides them). Enquiry forms post to `POST /api/enquiry` (existing; types `industrial` | `travel`).
- Accessibility: semantic landmarks, one h1/page, visible focus, contrast AA, keyboard nav, `alt` from media rows.
- Never run `supabase db reset` while other agents run. Run `pnpm e2e`/`pnpm build` only via `scripts/with-lock.sh`.

## Milestones

### M6 — Design system in code (serial, first)
`src/components/site/`: `SiteNav` (responsive, drawer on mobile, division links, floating "Get a Quote" pill), `SiteFooter` (contact from `getSiteSettings`/`getOffices`), `SectionShell` (variants: white/black/soft/blue/navy), `MonoLabel` (`01 — LABEL`), `GhostHeadline` (outlined oversized text), `Button` (uppercase mono pill, variants), `Card`, `MediaImage` (resolves `MediaRef | null`, placeholder, next/image, aspect box), `Reveal`/`StatCounter` wrapped with a reduced-motion guard, `(site)/layout.tsx`. Division theme switch via data attribute / CSS vars. Unit + e2e smoke (nav keyboard, mobile drawer).

### M7 — Homepage (parallel after M6)
`(site)/page.tsx`, all sections CMS-driven: hero ("ANY LOAD. ANY ROAD." from `page_content`), company intro, 3 division panels, services, heavy machinery, heavy-haulage showcase ("WE MOVE WHAT OTHERS CAN'T."), fleet, timeline, Pan-India map (static SVG, offices from `getOffices`), industries, projects gallery, why-us, testimonials (omit when none), FAQ accordion, final CTA. Scroll-scrubbed hero is M11; M7 ships a static hero.

### M8 — Division pages (parallel)
`/krishna-trailor`, `/heavy-haulage` (+ 7-step process diagram, inline SVG, mono labels; generic process steps only, no invented claims), `/radhe-travels` (light identity; routes/fares only if published).

### M9 — About, Fleet, Projects (parallel)
`/about` (timeline, verified facts), `/fleet` (category filter via `getFleetItems`), `/projects` (filter by division, lightbox with before/during/after via `getProjects`, gallery albums).

### M10 — Contact / quote (parallel)
`/contact`: industrial and travel enquiry forms (zod schemas from `src/lib/validation/enquiry.ts`), attachment upload, honeypot, 429 message, success state, offices + map link + phone/WhatsApp from settings. e2e: submit both forms, row appears (service role check), cleanup.

### M11 — Animation pass (after M7–M10)
GSAP scrub hero (vehicle cut-out crossing ghost headline; static fallback when media missing or reduced motion), section reveals, counters (verified stats only), India map route draw, subtle transitions. No layout shift; animations never block LCP.

### M12–M13 — Responsive, performance, SEO, a11y (after M11)
390/768/1024/1440 no horizontal overflow (Playwright), `next/image` sizes, lazy-loading, `generateMetadata` from `getSeo`, OG, `sitemap.ts`, `robots.ts`, JSON-LD LocalBusiness (verified facts only), a11y checks, Lighthouse.

### M14 — Browser verification + docs
Run spec Verification items 1, 2 (upload → hero appears on public home), 3, 4, 7, 8, 9. Write `ARCHITECTURE.md`, `ADMIN_GUIDE.md`, `WEBSITE_CONTENT.md` (verified vs draft), `TODO.md` (needs-human: confirm 8 service names, Bhopal address, upload real photography, client logos, testimonials). Tag `site-complete`.

## Definition of done
`pnpm test`, `pnpm test:int`, `pnpm e2e`, `pnpm build`, `pnpm check:leak` green; all 8 pages render at 4 widths without overflow; admin-uploaded hero shows on homepage; reduced-motion works; no unpublished or invented content reachable.
