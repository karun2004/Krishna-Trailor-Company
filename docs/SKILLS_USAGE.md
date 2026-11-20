# Skills and tooling used

How the foundation and public-site work was produced. Source: the SDD ledger in `.superpowers/sdd/2026-11-18-ktc-foundation-and-cms/progress.md` and the plan headers in `docs/superpowers/plans/`.

## Workflow

- **Planning**: written plans in `docs/superpowers/plans/` (foundation and CMS, 2026-11-18; public site, 2026-11-21).
- **Execution**: `superpowers:subagent-driven-development`. One implementer subagent per task (Sonnet), each followed by a reviewer. Security-sensitive work (RLS, grants, storage) was reviewed by Opus. Each task had a dated brief and a report under `.superpowers/sdd/`.
- **Ledger**: `progress.md` records rulings, deferred minors and carry-forwards. Treat it as the history of decisions.

## Tooling in the repository

- Next.js, React and TypeScript for the app.
- Supabase CLI (`pnpm exec supabase`) for the local stack, migrations and seed.
- Vitest for unit and integration tests; Playwright and `@axe-core/playwright` for e2e and accessibility checks.
- ESLint for linting; sharp for image decoding.
- Shell scripts: `scripts/check-no-secret-leak.sh`, `scripts/with-lock.sh`.

## Documentation for this branch

- `docs/ARCHITECTURE.md`, `docs/ADMIN_GUIDE.md`, `docs/WEBSITE_CONTENT.md`, `docs/TODO.md`: written from the code and seed, with greps used to check claims.
- `README.md`: setup and commands.
