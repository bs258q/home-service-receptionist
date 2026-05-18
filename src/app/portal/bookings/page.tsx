import { createServerSupabaseClient, createServiceClient } from '@/lib/db'
import { getClientByGoogleId } from '@/lib/auth'

export default async function PortalBookingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Not logged in</div>

  const googleId = user.user_metadata.sub || user.id
  const client = await getClientByGoogleId(googleId)
  if (!client) return <div>Account not found</div>

  const db = createServiceClient()
  const { data: bookings } = await db
    .from('bookings')
    .select('*')
    .eq('client_id', client.id)
    .order('scheduled_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Bookings</h1>
      <table className="w-full text-sm bg-white rounded-lg border">
        <thead>
          <tr className="border-b text-left">
            <th className="p-3">Customer</th>
            <th>Service</th>
            <th>Scheduled</th>
            <th>Status</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {(bookings ?? []).map(b => (
            <tr key={b.id} className="border-b">
              <td className="p-3 font-medium">{b.customer_name}</td>
              <td>{b.service_type}</td>
              <td>{b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : '—'}</td>
              <td>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{b.status}</span>
              </td>
              <td>{b.customer_phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
