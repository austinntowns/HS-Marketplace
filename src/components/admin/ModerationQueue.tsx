'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminListingCard } from './AdminListingCard'
import { RejectionModal } from './RejectionModal'
import { approveListing, rejectListing } from '@/lib/admin/actions'
import type { ListingStatus, ListingType } from '@/lib/listings/types'

interface Listing {
  id: string
  title: string | null
  type: ListingType
  status: ListingStatus
  askingPrice: number
  createdAt: Date
  photos: { url: string }[]
  locations: { name: string; city: string | null; state: string | null }[]
  seller: { name: string | null; email: string | null }
}

interface ModerationQueueProps {
  listings: Listing[]
}

export function ModerationQueue({ listings }: ModerationQueueProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessing(id)
    try {
      await approveListing(id)
      router.refresh()
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string, reason: string, notes: string) => {
    setProcessing(id)
    try {
      await rejectListing(id, reason, notes)
      setRejectingId(null)
      router.refresh()
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No listings pending review.</p>
      </div>
    )
  }

  const rejectingListing = listings.find(l => l.id === rejectingId)

  return (
    <>
      <div className="space-y-4">
        {listings.map(listing => (
          <AdminListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title || 'Untitled'}
            type={listing.type}
            status={listing.status}
            askingPrice={listing.askingPrice}
            coverPhotoUrl={listing.photos[0]?.url}
            sellerName={listing.seller.name || 'Unknown'}
            sellerEmail={listing.seller.email || 'Unknown'}
            createdAt={listing.createdAt}
            locations={listing.locations.map(l => ({
              name: l.name,
              city: l.city || undefined,
              state: l.state || undefined,
            }))}
            onApprove={() => handleApprove(listing.id)}
            onReject={() => setRejectingId(listing.id)}
            isProcessing={processing === listing.id}
          />
        ))}
      </div>

      <RejectionModal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={(reason, notes) => handleReject(rejectingId!, reason, notes)}
        listingTitle={rejectingListing?.title || 'Listing'}
        isProcessing={processing === rejectingId}
      />
    </>
  )
}
