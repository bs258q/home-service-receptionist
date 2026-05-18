import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }

  return NextResponse.redirect(data.url)
}
