import { createServerSupabaseClient, createServiceClient } from '@/lib/db'
import { getClientByGoogleId } from '@/lib/auth'

export default async function PortalCallsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Not logged in</div>

  const googleId = user.user_metadata.sub || user.id
  const client = await getClientByGoogleId(googleId)
  if (!client) return <div>Account not found</div>

  const db = createServiceClient()
  const { data: calls } = await db
    .from('calls')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Call History</h1>
      <div className="space-y-3">
        {(calls ?? []).map(c => (
          <div key={c.id} className={`bg-white border rounded p-4 ${c.intent === 'escalated' ? 'border-red-300' : ''}`}>
            <div className="flex justify-between mb-2">
              <div>
                <div className="font-medium">{c.caller_number}</div>
                <div className="text-gray-500 text-sm">{new Date(c.created_at).toLocaleString()} · {c.duration_sec}s</div>
              </div>
              <span className={`px-2 py-0.5 h-fit rounded text-xs ${
                c.intent === 'escalated' ? 'bg-red-100 text-red-800' :
                c.intent === 'booking' ? 'bg-green-100 text-green-800' :
                'bg-gray-100'
              }`}>{c.intent}</span>
            </div>
            {c.transcript && (
              <details className="text-sm text-gray-600">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-600">View transcript</summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans">{c.transcript}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
