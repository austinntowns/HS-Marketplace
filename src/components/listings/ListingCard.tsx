import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import type { ListingStatus, ListingType } from '@/lib/listings/types'

interface ListingCardProps {
  id: string
  title: string
  type: ListingType
  status: ListingStatus
  askingPrice: number
  coverPhotoUrl?: string
  viewCount: number
  inquiryCount: number
  rejectionReason?: string | null
  createdAt: Date
}

export function ListingCard({
  id,
  title,
  type,
  status,
  askingPrice,
  coverPhotoUrl,
  viewCount,
  inquiryCount,
  rejectionReason,
  createdAt,
}: ListingCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(askingPrice / 100)

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt))

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Rejection banner */}
      {status === 'rejected' && rejectionReason && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <p className="text-sm text-red-800">
            <span className="font-medium">Rejected:</span> {rejectionReason}
          </p>
          <Link
            href={`/seller/listings/${id}/edit`}
            className="text-sm text-red-600 font-medium hover:underline"
          >
            Edit to resubmit &rarr;
          </Link>
        </div>
      )}

      <Link href={`/seller/listings/${id}`} className="block">
        {/* Cover photo */}
        <div className="aspect-video bg-gray-100 relative">
          {coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPhotoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No photo
            </div>
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-500 capitalize">{type}</p>
          <p className="text-lg font-bold text-pink-600 mt-2">{formattedPrice}</p>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>{viewCount} views</span>
            <span>{inquiryCount} inquiries</span>
          </div>

          <p className="text-xs text-gray-400 mt-2">Created {formattedDate}</p>
        </div>
      </Link>
    </div>
  )
}
