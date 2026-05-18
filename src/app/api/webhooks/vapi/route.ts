import { NextRequest, NextResponse } from 'next/server'
import { validateVapiWebhook } from '@/lib/vapi'
import { createServiceClient } from '@/lib/db'
import { sendSms } from '@/lib/twilio'
import { createBooking } from '@/lib/cal'
import { detectEscalationTrigger, buildEscalationSms, buildBookingConfirmationSms } from '@/lib/escalation'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-vapi-signature') ?? ''

  if (!validateVapiWebhook(signature, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  // Only process end-of-call events with transcript
  if (event.type !== 'end-of-call-report') {
    return NextResponse.json({ ok: true })
  }

  const supabase = createServiceClient()
  const { call } = event

  // Find client by their Vapi assistant ID
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('vapi_assistant_id', call.assistantId)
    .single()

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const transcript: string = call.transcript ?? ''
  const callerNumber: string = call.customer?.number ?? 'unknown'
  const durationSec: number = Math.round((call.endedAt - call.startedAt) / 1000)

  // Detect escalation
  const escalationTrigger = detectEscalationTrigger(transcript, client.urgent_keywords)

  // Extract booking info from structured data Vapi provides
  const structuredData = call.analysis?.structuredData ?? {}
  const customerName: string = structuredData.name ?? 'Customer'
  const customerPhone: string = structuredData.phone ?? callerNumber
  const serviceType: string = structuredData.service ?? 'General Service'
  const preferredTime: string = structuredData.preferredTime ?? ''

  let booked = false
  let calEventId: string | null = null

  // Create booking if not escalated and we have enough info
  if (!escalationTrigger && preferredTime && customerPhone !== 'unknown') {
    try {
      const booking = await createBooking({
        eventTypeId: parseInt(process.env.CAL_EVENT_TYPE_ID!),
        name: customerName,
        email: `${customerPhone.replace(/\D/g, '')}@noemail.placeholder`,
        phone: customerPhone,
        startTime: preferredTime,
        notes: `Service: ${serviceType}. Called: ${callerNumber}`,
      })
      calEventId = booking.uid
      booked = true

      // SMS confirmation to customer
      const confirmationMsg = buildBookingConfirmationSms({
        businessName: client.business_name,
        scheduledAt: preferredTime,
        serviceType,
      })
      await sendSms(customerPhone, confirmationMsg)
    } catch (err) {
      console.error('Booking creation failed:', err)
    }
  }

  // Save call record
  const { data: callRecord } = await supabase
    .from('calls')
    .insert({
      client_id: client.id,
      caller_number: callerNumber,
      duration_sec: durationSec,
      transcript,
      intent: escalationTrigger ? 'escalated' : booked ? 'booking' : 'inquiry',
      booked,
      escalation_trigger: escalationTrigger,
    })
    .select()
    .single()

  // Save booking record
  if (booked && calEventId) {
    await supabase.from('bookings').insert({
      client_id: client.id,
      call_id: callRecord?.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      service_type: serviceType,
      scheduled_at: preferredTime,
      cal_event_id: calEventId,
      status: 'confirmed',
    })
  }

  // Send escalation SMS to owner
  if (escalationTrigger) {
    const escalationMsg = buildEscalationSms(callerNumber, escalationTrigger, transcript)
    await sendSms(client.owner_cell, escalationMsg)
  }

  return NextResponse.json({ ok: true })
}
