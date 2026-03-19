import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/access-denied')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin/queue" className="text-xl font-bold text-pink-600">
                Admin Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/queue"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Queue
                </Link>
                <Link
                  href="/admin/listings"
                  className="text-gray-600 hover:text-gray-900"
                >
                  All Listings
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Users
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{session.user.email}</span>
              <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded">
                Admin
              </span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
