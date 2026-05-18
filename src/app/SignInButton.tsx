'use client'
import { createClient } from '@/lib/db-client'

export default function SignInButton() {
  async function handleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  )
}
