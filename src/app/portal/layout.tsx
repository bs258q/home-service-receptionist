import Link from 'next/link'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <nav className="w-48 bg-gray-800 text-white p-4 space-y-2">
        <div className="font-bold text-lg mb-6">My Dashboard</div>
        <Link href="/portal" className="block py-1 hover:text-blue-300">Today</Link>
        <Link href="/portal/calls" className="block py-1 hover:text-blue-300">Calls</Link>
        <Link href="/portal/bookings" className="block py-1 hover:text-blue-300">Bookings</Link>
      </nav>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
