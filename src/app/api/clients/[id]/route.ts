import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/db'
import { getAuthUser, isAdmin } from '@/lib/auth'

async function requireAdmin() {
  const user = await getAuthUser()
  if (!user) return null
  const googleId = user.user_metadata.sub || user.id
  return (await isAdmin(googleId)) ? user : null
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('clients')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
