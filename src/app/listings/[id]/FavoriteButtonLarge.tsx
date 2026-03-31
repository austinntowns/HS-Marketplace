'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleFavorite } from '@/lib/favorites-actions'

interface FavoriteButtonLargeProps {
  listingId: string
  initialFavorited: boolean
}

export function FavoriteButtonLarge({ listingId, initialFavorited }: FavoriteButtonLargeProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(initialFavorited)

  function handleClick() {
    startTransition(async () => {
      setOptimisticFavorited(!optimisticFavorited)
      try {
        await toggleFavorite(listingId)
      } catch {
        // Optimistic update auto-reverts on error since the transition fails
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimisticFavorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2
        ${
          optimisticFavorited
            ? 'bg-hs-red-50 text-hs-red-700 border border-hs-red-200 hover:bg-hs-red-100'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }
      `}
    >
      <svg
        className={`h-5 w-5 transition-colors ${
          optimisticFavorited ? 'text-hs-red-600 fill-current' : 'text-gray-400'
        }`}
        fill={optimisticFavorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {optimisticFavorited ? 'Saved' : 'Save'}
    </button>
  )
}
