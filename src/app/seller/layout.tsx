import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.sellerAccess && session.user.role !== 'admin') {
    redirect('/access-denied')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/seller/listings" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-hs-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">HS</span>
              </div>
              <span className="font-semibold text-gray-900 tracking-tight">
                Marketplace
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/seller/listings"
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                My Listings
              </Link>
              <Link
                href="/seller/listings/new"
                className="
                  inline-flex items-center gap-2
                  px-4 py-2
                  bg-hs-red-600 text-white
                  rounded-lg text-sm font-semibold
                  shadow-sm
                  transition-all duration-200
                  hover:bg-hs-red-700 hover:shadow-md
                  active:scale-[0.98]
                "
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Listing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-8">{children}</main>
    </div>
  )
}
