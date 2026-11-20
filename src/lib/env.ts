import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Public origin for canonical URLs, sitemap and JSON-LD. Blank/unset falls back to the local dev origin.
  NEXT_PUBLIC_SITE_URL: z.preprocess((v) => (v === '' ? undefined : v), z.url().default('http://localhost:3100')),
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

// Public (browser-safe) variables only; server secrets are read where they are used.
// Property accesses must stay literal: Next only inlines NEXT_PUBLIC_* into the
// browser bundle for literal `process.env.NAME` expressions.
export const env: Env = parseEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})
