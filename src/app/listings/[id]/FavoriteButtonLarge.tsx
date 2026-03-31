'use client'

import { useState } from 'react'

interface FavoriteButtonLargeProps {
  listingId: string
}

export function FavoriteButtonLarge({ listingId: _listingId }: FavoriteButtonLargeProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  function handleToggle() {
    setIsFavorited(prev => !prev)
    // TODO: persist favorite state via server action
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5
        border rounded-xl
        text-sm font-medium
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2
        min-h-[44px]
        ${
          isFavorited
            ? 'bg-hs-red-50 border-hs-red-200 text-hs-red-700 hover:bg-hs-red-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }
      `}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`h-4 w-4 transition-colors duration-200 ${isFavorited ? 'text-hs-red-600' : 'text-gray-500'}`}
        fill={isFavorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isFavorited ? 'Saved' : 'Save'}
    </button>
  )
}
