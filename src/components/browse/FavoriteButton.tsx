'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleFavorite } from '@/lib/favorites-actions'

interface FavoriteButtonProps {
  listingId: string
  initialFavorited: boolean
}

export function FavoriteButton({ listingId, initialFavorited }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(initialFavorited)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

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
      className="
        p-2 rounded-full bg-white/80 backdrop-blur-sm
        hover:bg-white transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hs-red-500
      "
    >
      <svg
        className={`h-5 w-5 transition-colors ${
          optimisticFavorited ? 'text-hs-red-600 fill-current' : 'text-gray-600'
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
    </button>
  )
}
