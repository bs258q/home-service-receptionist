import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <nav className="w-48 bg-gray-900 text-white p-4 space-y-2">
        <div className="font-bold text-lg mb-6">Admin</div>
        <Link href="/admin" className="block py-1 hover:text-blue-300">Overview</Link>
        <Link href="/admin/clients" className="block py-1 hover:text-blue-300">Clients</Link>
      </nav>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
