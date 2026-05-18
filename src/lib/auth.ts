import { createServerSupabaseClient, createServiceClient } from './db'

export async function getAuthUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
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
