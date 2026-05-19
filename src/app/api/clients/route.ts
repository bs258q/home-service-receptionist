import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/db'
import { getAuthUser, isAdmin } from '@/lib/auth'
import { provisionPhoneNumber } from '@/lib/twilio'
import { cloneAssistant } from '@/lib/vapi'
import { getSchedulingLink } from '@/lib/cal'

async function requireAdmin() {
  const user = await getAuthUser()
  if (!user) return null
  const googleId = user.user_metadata.sub || user.id
  const admin = await isAdmin(googleId)
  return admin ? user : null
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('clients')
    .select('id, name, business_name, email, twilio_number, active, created_at')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, businessName, email, ownerCell, urgentKeywords, afterHoursEscalate } = body

  const supabase = createServiceClient()

  const twilioNumber = process.env.TWILIO_NUMBER ?? await provisionPhoneNumber(process.env.TWILIO_AREA_CODE ?? '415')
  const calLink = getSchedulingLink('bandhavi-sakhamuri-tydmvi', 'home-service-automation')
  const vapiAssistantId = await cloneAssistant({
    businessName,
    calLink,
    ownerCell,
    urgentKeywords: urgentKeywords ?? [],
  })

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name,
      business_name: businessName,
      email,
      owner_cell: ownerCell,
      urgent_keywords: urgentKeywords ?? [],
      after_hours_escalate: afterHoursEscalate ?? true,
      twilio_number: twilioNumber,
      vapi_assistant_id: vapiAssistantId,
      cal_link: calLink,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
