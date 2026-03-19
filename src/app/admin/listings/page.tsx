import Link from 'next/link'
import { getAllListings } from '@/lib/admin/actions'
import { ListingsTable } from '@/components/admin/ListingsTable'
import type { ListingStatus } from '@/lib/listings/types'

const STATUS_FILTERS: { value: ListingStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'sold', label: 'Sold' },
  { value: 'delisted', label: 'Delisted' },
]

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const statusFilter = status as ListingStatus | undefined
  const listings = await getAllListings(statusFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Listings</h1>
        <span className="text-sm text-gray-500">
          {listings.length} listing{listings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_FILTERS.map(filter => (
          <Link
            key={filter.value}
            href={filter.value ? `/admin/listings?status=${filter.value}` : '/admin/listings'}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
              ${(status || '') === filter.value
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No listings found.</p>
        </div>
      ) : (
        <ListingsTable listings={listings} />
      )}
    </div>
  )
}
