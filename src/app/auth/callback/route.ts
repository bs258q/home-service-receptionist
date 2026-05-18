import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db'
import { isAdmin, getClientByGoogleId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      const googleId = session.user.user_metadata.sub || session.user.id
      const admin = await isAdmin(googleId)
      if (admin) return NextResponse.redirect(new URL('/admin', request.url))
      const client = await getClientByGoogleId(googleId)
      if (client) return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  return NextResponse.redirect(new URL('/', request.url))
}
