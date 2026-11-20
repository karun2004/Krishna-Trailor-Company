import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

async function signIn(formData: FormData) {
  'use server'
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) redirect('/admin/login?error=1')

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) redirect('/admin/login?error=1')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    redirect('/admin/login?error=1')
  }
  redirect('/admin')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center bg-soft p-4">
      <form
        action={signIn}
        className="w-full max-w-sm space-y-5 rounded-lg bg-white p-8 shadow-sm"
      >
        <h1 className="font-display text-2xl text-navy">Admin sign in</h1>
        {error && (
          <p role="alert" className="rounded bg-blue px-3 py-2 text-sm text-navy">
            Sign-in failed. Check your details and try again.
          </p>
        )}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username"
            className="w-full rounded border border-navy/30 px-3 py-2" />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password"
            className="w-full rounded border border-navy/30 px-3 py-2" />
        </div>
        <button type="submit"
          className="w-full rounded bg-orange px-4 py-2 font-medium text-black hover:opacity-90">
          Sign in
        </button>
      </form>
    </main>
  )
}
