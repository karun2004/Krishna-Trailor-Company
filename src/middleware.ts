import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

/**
 * Fast-path gate for /admin pages (first line). Server-side requireAdmin() in
 * pages, actions and route handlers is the authoritative check; RLS is the third.
 */
export async function middleware(request: NextRequest) {
  const loginUrl = new URL('/admin/login', request.url)
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next()

  let response = NextResponse.next({ request })
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  if (!data.user) return NextResponse.redirect(loginUrl)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
  if (profile?.role !== 'admin') return NextResponse.redirect(loginUrl)
  return response
}

// Matches /admin and /admin/*; /admin/login is passed through inside the handler.
export const config = { matcher: ['/admin/:path*'] }
