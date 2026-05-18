import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db'

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }

  return NextResponse.redirect(data.url)
}
