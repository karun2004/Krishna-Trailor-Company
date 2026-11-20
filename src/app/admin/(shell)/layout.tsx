import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/Sidebar'

async function signOut() {
  'use server'
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// The (shell) route group keeps /admin/login outside this layout (no redirect loop).
export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin()
  return (
    <div className="min-h-screen bg-soft text-black">
      <Sidebar signOut={signOut} email={user.email ?? ''} />
      <div className="md:pl-64">{children}</div>
    </div>
  )
}
