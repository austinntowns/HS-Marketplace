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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/seller/listings" className="text-xl font-bold text-pink-600">
              Hello Sugar Marketplace
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/seller/listings"
                className="text-gray-600 hover:text-gray-900"
              >
                My Listings
              </Link>
              <Link
                href="/seller/listings/new"
                className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700"
              >
                Create Listing
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
