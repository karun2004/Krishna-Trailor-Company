# Krishna Trailor Company

Public website and admin CMS for Krishna Trailor Company. Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Postgres, Auth, Storage).

- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Admin guide for staff: [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md)
- Content status: [`docs/WEBSITE_CONTENT.md`](docs/WEBSITE_CONTENT.md)
- Open items: [`docs/TODO.md`](docs/TODO.md)

## Prerequisites

- Node.js 24 and pnpm
- Docker Desktop (running), for the local Supabase stack

## Setup

```bash
pnpm install

# Local Supabase (Postgres, Auth, Storage, Studio). Needs Docker running.
pnpm exec supabase start
pnpm exec supabase db reset     # applies supabase/migrations and supabase/seed.sql

# Environment
cp .env.example .env.local
pnpm exec supabase status -o env   # copy the local URL, anon key and service_role key into .env.local
```

`.env.local` must define:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe in the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Bypasses RLS. Never expose or commit it. |
| `ENQUIRY_IP_PEPPER` | Secret used to hash client IPs for enquiry rate limiting |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemap and JSON-LD. Defaults to `http://localhost:3100` when blank |
| `SUPABASE_DB_PASSWORD` | Only for `supabase db push` to a hosted project |

Create the first admin account (prompts for email and password):

```bash
pnpm create-admin
```

## Run

```bash
pnpm dev        # http://localhost:3000, admin at /admin/login
```

## Test

```bash
pnpm test         # unit tests (Vitest), no network
pnpm test:int     # integration tests (RLS, seed, queries, rate limit); needs local Supabase running
pnpm e2e          # Playwright (chromium); starts its own dev server on port 3100
pnpm lint         # ESLint
pnpm build        # production build
pnpm check:leak <sentinel>   # after `pnpm build`: fails if the sentinel string is in the client bundle
```

`pnpm e2e` writes `.env.local` with local keys if it is missing, and creates and deletes its own admin and non-admin accounts with random passwords. Run e2e and build through `scripts/with-lock.sh` when other processes share the port or `.next`:

```bash
scripts/with-lock.sh pnpm e2e
```

## Database

- Migrations live in `supabase/migrations/` and run in filename order. Numbers `0005` to `0009` are intentionally absent.
- Local: `pnpm exec supabase db reset` rebuilds from migrations and seed. Do not run it while other processes use the stack.
- Hosted: `pnpm exec supabase link --project-ref <ref>`, then `pnpm exec supabase db push`. Push migrations only. Load `supabase/seed.sql` separately if you want the starting content.

## Deploy

Vercel (or any Node host that supports Next.js 15):

1. Connect the repository and set the Production environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (mark sensitive), `NEXT_PUBLIC_SITE_URL` (the live origin, no trailing slash), and `ENQUIRY_IP_PEPPER` (a long random string).
2. Push migrations to the hosted Supabase project (see Database).
3. In Supabase Auth, set the site URL and redirect URLs to the live domain.
4. Create the first admin by running `pnpm create-admin` with the hosted project's values in `.env.local`. Do not commit that file.
5. Check `/sitemap.xml` and `/robots.txt` on the live domain. `/admin` and `/api` are disallowed for crawlers.

## Project layout

```
src/app/          routes: (site) public pages, admin/ screens, api/ route handlers
src/components/   site/ (public design system and motion), admin/ (forms, lists, media library)
src/lib/          auth, env, Supabase clients, public query layer, admin actions, validation
supabase/         migrations, seed, local config
e2e/              Playwright specs
tests/support/    integration-test helpers
scripts/          create-admin, secret-leak check, lock helper
```

Implementation plans live in `docs/superpowers/plans/`.
