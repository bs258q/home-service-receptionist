const CAL_BASE = 'https://api.cal.com/v1'

async function calRequest(path: string, method: string, body?: object) {
  const url = `${CAL_BASE}${path}?apiKey=${process.env.CAL_API_KEY!}`
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Cal.com error ${res.status}: ${await res.text()}`)
  return res.json()
}

export function getSchedulingLink(username: string, eventSlug: string): string {
  return `https://cal.com/${username}/${eventSlug}`
}

export async function createBooking(params: {
  eventTypeId: number
  name: string
  email: string
  phone: string
  startTime: string
  notes?: string
}): Promise<{ id: number; uid: string }> {
  const booking = await calRequest('/bookings', 'POST', {
    eventTypeId: params.eventTypeId,
    start: params.startTime,
    responses: {
      name: params.name,
      email: params.email,
      phone: params.phone,
      notes: params.notes ?? '',
    },
    timeZone: 'America/Los_Angeles',
    language: 'en',
    metadata: {},
  })
  return { id: booking.id, uid: booking.uid }
}

export async function cancelBooking(uid: string): Promise<void> {
  await calRequest(`/bookings/${uid}/cancel`, 'DELETE')
}
