# Architecture

Snapshot of branch `feat/foundation-and-cms` at commit `c14b2a0` (plus in-progress work). Verified against the code; where a statement describes a convention, the file that enforces it is named.

## Stack

| Layer | Choice | Where |
|---|---|---|
| Framework | Next.js 15.5 (App Router), React 19, TypeScript | `package.json`, `src/app/` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), tokens in `globals.css` | `src/app/globals.css` |
| Fonts | Sora, Manrope, JetBrains Mono via `next/font/google` | `src/lib/fonts.ts` |
| Data | Supabase: Postgres, Auth, Storage (`@supabase/ssr`, `@supabase/supabase-js`) | `supabase/`, `src/lib/supabase/` |
| Validation | zod 4 | `src/lib/validation/`, `src/lib/admin/schema.ts` |
| Images | sharp (decodes uploads, reads dimensions) | `src/app/api/admin/media/_lib.ts`, `src/app/api/enquiry/route.ts` |
| Motion | GSAP + ScrollTrigger (no Three.js, no `motion` package) | `src/lib/motion.ts`, `src/components/site/anim/` |
| Tests | Vitest (unit + integration), Playwright (e2e), ESLint | see Testing |
| Package manager | pnpm; Supabase CLI as a devDependency (`pnpm exec supabase`) | `package.json` |

## Directory map

```
src/
  app/
    (site)/            Public site (route group). Pages: /, /about, /krishna-trailor,
                       /heavy-haulage, /radhe-travels, /fleet, /projects, /contact
    admin/
      login/           Sign-in page (server action)
      (shell)/         Authenticated admin screens, one folder per entity
                       (divisions, services, fleet, projects, gallery, timeline,
                       testimonials, faqs, clients, offices, homepage, media,
                       settings, seo, enquiries) + dashboard at /admin
    api/
      enquiry/         POST: public enquiry intake (JSON or multipart)
      admin/media/     Route handlers: upload, PATCH/PUT/DELETE one asset, reorder, usage
      admin/services/  Stub: returns 405 after auth (services use Server Actions)
    layout.tsx, robots.ts, sitemap.ts, middleware.ts (in src/)
  components/
    site/              Public design system (SectionShell, Button, Card, MediaImage ...),
                       anim/ (HeroScrub, RevealGroup), home/, division/, contact/, pages/
    admin/             EntityForm, DataTable, SortableList, MediaLibrary, MediaPicker, Dropzone
  lib/
    auth.ts            getAdminUser, requireAdmin, requireAdminApi
    env.ts             Public env only (NEXT_PUBLIC_*), zod-validated
    supabase/          server.ts (cookie client, anon key), client.ts, admin.ts (service role)
    queries/           Read layer for public pages (published rows only)
    admin/             entity-actions.ts (generic CRUD actions), fields.ts, enquiries.ts,
                       media-actions.ts
    validation/        enquiry.ts, media.ts
    rate-limit.ts      DB-backed enquiry rate limit (+ hashed IP)
    media-library.ts   Pure helpers for the media library UI
    seo.ts, jsonld.ts  Metadata composition, structured data
supabase/
  migrations/          0001, 0002, 0003, 0004, 0010, 0011, 0012 (see Gaps)
  seed.sql             Initial content (see docs/WEBSITE_CONTENT.md)
  config.toml          Local stack (Postgres 17, Studio, Storage, Auth)
e2e/                   Playwright specs + global-setup (throwaway admin/user accounts)
tests/support/         Integration-test helpers (outside src/ on purpose)
scripts/               create-admin.ts, check-no-secret-leak.sh, with-lock.sh
```

Admin entity folders follow one pattern: `page.tsx` (list), `new/`, `[id]/` (edit), `schema.ts` (zod + form fields), `actions.ts` (Server Actions built by `createEntityActions`), plus `*List.tsx` and `*Form.tsx`.

## Data flow

### Public pages (read path)

1. A Server Component in `src/app/(site)/` calls a function from `src/lib/queries` (for example `getDivision`, `getServices`, `getPageContent`, `getSiteSettings`).
2. `getDb()` returns the cookie-aware SSR client built with the **anon** key (`src/lib/supabase/server.ts`), so RLS applies.
3. Queries filter `published = true` in code and select explicit column lists. RLS is the backstop.
4. Image references (`*_media_id`) are resolved by `resolveMedia`/`withMedia` into `{ url, alt, width, height }` (`src/lib/queries/media.ts`). A null reference renders a placeholder via `MediaImage`; nothing throws.
5. A section with no published rows renders nothing (no empty headings).
6. Metadata comes from `getSeo` through `buildMetadata` (`src/lib/seo.ts`); sitemap and robots read `PUBLIC_PATHS` and `siteUrl()`.

### Admin CRUD (write path)

1. Form (client component) posts to a Server Action in the entity's `actions.ts`.
2. The action calls `requireAdmin()` first, then validates with the entity's zod schema.
3. It writes with the **session** client (`createServerClient()`), so the admin's RLS policies decide what succeeds.
4. `revalidatePath` refreshes the admin list and the public pages that show the row.

### Enquiries (public write path)

Contact and quote forms POST to `/api/enquiry`. The route inserts with the service-role client after validation and rate limiting (see Enquiry API below). Admins read and update rows through the session client.

## Auth model

Three layers, all failing closed:

| Layer | Mechanism | Used by |
|---|---|---|
| Edge gate | `src/middleware.ts` matches `/admin/:path*`, calls `getUser()` and checks `profiles.role = 'admin'`; `/admin/login` passes through | every admin URL |
| Server check | `requireAdmin()` (redirect to `/admin/login`) in pages and Server Actions; `requireAdminApi()` (401 JSON) in route handlers | every admin screen and API |
| Database | RLS policies call `public.is_admin()` | every content table and storage bucket |

- `getAdminUser()` (`src/lib/auth.ts`) verifies the session with `auth.getUser()` (not the cookie alone), then requires a `profiles` row with `role = 'admin'`.
- Login is a Server Action using `signInWithPassword`. A valid account without the admin role is signed out and sent back to the login page.
- `public.is_admin()` is `SECURITY DEFINER` with `set search_path = ''` (`0001_core.sql`), so it cannot be spoofed through the search path.
- `profiles` is a privilege boundary: a user can read only their own row, and no API role can insert, update or delete it. Admins are created only through the service role (`scripts/create-admin.ts`).

## Row-level security and grants

Applies to migrations `0001_core.sql`, `0002_content.sql`, `0003_hide_verification_notes.sql`.

- RLS is enabled on every table.
- Default Supabase grants are revoked, then re-granted minimally, so a denied write fails with `42501` instead of silently matching zero rows.
- **anon**: SELECT only, and only published rows. Tables: `business_divisions`, `media_assets`, `site_settings`, `services`, `fleet_items`, `projects`, `project_images`, `gallery_albums`, `gallery_album_media`, `timeline_milestones`, `testimonials`, `faqs`, `client_logos`, `office_locations`, `page_content`, `seo_metadata`.
  - `project_images` and `gallery_album_media` have no flag of their own; they are readable only through a published parent.
  - `testimonials` require `published = true AND approved = true`.
  - `media_assets` and `site_settings` have no `published` column and hold public-site data only.
- **Column grant on `verification_note`** (`0003`): anon's table-level SELECT was replaced by an explicit column list on the 12 content tables that carry the note. Anon cannot read `verification_note`, even on published rows. Any column added later is invisible to anon until it is added to that grant.
- **enquiries**: no anon grant and no anon policy. Admins (`authenticated` + `is_admin()`) may select, insert, update, delete.
- **authenticated (admin)**: `is_admin()` policies grant full access to content tables. A signed-in non-admin sees exactly what anon sees and cannot write.
- **Known gap**: `0003` did not revoke SELECT from `authenticated`, so a signed-in non-admin could read `verification_note` on published rows. Only admin accounts exist today, so exposure is theoretical. See `docs/TODO.md`.
- Length CHECK constraints on `enquiries` (name 200, message 5000, `details` 20 KB, etc.) hold even for the service role.
- Every media foreign key is `ON DELETE SET NULL`: deleting a media asset blanks the image, it never deletes content.

## Storage buckets

| Bucket | Public | Limits | Read | Write |
|---|---|---|---|---|
| `media` | yes (public URLs) | 10 MB; jpeg, png, webp, avif (`0001`, tightened in `0004`) | anyone | admin only (`is_admin()`), policies scoped by `bucket_id` |
| `enquiry-attachments` | no | 10 MB; jpeg, png, webp, avif, pdf (`0002`) | admin only (signed URL, 60 s) | service role only (`/api/enquiry`); admins may delete |

Storage object paths: media `"<category>/<uuid>.<ext>"`; attachments `"YYYY-MM/<uuid>.<ext>"`.

## Media pipeline

1. Admin drops files in the Dropzone (media library, or a picker inside a content form).
2. `POST /api/admin/media` (multipart: `file`, `category`, optional `alt`, `caption`):
   - `requireAdminApi()`; zod checks `category` against the enum list.
   - `checkAndDecode`: declared MIME and size pre-check, then **sharp decodes the bytes**; the detected format must match the declared MIME. A lying `Content-Type` is rejected before storage.
   - Upload to `media` at `<category>/<uuid>.<ext>` with service role, then insert a `media_assets` row (width, height, size, alt, caption).
   - If the row insert fails, the uploaded object is removed.
3. `PATCH /api/admin/media/[id]` updates category, alt, caption. `PUT` replaces the file (new path). `POST /api/admin/media/reorder` sets library order.
4. `DELETE /api/admin/media/[id]` deletes the row first (FKs null out), then the object. The API does not block on usage; the UI shows usage from `GET .../[id]/usage` (backed by `media_usage()`, `0011`) before confirming.
5. Public URLs are built as `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/<path>` (`mediaPublicUrl` in `src/lib/media-library.ts`).

## Enquiry API and rate limiting

`POST /api/enquiry` (`src/app/api/enquiry/route.ts`):

1. Body size pre-check (attachment limit + 512 KB); accepts JSON or multipart; `type` must be `industrial` or `travel`. Travel enquiries accept no attachment.
2. zod validation of fields (`src/lib/validation/enquiry.ts`). Attachment: MIME allowlist, 10 MB, and content check (PDF magic bytes; images via sharp).
3. Honeypot: a non-empty `website` field returns `201 { ok: true }` and stores nothing, without spending rate-limit budget.
4. Rate limit (`src/lib/rate-limit.ts`): HMAC-SHA256 of the client IP (`x-forwarded-for` first hop, then `x-real-ip`; invalid IPs become `unknown`) keyed by `ENQUIRY_IP_PEPPER`. Calls `enquiry_rate_limit_hit()` (`0012`): **5 requests per 600 s per hashed IP**. The function takes a per-hash advisory lock, so parallel requests cannot slip past the limit. Only hashes are stored, in `enquiry_rate_events`, which has RLS on and no grants for `anon` or `authenticated`. Over limit: `429` with `Retry-After`. Infrastructure error: `503` (fails closed).
5. Attachment uploaded to `enquiry-attachments`; then the row is inserted with status `new`. On insert failure the attachment is removed.

Admin side: statuses `new`, `contacted`, `in_progress`, `completed`, `archived` (`canTransition` in `src/lib/admin/enquiries.ts`); internal notes; attachment via a 60-second signed URL; delete also removes the attachment.

## Service-role confinement

- `createAdminClient()` lives only in `src/lib/supabase/admin.ts`, which imports `server-only`. The service-role key is read only there (`SUPABASE_SERVICE_ROLE_KEY`, trimmed, empty is an error).
- Callers: `src/app/api/enquiry/route.ts` and the four `src/app/api/admin/media/*` route files. The rate-limit helper receives the admin client as an argument rather than creating one.
- `scripts/create-admin.ts` reads the key directly from the environment. It sits outside `src/` and cannot use `server-only` (documented exemption in the file header).
- `src/lib/env.ts` validates only the public variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`). Server secrets are never parsed there.
- Guards: `src/lib/supabase/__tests__/admin.server-only.test.ts`; `scripts/check-no-secret-leak.sh` (see Testing).

## Animation layer

- `useScrollMotion(ref, setup)` in `src/lib/motion.ts` is a client hook. It dynamically imports `gsap` and `ScrollTrigger`, runs setup inside `gsap.context` scoped to the element, and reverts on unmount.
- **Reduced motion**: if `prefers-reduced-motion: reduce` matches, setup never runs and GSAP is never loaded. Content stays in its final visible state.
- `HeroScrub` (`anim/HeroScrub.tsx`): on `min-width: 768px` the hero pins and the element `[data-hero-vehicle]` scrubs `xPercent` from 0 to -75. Below 768px it drifts without pinning. It animates transforms only.
- `Reveal`, `RevealGroup` (scroll fade-in), `StatCounter` (animated number, only for verified values), and `IndiaMap` (homepage) follow the same rule.
- Pages stay Server Components; animation code lives only in client components.

## Testing strategy

| Kind | Command | Scope | Notes |
|---|---|---|---|
| Unit | `pnpm test` | `src/**/*.test.ts(x)` (13 files) | No network. `vitest.config.ts` stubs `server-only` and sets dummy public env. |
| Integration | `pnpm test:int` | `*.int.test.ts` in `src/` and `tests/` (7 files) | Needs the local stack (`pnpm exec supabase start`). `fileParallelism: false`. Covers RLS for anon and non-admin/admin roles, seed contents, queries, and the rate limiter. |
| Test helpers | `tests/support/db.ts` | shared by int and e2e | Reads keys at runtime from `supabase status -o env`; never written to a tracked file. Creates users with random passwords and removes them. |
| End-to-end | `pnpm e2e` | `e2e/*.spec.ts` (18 files, chromium, 1 worker) | `playwright.config.ts` starts `next dev` on port 3100 with local keys. If `.env.local` is missing it writes one (gitignored). `global-setup.ts` creates a random-password admin and non-admin and deletes them after the run. |
| Shared-resource lock | `scripts/with-lock.sh <cmd>` | e2e and build | Serialises commands that share port 3100, `.next` and `test-results`, using a `mkdir` lock at `/tmp/ktc-shared.lock`. |
| Secret leak check | `pnpm check:leak <sentinel> [dir=.next/static]` | after `pnpm build` | Fails if the secret's value appears in the client bundle. Use a sentinel value, not the variable name. |
| Lint | `pnpm lint` | ESLint 9 with `eslint-config-next` | |

There is no CI workflow in the repository yet.

Local integration and e2e assume Docker is running and the stack is started with `pnpm exec supabase start`. Do not run `supabase db reset` while another process is using the stack.

## Gaps and known debt

- Migration numbering jumps from `0004` to `0010`. `0012_rate_limits.sql` has a header comment that says `0011`. Files `0005` to `0009` do not exist.
- Unused helpers: `pageMetadata` (`src/components/site/pages/seo.ts`) and `divisionMetadata` (`src/components/site/division/data.ts`) are exported but not called; pages use `buildMetadata`.
- `src/app/api/admin/services/route.ts` is a stub kept for its 401 check.
- `ENQUIRY_IP_PEPPER` falls back to a hard-coded value in `hashIp()` when unset.
- `scripts/check-no-secret-leak.sh` treats a `grep` error (exit 2) the same as no match. The check is weaker than it looks.

Full list with owners: `docs/TODO.md`.
