# KTC — Continuation Plan & Status

_Status memo written 2026-11-20. Consolidates the true repo state, the Supabase recommendation, and the remaining roadmap so execution can resume in any venue (Claude Code on the Mac, or a Cowork session) without re-litigating earlier decisions._

## 1. Where the project actually stands

Branch `feat/foundation-and-cms` (ahead of `master`). Foundation complete and committed:

| Task | What shipped | State |
|---|---|---|
| 1 | Next.js 15 + TS + Tailwind v4 scaffold, design tokens (brand palette), fonts (Sora/Manrope/JetBrains Mono), Vitest harness | ✅ reviewed clean |
| 2 | Supabase client wiring, zod env contract, service-role key confined to `admin.ts`, proven absent from client bundle | ✅ reviewed clean |
| 3 | `0001_core.sql` — media_assets, business_divisions, site_settings, profiles; RLS; `media` storage bucket; `is_admin()` | ✅ Opus-reviewed vs live DB |
| 4 | `0002_content.sql` — services, fleet, projects, gallery, timeline, testimonials, faqs, client_logos, offices, page_content, seo_metadata, enquiries; RLS + grants; 191 int tests green | ⚠️ built, final review never finished (reviewer died mid-run) |

**Two things to fix before new work:**
1. **Working tree is not checked out** — all 32 tracked files show as deleted on disk (safe in git). First action in any venue: `git restore .` (then `pnpm install`).
2. **Close Task 4's review** — triage the deferred minors listed in `.superpowers/sdd/2026-11-18-ktc-foundation-and-cms/progress.md` and record a verdict before building Task 5 on top of the content schema.

## 2. Supabase recommendation (CMS build → deploy)

**Recommendation: build Tasks 5–14 against LOCAL Supabase (CLI + Docker); create a HOSTED project only at the deploy step.**

Reasoning:
- The migrations and the entire test strategy (`supabase db reset`, `*.int.test.ts`) are built for a local stack. It's the fastest loop, it's free, and you can reset the schema and create/delete throwaway auth users freely — which the RLS and auth tests do constantly. The prior session's own ruling: _"Cloud keys are not needed until deployment; local covers the build."_
- Local requires **Docker Desktop running**, which exists on your **Mac** (Claude Code), not in the Cowork Linux VM. So _CMS-first + local Supabase ⇒ the smoothest venue is Claude Code on the Mac._
- A hosted Supabase project is still needed eventually — for the Vercel deployment (Plan 2's final milestone). Stand it up then, run the committed migrations against it, and keep its keys only in Vercel env + a local `.env.local` (never committed; `.env.example` already lists the four keys).

**If you'd rather continue inside Cowork now:** then we go hosted-Supabase immediately (no Docker in that VM). Workable, but slower inner loop and riskier integration tests against a shared cloud DB — acceptable, not ideal. Your call; the plan below is identical either way apart from the backend target.

## 3. Remaining roadmap — Plan 1 (CMS), Tasks 5–14

Already specified in `docs/superpowers/plans/2026-11-18-ktc-foundation-and-cms.md`. Execute in order, test-first. Carry-forward rulings from the prior session that MUST be honored:

- **T5 Seed** — three divisions, 8 services (from live site, published), fleet categories, offices (Chandigarh + Bhopal), timeline (1987/expansion/fleet/today), FAQs, homepage copy blocks. **Do NOT seed client_logos** (names unverified + SQL can't create storage objects → upload via admin). Set `published=true` on `page_content` and `seo_metadata` seed rows. Testimonials stay `published=false`. All unverified facts seeded as drafts with `verification_note`.
- **T6 Query layer** — `resolveMedia()` returns `null` for missing/deleted assets (no throw); filter `media_id is not null` on project_images/gallery_album_media; unpublished-everything returns `[]` (section omitted). Signed-in non-admins read published only, same as anon.
- **T7 Auth** — `requireAdmin()` guards every mutation server-side (RLS is second line). `scripts/create-admin.ts` prompts for email+password; no default password anywhere. Playwright global-setup creates an admin via service role with a runtime-random password, torn down after.
- **T8 Dashboard** — counts (images/projects/equipment/services/enquiries) from one aggregate query; responsive sidebar (drawer below md).
- **T9 Media pipeline** — `requireAdmin()` → validate MIME (jpeg/png/webp/avif) + 10MB **before** any storage write → decode with **`sharp`** (add dep; also yields width/height) → store `media/{category}/{uuid}.{ext}`. Add `file_size_limit`+`allowed_mime_types` to the `media` bucket via a migration (defense in depth). **Re-run `pnpm check:leak` here** — it's vacuous until a route first imports `admin.ts`; prove the sentinel is reachable only under `.next/server`.
- **T10 Media library UI** — drag-drop upload, search, category filter, alt/caption edit, replace, reorder, delete, usage lookup across every media FK.
- **T11 CRUD primitives** — `EntityForm<T>` (zod-driven), `DataTable<T>` (search/publish/delete), `SortableList` (**up/down buttons, no DnD dependency**), `MediaPicker`. Mutations are Server Actions → `requireAdmin()` → `revalidatePath()`.
- **T12 Admin screens** — divisions, fleet, projects (multi-image before/during/after), gallery, timeline, testimonials, faqs, clients, offices, homepage, settings, seo. Contact screen persists phone/email/WhatsApp/address/socials/map URL.
- **T13 Enquiry API** — validate (zod) → **rate-limit by hashed IP, DB-backed** (`0003_rate_limits.sql`, in-memory fails on serverless) → insert via **service-role client** after validation (NOT anon PostgREST insert). Private `enquiry-attachments` bucket (10MB; jpeg/png/webp/avif/pdf), admin-only access.
- **T14 Enquiry admin** — list/search/filter by status+division; detail view; attachment via short-lived signed URL (bucket stays private); status flow new→contacted→in_progress→completed→archived. Then full suite green + `git tag cms-complete`.

**Definition of done (Plan 1):** vitest + playwright green; admin can log in, upload a photo, edit every content type; anon cannot read drafts or reach any admin route/mutation; no build artifact contains the service-role key; no invented fact published.

## 4. Plan 2 — Public cinematic site (to author after CMS)

Not yet written. When CMS is done (or runs in parallel if you change the order), author `docs/.../plan-2-public-site.md` covering: cinematic homepage (hero "ANY LOAD. ANY ROAD.", company intro, 3 division panels, services, heavy-machinery, heavy-haulage showcase "WE MOVE WHAT OTHERS CAN'T.", fleet, timeline, Pan-India map, industries, projects gallery, why-us, testimonials, FAQ, final CTA, footer); the five pages (About, Krishna Trailor, Heavy Haulage, Radhe Travels, Fleet, Projects, Contact); and the animation layer (GSAP + ScrollTrigger + Motion; Three.js only for 1–2 selected scenes; `prefers-reduced-motion`; usable without animation). All content read from the CMS query layer. **Before writing Plan 2, inspect frames from both reference videos** (detailsdotso = 70% cinematic B/W; musemind = 30% soft-blue isometric) to lock the visual direction; Radhe Travels gets its own softer identity.

## 5. Immediate next actions (awaiting go)
1. `git restore .` + `pnpm install` (restore the wiped working tree).
2. Triage & close the Task 4 review; record verdict in the SDD ledger.
3. Start Task 5 (seed) against the chosen Supabase backend.
