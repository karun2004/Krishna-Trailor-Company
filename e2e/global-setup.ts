import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { localEnv } from '../tests/support/db'
import { STATE_FILE, type E2EState } from './state'

/** Creates a throwaway admin and a throwaway non-admin with runtime-random passwords. */
export default async function globalSetup() {
  const { url, serviceKey } = localEnv()
  const svc = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const mk = async (admin: boolean) => {
    const email = `e2e-${admin ? 'admin' : 'user'}-${crypto.randomUUID()}@example.test`
    const password = crypto.randomUUID() + crypto.randomUUID()
    const c = await svc.auth.admin.createUser({ email, password, email_confirm: true })
    if (c.error || !c.data.user) throw new Error(`createUser failed: ${c.error?.message}`)
    const id = c.data.user.id
    if (admin) {
      const { error } = await svc.from('profiles').insert({ id, role: 'admin' })
      if (error) {
        await svc.auth.admin.deleteUser(id)
        throw new Error(`profile insert failed: ${error.message}`)
      }
    }
    return { id, email, password }
  }
  const adminUser = await mk(true)
  const nonAdmin = await mk(false)
  const state: E2EState = { url, serviceKey, admin: adminUser, nonAdmin }
  mkdirSync(dirname(STATE_FILE), { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(state), { mode: 0o600 })

  return async () => {
    for (const u of [adminUser, nonAdmin]) await svc.auth.admin.deleteUser(u.id) // cascades profile
    rmSync(STATE_FILE, { force: true })
  }
}
