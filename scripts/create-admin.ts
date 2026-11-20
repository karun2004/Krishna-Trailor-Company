/**
 * Create an admin user: prompts for email + password (hidden), creates the auth
 * user and a profiles row with role = 'admin'. No default password exists.
 *
 *   pnpm create-admin
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment
 * (pnpm script loads .env.local). DOCUMENTED EXEMPTION: this lives in scripts/, outside
 * src/ (the confinement scan covers src/ only), and cannot use createAdminClient()
 * because that module is `server-only` and throws outside a React Server environment.
 */
import { createInterface } from 'node:readline'
import { createClient } from '@supabase/supabase-js'

function ask(question: string, hidden: boolean): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    if (hidden) {
      // Suppress echo of typed characters; the prompt itself is written first.
      const rlAny = rl as unknown as { _writeToOutput: (s: string) => void }
      const original = rlAny._writeToOutput.bind(rl)
      rlAny._writeToOutput = (s: string) => {
        if (s.startsWith(question)) original(s)
      }
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) process.stdout.write('\n')
      resolve(answer)
    })
  })
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.example).')
  }
  const email = (await ask('Admin email: ', false)).trim()
  const password = await ask('Password (min 12 chars): ', true)
  const confirm = await ask('Confirm password: ', true)
  if (!email) throw new Error('Email is required.')
  if (password.length < 12) throw new Error('Password must be at least 12 characters.')
  if (password !== confirm) throw new Error('Passwords do not match.')

  const svc = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const created = await svc.auth.admin.createUser({ email, password, email_confirm: true })
  if (created.error || !created.data.user) {
    throw new Error(`Could not create user: ${created.error?.message}`)
  }
  const id = created.data.user.id
  const { error } = await svc.from('profiles').insert({ id, role: 'admin' })
  if (error) {
    await svc.auth.admin.deleteUser(id) // do not leave a half-created user behind
    throw new Error(`Could not create admin profile: ${error.message}`)
  }
  console.log(`Admin created: ${email}`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
