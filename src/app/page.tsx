import { createServerSupabaseClient } from '@/lib/db'
import { isAdmin, getClientByGoogleId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SignInButton from './SignInButton'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const googleId = user.user_metadata.sub || user.id
    const admin = await isAdmin(googleId)
    if (admin) redirect('/admin')
    const client = await getClientByGoogleId(googleId)
    if (client) redirect('/portal')
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">AI Receptionist</h1>
        <SignInButton />
      </div>
    </main>
  )
}
