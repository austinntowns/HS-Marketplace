'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { LocationSelector } from '../LocationSelector'
import { TerritoryPicker } from '../TerritoryPicker'
import type { ListingFormData, ListingType } from '@/lib/listings/types'

interface TypeLocationStepProps {
  userId: string
  onNext: () => void
}

const TYPE_OPTIONS: { value: ListingType; label: string; description: string }[] = [
  { value: 'suite', label: 'Suite', description: 'A single suite location' },
  { value: 'flagship', label: 'Flagship', description: 'A flagship location' },
  { value: 'territory', label: 'Territory', description: 'An unopened territory' },
]

export function TypeLocationStep({ userId, onNext }: TypeLocationStepProps) {
  const { control, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()
  const selectedType = watch('type')
  const locations = watch('locations') || []

  const handleTypeSelect = (type: ListingType) => {
    setValue('type', type)
    setValue('locations', []) // Reset locations on type change
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">What are you selling?</h3>
        <div className="grid grid-cols-3 gap-4">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTypeSelect(opt.value)}
              className={`
                p-4 rounded-lg border-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2
                ${selectedType === opt.value
                  ? 'border-pink-600 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.description}</div>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {selectedType && selectedType !== 'territory' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Select Location(s)</h3>
          <Controller
            name="locations"
            control={control}
            render={({ field }) => (
              <LocationSelector
                value={field.value || []}
                onChange={field.onChange}
                userId={userId}
              />
            )}
          />
          {errors.locations && (
            <p className="mt-2 text-sm text-red-600">{errors.locations.message}</p>
          )}
        </div>
      )}

      {selectedType === 'territory' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Define Territory</h3>
          <Controller
            name="locations"
            control={control}
            render={({ field }) => {
              const territory = field.value?.[0]
              return (
                <TerritoryPicker
                  value={territory ? {
                    center: { lat: territory.territoryLat!, lng: territory.territoryLng! },
                    radius: territory.territoryRadius!,
                  } : undefined}
                  onChange={(val) => {
                    field.onChange([{
                      id: territory?.id || crypto.randomUUID(),
                      type: 'territory' as const,
                      name: territory?.name || '',
                      territoryLat: val.center.lat,
                      territoryLng: val.center.lng,
                      territoryRadius: val.radius,
                    }])
                  }}
                  territoryName={territory?.name || ''}
                  onNameChange={(name) => {
                    const current = field.value?.[0] || {
                      id: crypto.randomUUID(),
                      type: 'territory' as const,
                    }
                    field.onChange([{ ...current, name }])
                  }}
                />
              )
            }}
          />
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedType || locations.length === 0}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        >
          Next
        </button>
      </div>
    </div>
  )
}
