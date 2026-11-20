import type { Db, QueryOpts } from './types'

export async function getDb(opts?: QueryOpts): Promise<Db> {
  if (opts?.client) return opts.client
  const { createServerClient } = await import('@/lib/supabase/server')
  return (await createServerClient()) as unknown as Db
}

export function check<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what} read failed: ${res.error.message}`)
  return (res.data ?? ([] as unknown)) as T
}
