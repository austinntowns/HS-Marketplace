'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/listings/StatusBadge'
import { adminMarkSold } from '@/lib/admin/actions'
import type { ListingStatus, ListingType } from '@/lib/listings/types'

interface Listing {
  id: string
  title: string | null
  type: ListingType
  status: ListingStatus
  askingPrice: number
  viewCount: number
  inquiryCount: number
  createdAt: Date
  updatedAt: Date
  seller: { name: string | null; email: string | null }
}

interface ListingsTableProps {
  listings: Listing[]
}

export function ListingsTable({ listings }: ListingsTableProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  const handleMarkSold = async (id: string) => {
    if (!confirm('Mark this listing as sold?')) return

    setProcessing(id)
    try {
      await adminMarkSold(id)
      router.refresh()
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(cents / 100)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {listings.map(listing => (
            <tr key={listing.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <Link href={`/admin/listings/${listing.id}`} className="font-medium text-gray-900 hover:text-pink-600">
                  {listing.title || 'Untitled'}
                </Link>
                <p className="text-sm text-gray-500 capitalize">{listing.type}</p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-gray-900">{listing.seller.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{listing.seller.email}</p>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={listing.status} />
              </td>
              <td className="px-4 py-4 text-gray-900 font-medium">
                {formatPrice(listing.askingPrice)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {listing.viewCount} views &bull; {listing.inquiryCount} inquiries
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {formatDate(listing.createdAt)}
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/listings/${listing.id}/edit`}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                  {listing.status === 'active' && (
                    <button
                      onClick={() => handleMarkSold(listing.id)}
                      disabled={processing === listing.id}
                      className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                      Mark Sold
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
