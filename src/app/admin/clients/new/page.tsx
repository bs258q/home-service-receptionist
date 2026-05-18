'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', businessName: '', email: '', ownerCell: '',
    urgentKeywords: '', afterHoursEscalate: true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        urgentKeywords: form.urgentKeywords.split(',').map(k => k.trim()).filter(Boolean),
      }),
    })
    if (res.ok) router.push('/admin/clients')
    else {
      const err = await res.json()
      alert(err.error)
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-6">Add New Client</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'Contact Name', key: 'name' },
          { label: 'Business Name', key: 'businessName' },
          { label: 'Email', key: 'email', type: 'email' },
          { label: 'Owner Cell (for escalations)', key: 'ownerCell', placeholder: '+14155551234' },
          { label: 'Extra Urgent Keywords (comma separated)', key: 'urgentKeywords', placeholder: 'sewage, no ac' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type={type ?? 'text'}
              placeholder={placeholder}
              value={(form as Record<string, string | boolean>)[key] as string}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              required={key !== 'urgentKeywords'}
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="afterHours"
            checked={form.afterHoursEscalate}
            onChange={e => setForm(f => ({ ...f, afterHoursEscalate: e.target.checked }))}
          />
          <label htmlFor="afterHours" className="text-sm">Always escalate after hours</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Provisioning (~30s)...' : 'Create Client'}
        </button>
      </form>
    </div>
  )
}
