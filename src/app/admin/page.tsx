import { requireAdmin } from '@/lib/auth'

// Placeholder; the admin shell and dashboard arrive in Task 8.
export default async function AdminHome() {
  const { user } = await requireAdmin()
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-2xl">Admin</h1>
      <p className="mt-2 text-sm">Signed in as {user.email}</p>
    </main>
  )
}
