import { createServerSupabaseClient, createServiceClient } from './db'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function isAdmin(googleId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('admins')
    .select('id')
    .eq('google_id', googleId)
    .single()
  return !!data
}

export async function getClientByGoogleId(googleId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('google_id', googleId)
    .single()
  return data
}
