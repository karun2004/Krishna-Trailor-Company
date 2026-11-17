/**
 * Shared helpers for integration tests that run against the LOCAL Supabase stack
 * (`pnpm exec supabase start`). Lives outside `src/` on purpose: the service-role
 * key must never be referenced from application source (see the server-only scan
 * in src/lib/supabase/__tests__). Keys are read at runtime from the CLI's own
 * `status -o env` output and are never written to a tracked file.
 */
import { execFileSync } from 'node:child_process'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type LocalEnv = { url: string; anonKey: string; serviceKey: string }

let cached: LocalEnv | undefined

function parseDotenv(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

export function localEnv(): LocalEnv {
  if (cached) return cached
  let raw: string
  try {
    raw = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'env'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (e) {
    throw new Error(
      `Could not read local Supabase status. Is the stack running (pnpm exec supabase start)?\n${String(e)}`,
    )
  }
  const v = parseDotenv(raw)
  const url = v.API_URL
  const anonKey = v.ANON_KEY
  const serviceKey = v.SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) {
    throw new Error('supabase status did not report API_URL / ANON_KEY / SERVICE_ROLE_KEY')
  }
  cached = { url, anonKey, serviceKey }
  return cached
}

const noSession = { auth: { autoRefreshToken: false, persistSession: false } }

/** Service-role client: bypasses RLS. Test setup/teardown and ground-truth reads only. */
export function serviceClient(): SupabaseClient {
  const { url, serviceKey } = localEnv()
  return createClient(url, serviceKey, noSession)
}

/** Anonymous (public site visitor) client. */
export function anonClient(): SupabaseClient {
  const { url, anonKey } = localEnv()
  return createClient(url, anonKey, noSession)
}

export type TestUser = {
  id: string
  email: string
  /** Client signed in as this user (role `authenticated`). */
  client: SupabaseClient
  /** Delete the auth user (cascades to its profile row). Idempotent; throws if deletion genuinely fails. */
  remove: () => Promise<void>
}

/** Delete an auth user; an already-missing user is fine (idempotent), anything else throws. */
async function deleteAuthUser(svc: SupabaseClient, id: string): Promise<void> {
  const { error } = await svc.auth.admin.deleteUser(id)
  if (error && error.status !== 404 && (error as { code?: string }).code !== 'user_not_found') {
    throw new Error(`deleteUser(${id}) failed: ${error.message}`)
  }
}

/**
 * Create a throwaway confirmed auth user with a runtime-random password,
 * optionally granting it an admin profile via the service role.
 *
 * If any step after the auth user is created fails, the user (and its profile,
 * via ON DELETE CASCADE) is deleted before the original error is rethrown. If
 * that cleanup also fails, BOTH errors are reported.
 *
 * `profileRole` exists so tests can force the profile insert to fail.
 */
export async function createTestUser(opts: {
  admin: boolean
  profileRole?: string
}): Promise<TestUser> {
  const svc = serviceClient()
  const email = `rls-${crypto.randomUUID()}@example.test`
  const password = crypto.randomUUID() + crypto.randomUUID()
  const created = await svc.auth.admin.createUser({ email, password, email_confirm: true })
  if (created.error || !created.data.user) {
    throw new Error(`createUser failed: ${created.error?.message}`)
  }
  const id = created.data.user.id
  try {
    if (opts.admin) {
      const { error } = await svc.from('profiles').insert({ id, role: opts.profileRole ?? 'admin' })
      if (error) throw new Error(`profile insert failed: ${error.message}`)
    }
    const { url, anonKey } = localEnv()
    const client = createClient(url, anonKey, noSession)
    const signedIn = await client.auth.signInWithPassword({ email, password })
    if (signedIn.error) throw new Error(`signIn failed: ${signedIn.error.message}`)
    return { id, email, client, remove: () => deleteAuthUser(svc, id) }
  } catch (original) {
    try {
      await deleteAuthUser(svc, id)
    } catch (cleanup) {
      throw new Error(
        `createTestUser failed AND cleanup failed.\n  original: ${String(original)}\n  cleanup: ${String(cleanup)}`,
        { cause: original },
      )
    }
    throw original
  }
}
