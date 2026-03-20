'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ListingActionsProps {
  listingId: string
  availableActions: { action: string; targetStatus: string }[]
}

export function ListingActions({ listingId, availableActions }: ListingActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const actionLabels: Record<string, string> = {
    submit: 'Submit for Review',
    markSold: 'Mark as Sold',
    delist: 'Delist',
    relist: 'Relist',
  }

  const handleAction = async (action: string, targetStatus: string) => {
    if (!confirm(`Are you sure you want to ${actionLabels[action]?.toLowerCase() || action}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error((error as { message?: string; error?: string }).message || (error as { error?: string }).error || 'Action failed')
      }

      router.refresh()
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (availableActions.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2">
      {availableActions.map(({ action, targetStatus }) => (
        <button
          key={action}
          onClick={() => handleAction(action, targetStatus)}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2
            ${action === 'markSold'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : action === 'delist'
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }
            disabled:opacity-50
          `}
        >
          {actionLabels[action] || action}
        </button>
      ))}
    </div>
  )
}
