import { createServerSupabaseClient, createServiceClient } from '@/lib/db'
import { getClientByGoogleId } from '@/lib/auth'

export default async function PortalPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Not logged in</div>

  const googleId = user.user_metadata.sub || user.id
  const client = await getClientByGoogleId(googleId)
  if (!client) return <div>Account not found. Contact support.</div>

  const db = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: todayBookings }, { data: recentCalls }, { count: escalatedCount }] =
    await Promise.all([
      db.from('bookings')
        .select('*')
        .eq('client_id', client.id)
        .gte('scheduled_at', `${today}T00:00:00`)
        .lte('scheduled_at', `${today}T23:59:59`)
        .order('scheduled_at'),
      db.from('calls')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(5),
      db.from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .eq('intent', 'escalated'),
    ])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">{client.business_name}</h1>
      <p className="text-gray-500 mb-6">Phone: {client.twilio_number}</p>

      {(escalatedCount ?? 0) > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          ⚠ {escalatedCount} escalated call{escalatedCount !== 1 ? 's' : ''} need your attention.
          <a href="/portal/calls" className="ml-2 underline">View calls</a>
        </div>
      )}

      <h2 className="font-semibold mb-3">Today&apos;s Appointments</h2>
      {(todayBookings ?? []).length === 0 ? (
        <p className="text-gray-400 text-sm mb-6">No appointments today.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {(todayBookings ?? []).map(b => (
            <div key={b.id} className="bg-white border rounded p-3 text-sm">
              <div className="font-medium">{b.customer_name}</div>
              <div className="text-gray-500">{b.service_type} · {new Date(b.scheduled_at).toLocaleTimeString()}</div>
              <div className="text-gray-500">{b.customer_phone}</div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold mb-3">Recent Calls</h2>
      <div className="space-y-2">
        {(recentCalls ?? []).map(c => (
          <div key={c.id} className="bg-white border rounded p-3 text-sm flex justify-between">
            <div>
              <div>{c.caller_number}</div>
              <div className="text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
            </div>
            <span className={`self-start px-2 py-0.5 rounded text-xs ${
              c.intent === 'escalated' ? 'bg-red-100 text-red-800' :
              c.intent === 'booking' ? 'bg-green-100 text-green-800' :
              'bg-gray-100'
            }`}>{c.intent}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
