'use client'

import { useState, useEffect } from 'react'
import type { LocationSelection } from '@/lib/listings/types'
import { getSellerLocations } from '@/lib/listings/mock-data'

interface LocationSelectorProps {
  value: LocationSelection[]
  onChange: (locations: LocationSelection[]) => void
  userId: string
}

export function LocationSelector({ value, onChange, userId }: LocationSelectorProps) {
  const [available, setAvailable] = useState<LocationSelection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSellerLocations(userId).then(locations => {
      setAvailable(locations)
      setLoading(false)
    })
  }, [userId])

  const toggleLocation = (loc: LocationSelection) => {
    const isSelected = value.some(v => v.id === loc.id)
    if (isSelected) {
      onChange(value.filter(v => v.id !== loc.id))
    } else {
      onChange([...value, loc])
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Select one or more locations. Selecting multiple creates a bundle listing.
      </p>
      <div className="grid gap-3">
        {available.map(loc => {
          const isSelected = value.some(v => v.id === loc.id)
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => toggleLocation(loc)}
              className={`
                p-4 rounded-lg border-2 text-left transition-colors
                ${isSelected
                  ? 'border-pink-600 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="font-medium">{loc.name}</div>
              <div className="text-sm text-gray-500">
                {loc.city}, {loc.state} • {loc.squareFootage} sq ft
              </div>
              <div className="text-sm text-gray-500">
                TTM Revenue: ${((loc.ttmRevenue || 0) / 100).toLocaleString()}
              </div>
            </button>
          )
        })}
      </div>
      {value.length > 1 && (
        <p className="text-sm text-pink-600 font-medium">
          Bundle listing: {value.length} locations selected
        </p>
      )}
    </div>
  )
}
