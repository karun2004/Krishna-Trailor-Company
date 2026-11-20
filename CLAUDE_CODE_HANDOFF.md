# KTC — Claude Code Handoff Brief & Continuation Plan

> Hand this file to Claude Code on the Mac (`claude` in `/Users/karun/Documents/@KTC`). It contains (A) the current state, (B) an ordered set of instructions to run — **set up token-saving infrastructure first**, then resume the build, (C) the recommended skill set, and (D) the roadmap. The detailed task spec with every carry-forward ruling lives in `docs/CONTINUATION_PLAN.md` and `docs/superpowers/plans/2026-11-18-ktc-foundation-and-cms.md`.

---

## A. Current state (do not rebuild)

Branch `feat/foundation-and-cms`. Foundation **done & committed**: Task 1 (Next 15 + Tailwind v4 scaffold, design tokens, fonts, Vitest), Task 2 (Supabase clients + zod env + service-role key confinement), Task 3 (`0001_core.sql`: media/divisions/settings/profiles + RLS + `media` bucket), Task 4 (`0002_content.sql`: all content tables + RLS/grants, 191 int tests green — **review never finished**).

Two cleanups needed before new work:
1. **Working tree is not checked out** — all tracked files show deleted on disk (safe in git). Run `git restore .` then `pnpm install`.
2. **Task 4 review is open** — triage the deferred minors in `.superpowers/sdd/2026-11-18-ktc-foundation-and-cms/progress.md` and record a verdict before Task 5.

Verified env (Mac): Node 24, pnpm 12, Docker Desktop (installed; must be running for local Supabase), Supabase CLI as a devDependency, Playwright chromium present.

---

## B. Instructions for Claude Code — run in this order

### STEP 0 — Restore and install
```bash
cd /Users/karun/Documents/@KTC
git restore .
pnpm install
```
Confirm `pnpm vitest run` passes (unit suite) before continuing.

### STEP 1 — Set up Headroom FIRST (compress large tool outputs)
Goal: reduce tokens burned on large tool/log/JSON outputs before the long CMS build.
1. Clone and read its own maintained install docs — do not assume commands:
   ```bash
   git clone https://github.com/headroomlabs-ai/headroom.git ~/tools/headroom
   ```
2. Open `~/tools/headroom/README.md`, follow the **current** installation + activation steps exactly (plugin/hook registration, config, any `.claude` wiring it specifies).
3. **Verify it is actually running** — trigger a large tool output and confirm Headroom compresses it (per the README's verification/health check). Do **not** proceed until you can show it is active; report the exact evidence.
4. Use only its supported compression mechanisms. Do not assume it reduces every token automatically.

### STEP 2 — Then set up a token-saver: Caveman (or Claude-Mem)
After Headroom is confirmed running, add ONE of these and verify it:
- **Caveman** (`https://github.com/JuliusBrussee/caveman.git`) — concise agent output / less verbosity. Recommended primary token-saver. Install per its README, verify responses are leaner. **Do not** let it strip required technical detail, test steps, or verification evidence.
- **Claude-Mem** (`https://github.com/thedotmack/claude-mem.git`) — persistent memory of architecture/decisions/milestones across sessions. Optional; note it overlaps the existing `.superpowers` SDD ledger, so only add it if you want memory *outside* that ledger. If used, store decisions, not full transcripts.

Confirm each is installed and active; report what you set up and the evidence it's working.

### STEP 3 — Confirm the execution workflow
Use **superpowers:subagent-driven-development** (already used for Tasks 1–4) as the execution spine. Do **not** introduce a second planner (no GSD, no BMAD) — one planning system only.

### STEP 4 — Close Task 4, then build Tasks 5–14
Backend: **local Supabase via Docker** (start Docker, `pnpm exec supabase start`). Cloud project is only needed at deploy. Then execute Tasks 5–14 test-first from the plan, honoring the carry-forward rulings in §D.

---

## C. Recommended skill set (lean — don't load all 24)

**Core (CMS phase, now):**
- `superpowers` — SDD/TDD execution spine (in use).
- `mattpocock/skills` — TypeScript/React correctness.
- `ponytail` — lean, minimal-dependency code guardrail.

**Infra / token-saving (per §B):** `headroom` (set up first), then `caveman` (or `claude-mem`).

**Add later — Plan 2 (public site) & QA:**
- `ui-ux-pro-max-skill` — design system / responsive layout patterns.
- `taste-skill` — frontend visual polish & interaction quality.
- `impeccable` — design critique after sections are built.
- `addyosmani/agent-skills` — frontend performance / Core Web Vitals.
- `gstack` — browser testing / QA / release checks before deploy.
- `diagram-design` — heavy-haulage process + logistics diagrams.
- `Agent-Reach` — competitor / visual-inspiration research for Plan 2.

**Optional / situational:** `archify` OR `Understand-Anything` OR `graphify` (architecture/codebase mapping — pick at most one; they overlap). `last30days-skill`, `karpathy-skills` only for a specific gap.

**Skip:** `get-shit-done` & `BMAD-METHOD` (duplicate planners), `ECC` (duplicates superpowers review/hooks), `hyperframes` (promo video, not a web engine), `ghidra` (reverse-engineering — irrelevant), `career-ops` (irrelevant).

---

## D. Roadmap — Plan 1 (CMS) Tasks 5–14, with carry-forward rulings

- **T5 Seed** — 3 divisions, 8 services (live-site, published), fleet categories, offices (Chandigarh + Bhopal), timeline (1987/expansion/fleet/today), FAQs, homepage copy. **Do NOT seed client_logos** (unverified + SQL can't make storage objects → upload via admin). `published=true` on `page_content` + `seo_metadata`; testimonials stay unpublished; every unverified fact drafted with `verification_note`.
- **T6 Query layer** — `resolveMedia()` returns `null` for missing assets (no throw); filter `media_id is not null`; unpublished-everything returns `[]` (omit the section).
- **T7 Auth** — `requireAdmin()` guards every mutation server-side; `scripts/create-admin.ts`, no default password; Playwright global-setup makes an admin via service role with a random password, torn down after.
- **T8 Dashboard** — counts from one aggregate query; responsive sidebar.
- **T9 Media pipeline** — `requireAdmin()` → validate MIME (jpeg/png/webp/avif) + 10MB **before** storage write → decode with **`sharp`** (add dep). Add `file_size_limit`+`allowed_mime_types` to the `media` bucket via migration. **Re-run `pnpm check:leak`** here (first route importing `admin.ts`).
- **T10 Media library** — drag-drop, search, category filter, alt/caption, replace, reorder, delete, usage lookup.
- **T11 CRUD primitives** — `EntityForm<T>`, `DataTable<T>`, `SortableList` (**up/down buttons, no DnD dep**), `MediaPicker`; Server Actions → `requireAdmin()` → `revalidatePath()`.
- **T12 Admin screens** — divisions, fleet, projects (multi-image before/during/after), gallery, timeline, testimonials, faqs, clients, offices, homepage, settings, seo; contact screen persists phone/email/WhatsApp/address/socials/map.
- **T13 Enquiry API** — zod validate → **DB-backed rate limit by hashed IP** (`0003_rate_limits.sql`) → insert via **service-role** client (not anon). Private `enquiry-attachments` bucket (10MB; jpeg/png/webp/avif/pdf).
- **T14 Enquiry admin** — list/search/filter; detail; attachment via short-lived signed URL; status flow new→contacted→in_progress→completed→archived. Then full suite green + `git tag cms-complete`.

**Plan 2 (public cinematic site + animations):** author only after CMS. First inspect frames from both reference videos (detailsdotso ≈70% cinematic B/W; musemind ≈30% soft-blue isometric); Radhe Travels gets its own softer identity; all content read from the CMS query layer.

---

## E. Guardrails
No invented company facts (drafts + `verification_note` for anything unconfirmed). Service-role key only in `src/lib/supabase/admin.ts`. RLS is defense-in-depth, never the only guard. Reusable components; avoid unnecessary dependencies. Git checkpoint after each task. Verify before claiming a task done.
