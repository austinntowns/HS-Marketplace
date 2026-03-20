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
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">HS</span>
                </div>
                <span className="font-semibold text-gray-900 tracking-tight">
                  Admin
                </span>
              </Link>

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/admin/queue">Queue</NavLink>
                <NavLink href="/admin/listings">Listings</NavLink>
                <NavLink href="/admin/inquiries">Inquiries</NavLink>
                <NavLink href="/admin/users">Users</NavLink>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-gray-500">
                {session.user.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-900 text-white text-xs font-semibold rounded-md">
                Admin
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">{children}</main>
    </div>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {children}
    </Link>
  )
}
