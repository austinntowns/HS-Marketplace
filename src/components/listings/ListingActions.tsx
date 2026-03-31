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
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<{ action: string; targetStatus: string } | null>(null)

  const actionLabels: Record<string, string> = {
    submit: 'Submit for Review',
    markSold: 'Mark as Sold',
    delist: 'Delist',
    relist: 'Relist',
  }

  const requestAction = (action: string, targetStatus: string) => {
    setActionError(null)
    setPendingAction({ action, targetStatus })
  }

  const cancelAction = () => {
    setPendingAction(null)
  }

  const confirmAction = async () => {
    if (!pendingAction) return

    const { action, targetStatus } = pendingAction
    setPendingAction(null)
    setActionError(null)
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
      setActionError((error as Error).message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (availableActions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Confirmation bar */}
      {pendingAction && (
        <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <span className="text-yellow-800">
            Are you sure you want to {actionLabels[pendingAction.action]?.toLowerCase() || pendingAction.action}?
          </span>
          <button
            onClick={confirmAction}
            className="px-3 py-1 bg-yellow-600 text-white rounded-md text-xs font-medium hover:bg-yellow-700 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
          >
            Confirm
          </button>
          <button
            onClick={cancelAction}
            className="px-3 py-1 border border-yellow-300 text-yellow-800 rounded-md text-xs font-medium hover:bg-yellow-100 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error message */}
      {actionError && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="flex gap-2">
        {availableActions.map(({ action, targetStatus }) => (
          <button
            key={action}
            onClick={() => requestAction(action, targetStatus)}
            disabled={isLoading || !!pendingAction}
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
    </div>
  )
}
