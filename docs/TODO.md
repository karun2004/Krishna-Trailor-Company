# TODO

Open items before the site goes live. Part A needs a person at the company or a person with hosting access. Part B is engineering follow-up that does not block launch unless noted.

## A. Needs a human

### Content facts
- [ ] Confirm the eight service names against the live site (`docs/WEBSITE_CONTENT.md`, Services). They were derived from fleet categories.
- [ ] Confirm the division names, especially "KTC Heavy Machinery".
- [ ] Confirm the Bhopal office: address, phone and email. Until then, unpublish it or accept that it shows with no details.
- [ ] Confirm the "38+ years" and "1 MT to 250 MT" claims, then publish or delete the draft homepage blocks and the FAQ answer.
- [ ] Confirm the headline and summary copy (homepage hero, division summaries, SEO descriptions).
- [ ] Confirm the company settings and contact details, which are live as soon as the database is seeded.

### Media
- [ ] Upload real photography for each division, fleet item, and project.
- [ ] Upload the hero vehicle cut-out (transparent background) so the scrubbed hero shows the vehicle. Without it the hero shows only the headline.
- [ ] Upload client logos (about nine, per the project ledger) with names and website URLs.
- [ ] Set alt text on every uploaded photo.

### Testimonials
- [ ] Collect real testimonials. Get each client's written approval of the exact wording, then set Approved and Published. Remove the placeholder row.

### Hosting and deployment
- [ ] Create the hosted Supabase project.
- [ ] Link and push migrations: `pnpm exec supabase link --project-ref <ref>` then `pnpm exec supabase db push` (uses `SUPABASE_DB_PASSWORD`).
- [ ] Load the seed content on the hosted project if wanted. `supabase db push` runs migrations only, so insert `supabase/seed.sql` through the SQL editor or a one-off `psql` session. The seed is idempotent.
- [ ] Set Vercel environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (the real public origin, no trailing slash), and `ENQUIRY_IP_PEPPER` (a long random string). Mark the service-role key as sensitive.
- [ ] LAUNCH BLOCKER: disable public signups in the hosted Supabase project (Auth -> Providers -> Email -> disable sign-ups; also keep anonymous sign-ins off). `verification_note` is readable by any signed-in non-admin user on published rows (migration 0003 only revokes it from anon), so no one but admins may be able to create an account. Local `supabase/config.toml` already sets `enable_signup = false`.
- [ ] Set `ENQUIRY_IP_PEPPER` to a secret of at least 16 characters: in production the enquiry API returns 500 without it.
- [ ] Create the first admin user with `pnpm create-admin` against the hosted project. Use a password manager.
- [ ] Set up the domain and DNS, and the Vercel project domain. Check the canonical URLs and sitemap after the domain is live.
- [ ] Set the Supabase Auth site URL and redirect URLs to the live domain.
- [ ] Decide who receives enquiry emails or alerts. The site stores enquiries in the admin area only; nothing is emailed today.

## B. Engineering follow-up

### Blocks launch (security or correctness)
- [ ] `ENQUIRY_IP_PEPPER` falls back to a hard-coded value in `src/lib/rate-limit.ts` (`hashIp`). In production this should fail closed when the variable is missing. Set it on Vercel first (A above).
- [ ] `verification_note` is still readable by any signed-in non-admin on published rows. `0003` revoked SELECT from `anon` only, and `authenticated` keeps table-level SELECT. Column grants cannot differ by admin status, so the fix is structural: move the notes into an admin-only table (or a view restricted to admins) and update the admin forms. Add a test in `rls.hide-notes.int.test.ts` that a non-admin cannot read the notes. Low practical risk today, since only admin accounts exist.

### Should fix before launch
- [ ] Confirm `e2e/site-qa.spec.ts` and `@axe-core/playwright` are committed and that the spec passes. It is new and uncommitted at the time of writing.
- [ ] Make `scripts/check-no-secret-leak.sh` distinguish a `grep` error (exit 2) from no match (exit 1). Right now an error passes silently. Then run it after `pnpm build` with a sentinel value, not the variable name.
- [ ] Wire the test commands into CI (no workflow exists in the repository): `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm check:leak`. Integration and e2e need the local Supabase stack.
- [ ] Fix the timeline seed: `timeline_milestones.year` is text, and the published "Today" milestone displays "Today" in the year slot. Replace it with a real label or change the seed (drafts "Expansion" and "Fleet" need real years before publishing).

### Cleanup
- [ ] Migration numbering gap: `0005` to `0009` do not exist. Either renumber or add a note in the migrations README. Do not rename files already applied to a hosted database.
- [ ] `supabase/migrations/0012_rate_limits.sql` has the header comment `0011_rate_limits`. Correct the comment.
- [ ] Remove unused helpers: `pageMetadata` (`src/components/site/pages/seo.ts`) and `divisionMetadata` (`src/components/site/division/data.ts`), plus the re-export in `src/components/site/division/index.ts`.
- [ ] Remove the stub `src/app/api/admin/services/route.ts`, or give it a real purpose. Services are saved through Server Actions.
- [ ] Homepage editor edits raw JSON. Replace it with per-key fields, or at least a keyed form. Admins can break the layout with a bad key.
- [ ] `scripts/create-admin.ts` reads the service-role key directly. Keep it out of `src/`; consider a shared script helper that validates the key and URL the same way `createAdminClient()` does.
- [ ] `scripts/with-lock.sh` writes its lock to `/tmp`. That is fine on macOS, but it breaks if the path is not writable. Consider a per-repo lock file.
- [ ] `DELETE /api/admin/media/[id]` does not block when the asset is in use. The UI warns first, but the API should refuse, or require a `force` flag.
- [ ] Stray untracked files in the repository root: `_tmp_8_*` (eight entries). Identify and delete them, or add them to `.gitignore`.
- [ ] Several e2e specs were written in the same pass as the code, so they check the implementation rather than the requirements. Review them after the content is final.
- [ ] Deferred minors from the foundation build (`.superpowers/sdd/2026-11-18-ktc-foundation-and-cms/progress.md`):
  - `media_assets` rows linked to unpublished divisions are readable by anon (storage path, alt, caption). Acceptable while drafts are not sensitive; revisit if they must stay private.
  - `env.ts` `NEXT_PUBLIC_SITE_URL` uses `z.url()`, which accepts any scheme. Restrict to http and https.
  - Trim whitespace before `min(1)` on keys.
  - RLS tests for profiles do not assert error code `42501`. The admin-role update test sets the role to its existing value, so it cannot detect a change.
  - `tests/support/db.int.test.ts`: cleanup errors are ignored, and the "cleanup itself fails" branch is untested.
  - `check-no-secret-leak.sh` exit-code handling (see above).
