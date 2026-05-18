import { createServerSupabaseClient } from '@/lib/db'
import { isAdmin, getClientByGoogleId } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const googleId = session.user.user_metadata.sub || session.user.id
    const admin = await isAdmin(googleId)
    if (admin) redirect('/admin')
    const client = await getClientByGoogleId(googleId)
    if (client) redirect('/portal')
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">AI Receptionist</h1>
        <form action="/api/auth/google" method="POST">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  )
}
