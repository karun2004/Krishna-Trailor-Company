import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v)

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Optional here; createAdminClient() enforces presence at call time.
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
})

export type Env = z.infer<typeof schema>

// Structurally a superset-compatible stand-in for NodeJS.ProcessEnv (which also accepts it).
export type RawEnv = Record<string, string | undefined>

export function parseEnv(raw: RawEnv): Env {
  const result = schema.safeParse(raw)
  if (!result.success) {
    const problems = result.error.issues
      .map((i) => {
        const name = i.path.join('.')
        const missing = raw[name] === undefined || raw[name] === ''
        return `${name} (${missing ? 'missing' : 'invalid'})`
      })
      .join(', ')
    throw new Error(`Invalid environment variables: ${problems}`)
  }
  return result.data
}

// Property accesses must stay literal: Next only inlines NEXT_PUBLIC_* into the
// browser bundle for literal `process.env.NAME` expressions.
export const env: Env = parseEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
})
