import { createServiceClient } from '@/lib/db'
import ServiceCards from './ServiceCards'

export default async function AdminOverviewPage() {
  const supabase = createServiceClient()

  const [{ count: clientCount }, { count: callCount }, { count: bookingCount }] =
    await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('calls').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
    ])

  const { data: recentCalls } = await supabase
    .from('calls')
    .select('id, caller_number, intent, booked, created_at, clients(business_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Overview</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Clients', value: clientCount ?? 0 },
          { label: 'Total Calls', value: callCount ?? 0 },
          { label: 'Total Bookings', value: bookingCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-gray-500 text-sm">{label}</div>
          </div>
        ))}
      </div>
      <ServiceCards />
      <h2 className="font-semibold mb-3 mt-8">Recent Calls</h2>
      <table className="w-full text-sm bg-white rounded-lg border">
        <thead>
          <tr className="border-b text-left">
            <th className="p-3">Business</th>
            <th>Caller</th>
            <th>Intent</th>
            <th>Booked</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {(recentCalls ?? []).map(c => {
            const clientData = Array.isArray(c.clients) ? c.clients[0] : c.clients
            return (
            <tr key={c.id} className="border-b">
              <td className="p-3">{(clientData as any)?.business_name || 'Unknown'}</td>
              <td>{c.caller_number}</td>
              <td>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  c.intent === 'escalated' ? 'bg-red-100 text-red-800' :
                  c.intent === 'booking' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100'
                }`}>{c.intent}</span>
              </td>
              <td>{c.booked ? '✓' : '—'}</td>
              <td className="text-gray-500">{new Date(c.created_at).toLocaleString()}</td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
