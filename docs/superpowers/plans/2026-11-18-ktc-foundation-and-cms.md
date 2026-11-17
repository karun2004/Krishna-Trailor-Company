# KTC Foundation, Data Layer and Admin CMS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js foundation, the Supabase schema with row-level security, and a fully working admin CMS that the company can use to manage every piece of site content and imagery.

**Architecture:** Next.js 15 App Router with Server Components reading Supabase through a typed query layer. All content lives in Postgres; all imagery lives in Supabase Storage with a `media_assets` row as the single source of truth. Admin mutations run in Server Actions / Route Handlers that re-check the session server-side; the service-role key is confined to one server-only module. RLS is the second line of defence, never the only one.

**Tech Stack:** Next.js 15, TypeScript, Tailwind v4, Supabase (Postgres + Auth + Storage), zod, react-hook-form, lucide-react, Vitest (unit), Playwright (E2E).

**Spec:** `~/.claude/plans/users-karun-downloads-priyanshi-devi-bh-dazzling-zebra.md`

**Scope note:** This plan covers spec milestones 1–5. Milestones 6–15 (public site, animation, SEO, deploy) are Plan 2, written after this plan's verification passes.

## Global Constraints

- Next.js 15 App Router, TypeScript strict mode, Tailwind v4. Package manager: `pnpm`.
- **Do not install** `three`, `@react-three/fiber`, `@react-three/drei`, or any second planning framework.
- Palette tokens, exact values: `--black: #101010`, `--white: #FFFFFF`, `--soft: #F5F6F7`, `--orange: #F28C28`, `--blue: #DCEBFF`, `--navy: #14243A`.
- Fonts: Sora (display), Manrope (body), JetBrains Mono (micro-labels). Loaded via `next/font/google`.
- `SUPABASE_SERVICE_ROLE_KEY` is referenced in exactly one file: `src/lib/supabase/admin.ts`, which begins with `import 'server-only'`.
- RLS enabled on every table. Anonymous role: `SELECT` only where `published = true`; `INSERT` only on `enquiries`.
- No company fact may be invented. Unverified content is seeded with `published = false` and `verification_note` set.
- Verified facts, verbatim: founded **1987** under **Mr. Kuldeep Singh**; head office **Shop No. 644, New Motor Market, Manimajra, Chandigarh – 160101**; office phone **0172-4640644**; **9815413468** (Kuldeep Singh); **7373000018** (Devilal); email **Ktc087@gmail.com**; parallel office **Bhopal**.
- Unverified, seed as draft with a note: the "38+ years" figure, the "1 MT to 250 MT" capacity claim, all testimonials, all project titles/dates/locations, all Radhe Travels routes/fares/schedules, certifications, leadership bios.

## Review Focus

Five failure modes the spec implies that no task's happy path exercises. Each has a test added to the task that owns the code.

1. **Upload of a disallowed or oversized file** — a `.svg`, `.pdf` or 40MB `.jpg` must be rejected server-side with a 400 and a readable message, never a 500 and never a stored object. (Task 9)
2. **Anonymous or non-admin mutation** — a direct `POST` to an admin route handler without a session must return 401 before touching the database; RLS alone is not the guard. (Task 7)
3. **Enquiry flooding** — repeated submissions from one IP must be rate-limited with a friendly message, not an unbounded insert. (Task 13)
4. **Dangling media reference** — a content row whose `media_id` points at a deleted asset must render a placeholder, not throw. (Task 6)
5. **Entirely unpublished section** — when every testimonial or client logo is unpublished, the query returns empty and the section is omitted; no empty heading, no zero-state. (Task 6)

---

### Task 1: Project scaffold, design tokens and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/fonts.ts`, `vitest.config.ts`, `.env.example`, `.gitignore`, `README.md`
- Test: `src/lib/__tests__/tokens.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `fonts` export from `src/lib/fonts.ts` providing `sora`, `manrope`, `mono` (each a `NextFontWithVariable`); CSS custom properties `--color-black`, `--color-white`, `--color-soft`, `--color-orange`, `--color-blue`, `--color-navy` on `:root`.

- [ ] **Step 1: Scaffold the app**

```bash
cd "/Users/karun/Documents/@KTC"
pnpm create next-app@latest . --ts --tailwind --app --src-dir --import-alias "@/*" --eslint --no-turbopack
git init && git add -A && git commit -m "chore: scaffold Next.js app"
```

- [ ] **Step 2: Write the failing token test**

```ts
// src/lib/__tests__/tokens.test.ts
import { readFileSync } from 'node:fs'
const css = readFileSync('src/app/globals.css', 'utf8')
it.each([
  ['--color-black', '#101010'], ['--color-white', '#FFFFFF'],
  ['--color-soft', '#F5F6F7'], ['--color-orange', '#F28C28'],
  ['--color-blue', '#DCEBFF'], ['--color-navy', '#14243A'],
])('defines %s as %s', (name, value) => {
  expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, 'i'))
})
```

- [ ] **Step 3: Run it and verify it fails**

Run: `pnpm vitest run src/lib/__tests__/tokens.test.ts`
Expected: FAIL — tokens not defined.

- [ ] **Step 4: Add the `@theme` block to `globals.css` and the three fonts to `src/lib/fonts.ts`**

Tailwind v4 `@theme` syntax. Fonts exposed as CSS variables and applied on `<html>` in `layout.tsx`.

- [ ] **Step 5: Run the test and verify it passes**

Run: `pnpm vitest run` — Expected: PASS.

- [ ] **Step 6: Write `.env.example` with the four Supabase keys, no values, and commit**

```bash
git add -A && git commit -m "feat: design tokens, fonts and test harness"
```

---

### Task 2: Supabase client wiring and env contract

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/env.ts`
- Test: `src/lib/__tests__/env.test.ts`

**Interfaces:**
- Produces: `createBrowserClient()`, `createServerClient()` (cookie-bound, async), `createAdminClient()` (service-role, server-only). `env` — a zod-parsed object that throws at import time when a required variable is missing.

- [ ] **Step 1: Write the failing env test** — asserts `parseEnv({})` throws naming the missing variable, and that `parseEnv(valid)` returns the typed object.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Implement `src/lib/env.ts`** exporting `parseEnv(raw: NodeJS.ProcessEnv): Env` and a module-level `env`. `SUPABASE_SERVICE_ROLE_KEY` is optional in the schema but required by `createAdminClient()` at call time.
- [ ] **Step 4: Implement the three clients** using `@supabase/ssr`. `admin.ts` starts with `import 'server-only'`.
- [ ] **Step 5: Run tests, verify pass.**
- [ ] **Step 6: Assert the service-role key never reaches the client bundle**

Run: `pnpm build && grep -rl "SUPABASE_SERVICE_ROLE_KEY" .next/static/ ; test $? -ne 0`
Expected: no matches.

- [ ] **Step 7: Commit.**

---

### Task 3: Core schema — media, divisions, settings, profiles

**Files:**
- Create: `supabase/migrations/0001_core.sql`
- Test: `src/lib/__tests__/rls.core.test.ts` (integration against local Supabase)

**Interfaces:**
- Produces tables `profiles`, `media_assets`, `business_divisions`, `site_settings`; enum `media_category`; trigger function `set_updated_at()`.

`media_assets` columns: `id uuid pk`, `storage_path text not null unique`, `bucket text not null default 'media'`, `alt text`, `caption text`, `description text`, `category media_category not null`, `division_id uuid null references business_divisions`, `mime_type text not null`, `width int`, `height int`, `size_bytes bigint`, `sort_order int default 0`, `created_at`, `updated_at`.

`media_category` values: `homepage, krishna_trailor, heavy_haulage, radhe_travels, fleet, cranes, excavators, jcb, industrial_jacks, odc_cargo, projects, gallery, team, clients, other`.

- [ ] **Step 1: Write the failing RLS test** — anonymous client can `SELECT` a published division but gets zero rows for an unpublished one, and an anonymous `INSERT` into `media_assets` is rejected.
- [ ] **Step 2: Run it, verify it fails** (tables do not exist).
- [ ] **Step 3: Write `0001_core.sql`** — tables, enum, `set_updated_at()` trigger on each table, RLS enabled, policies: `anon select where published` on every table that has a `published` column, **`anon select` unrestricted on `media_assets`** (it has no `published` column and holds no secrets; without this the public site cannot resolve image URLs), `authenticated admin all`. `profiles.role` is `text check (role in ('admin'))`, FK to `auth.users`.
- [ ] **Step 4: Apply and run the test**

Run: `supabase db reset && pnpm vitest run rls.core` — Expected: PASS.

- [ ] **Step 5: Commit.**

---

### Task 4: Content schema

**Files:**
- Create: `supabase/migrations/0002_content.sql`
- Test: `src/lib/__tests__/rls.content.test.ts`

**Interfaces:**
- Produces: `services`, `fleet_items`, `projects`, `project_images`, `gallery_albums`, `gallery_album_media`, `timeline_milestones`, `testimonials`, `faqs`, `client_logos`, `office_locations`, `page_content`, `seo_metadata`, `enquiries`; enums `enquiry_status`, `enquiry_division`, `project_phase`.

Every content table carries `published boolean default false`, `sort_order int default 0`, `verification_note text`, timestamps. Image references are `uuid references media_assets(id) on delete set null` — never `cascade`, so deleting an asset degrades rather than destroys.

`enquiry_status` values: `new, contacted, in_progress, completed, archived`.

- [ ] **Step 1: Write the failing RLS test** — anon may `INSERT` into `enquiries`; anon `SELECT` on `enquiries` returns zero rows even for rows it just inserted.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Write `0002_content.sql`** with indexes on `(slug)`, `(division_id, published)`, `(sort_order)`.
- [ ] **Step 4: Apply, run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 5: Seed data, verified and draft

**Files:**
- Create: `supabase/seed.sql`
- Test: `src/lib/__tests__/seed.test.ts`

- [ ] **Step 1: Write the failing seed test** — asserts the 8 services exist and are published; asserts every testimonial row has `published = false` and a non-null `verification_note`; asserts `site_settings` holds the verbatim head-office address from Global Constraints.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Write `seed.sql`** — three divisions; the 8 services from the live site; fleet categories; 9 client logos; office locations (Chandigarh, Bhopal); timeline entries for 1987 / expansion / fleet / today; FAQs; homepage `page_content` blocks carrying the exact headline copy from Global Constraints. Everything unverified seeded `published = false`.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 6: Typed query layer

**Files:**
- Create: `src/lib/queries/*.ts` (one module per content type), `src/lib/queries/types.ts`
- Test: `src/lib/queries/__tests__/queries.test.ts`

**Interfaces:**
- Produces: `getDivision(slug)`, `getServices(opts?)`, `getFleetItems(opts?)`, `getProjects(opts?)`, `getTimeline()`, `getTestimonials()`, `getFaqs(divisionId?)`, `getClientLogos()`, `getOffices()`, `getSiteSettings()`, `getPageContent(pageKey)`, `getSeo(pageKey)`. Each returns published rows only by default and resolves `media_id` into a `MediaRef { url, alt, width, height } | null`.

- [ ] **Step 1: Write the failing tests**, including the two Review Focus cases: a row whose `media_id` is null resolves to `null` and does not throw; `getTestimonials()` with every row unpublished returns `[]`.
- [ ] **Step 2: Run them, verify they fail.**
- [ ] **Step 3: Implement the query modules.** A shared `resolveMedia()` helper builds the public URL; a missing asset yields `null`.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 7: Admin authentication and route protection

**Files:**
- Create: `src/app/admin/login/page.tsx`, `src/middleware.ts`, `src/lib/auth.ts`, `scripts/create-admin.ts`
- Test: `e2e/admin-auth.spec.ts`

**Interfaces:**
- Produces: `requireAdmin(): Promise<Session>` — throws/redirects when the caller is not an admin. **Every admin mutation calls this first.**

- [ ] **Step 1: Write the failing E2E test** — visiting `/admin` logged out redirects to `/admin/login`; and the Review Focus case: `POST /api/admin/services` with no cookie returns 401 and creates no row.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Implement login page, `middleware.ts` matching `/admin/:path*` except `/admin/login`, and `requireAdmin()` in `src/lib/auth.ts`.**
- [ ] **Step 4: Implement `scripts/create-admin.ts`** — prompts for email and password, creates the auth user and the `profiles` row with `role = 'admin'`. No default password exists anywhere in the codebase.
- [ ] **Step 5: Run tests, verify pass.**
- [ ] **Step 6: Commit.**

---

### Task 8: Admin shell and dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/admin/Sidebar.tsx`
- Test: `e2e/admin-dashboard.spec.ts`

- [ ] **Step 1: Write the failing E2E test** — logged-in admin sees counts for images, projects, equipment, services and enquiries, each matching the seeded row count, plus recent uploads and recent enquiries.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Implement the shell and dashboard.** Counts come from one aggregate query. Sidebar is responsive — a drawer below `md`.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 9: Media upload pipeline

**Files:**
- Create: `src/app/api/admin/media/route.ts`, `src/lib/validation/media.ts`
- Test: `src/lib/validation/__tests__/media.test.ts`, `e2e/media-upload.spec.ts`

**Interfaces:**
- Produces: `uploadSchema` (zod) and `POST /api/admin/media` accepting `multipart/form-data`, returning the created `media_assets` row.

Allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `image/avif`. Max size: **10MB**.

- [ ] **Step 1: Write the failing tests**, including Review Focus case 1: `image/svg+xml`, `application/pdf` and an 11MB JPEG each return **400** with a message naming the reason, and no storage object is created.
- [ ] **Step 2: Run them, verify they fail.**
- [ ] **Step 3: Implement the route** — `requireAdmin()` first, then validate MIME and size *before* any storage write, extract dimensions, write to the `media` bucket under `{category}/{uuid}.{ext}`, insert the row.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 10: Media library UI

**Files:**
- Create: `src/app/admin/media/page.tsx`, `src/components/admin/Dropzone.tsx`, `src/components/admin/MediaGrid.tsx`, `src/components/admin/MediaDetail.tsx`
- Test: `e2e/media-library.spec.ts`

- [ ] **Step 1: Write the failing E2E test** — drag-drop multiple files, search by name, filter by category, edit alt text and caption, replace an image, reorder, delete; and confirm the detail panel lists where an asset is used.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Implement the UI.** Usage lookup is one query across every table holding a media FK.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 11: Reusable admin CRUD primitives

**Files:**
- Create: `src/components/admin/DataTable.tsx`, `src/components/admin/SortableList.tsx`, `src/components/admin/MediaPicker.tsx`, `src/components/admin/EntityForm.tsx`
- Test: `e2e/admin-crud-primitives.spec.ts`

**Interfaces:**
- Produces: `EntityForm<T>` driven by a zod schema and a field descriptor array; `DataTable<T>` with search, publish toggle and delete; `SortableList` persisting `sort_order`; `MediaPicker` returning a `media_id`.

- [ ] **Step 1: Write the failing E2E test** against one entity (services) exercising create, edit, publish/unpublish, reorder and delete.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Implement the primitives and the services screen.** Mutations are Server Actions that call `requireAdmin()` then `revalidatePath()`.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 12: Remaining admin screens

**Files:**
- Create: `src/app/admin/{divisions,fleet,projects,gallery,timeline,testimonials,faqs,clients,offices,homepage,settings,seo}/page.tsx`
- Test: `e2e/admin-screens.spec.ts`

- [ ] **Step 1: Write the failing E2E test** — a smoke pass that creates, edits and deletes one row on every screen, and confirms the contact-details screen persists phone, email, WhatsApp, address, socials and map URL.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Implement each screen** by composing Task 11's primitives with a schema and field descriptors. Projects additionally supports multi-image upload tagged `before`/`during`/`after`.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 13: Public enquiry API with rate limiting

**Files:**
- Create: `src/app/api/enquiry/route.ts`, `src/lib/validation/enquiry.ts`, `src/lib/rate-limit.ts`
- Test: `src/lib/validation/__tests__/enquiry.test.ts`, `e2e/enquiry.spec.ts`

**Interfaces:**
- Produces: `industrialEnquirySchema` (name, company, phone, email, cargoType, weight, dimensions, pickup, destination, requiredDate, message, attachment) and `travelEnquirySchema` (name, phone, requirement, passengerCount, route, travelDate, message); `POST /api/enquiry`.

- [ ] **Step 1: Write the failing tests**, including Review Focus case 3: the 6th submission from one IP inside 10 minutes returns **429** with a readable message and inserts no row.
- [ ] **Step 2: Run them, verify they fail.**
- [ ] **Step 3: Implement the route** — validate, rate-limit by IP, store attachments in a **private** `enquiry-attachments` bucket, insert with `status = 'new'`.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit.**

---

### Task 14: Enquiry management screen

**Files:**
- Create: `src/app/admin/enquiries/page.tsx`, `src/app/admin/enquiries/[id]/page.tsx`
- Test: `e2e/admin-enquiries.spec.ts`

- [ ] **Step 1: Write the failing E2E test** — submit an enquiry with an attachment through the public API, then as admin find it by search, filter by status and division, open it, download the attachment via a signed URL, and move it through `new → contacted → completed`.
- [ ] **Step 2: Run it, verify it fails.**
- [ ] **Step 3: Implement the screens.** Attachment links are short-lived signed URLs; the bucket stays private.
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit, then run the full suite and tag the milestone.**

```bash
pnpm vitest run && pnpm playwright test
git tag cms-complete
```

---

## Definition of done for this plan

- `pnpm vitest run` and `pnpm playwright test` both green.
- An admin can log in, upload a photograph, and edit every content type.
- An anonymous visitor cannot read unpublished content or reach any admin route or mutation.
- No build artefact contains the service-role key.
- No invented company fact is published; every unverified claim is draft with a note.
