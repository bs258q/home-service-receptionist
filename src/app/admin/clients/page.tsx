import { createServiceClient } from '@/lib/db'
import Link from 'next/link'

export default async function AdminClientsPage() {
  const supabase = createServiceClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, business_name, twilio_number, active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Client
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Business</th>
            <th>Phone Number</th>
            <th>Status</th>
            <th>Added</th>
          </tr>
        </thead>
        <tbody>
          {(clients ?? []).map(c => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="py-2">
                <Link href={`/admin/clients/${c.id}`} className="font-medium hover:underline">
                  {c.business_name}
                </Link>
                <div className="text-gray-500">{c.name}</div>
              </td>
              <td>{c.twilio_number}</td>
              <td>
                <span className={`px-2 py-0.5 rounded text-xs ${c.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                  {c.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
