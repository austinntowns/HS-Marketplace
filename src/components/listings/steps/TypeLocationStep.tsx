'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { LocationSelector } from '../LocationSelector'
import { TerritoryPicker } from '../TerritoryPicker'
import type { ListingFormData, ListingType } from '@/lib/listings/types'

interface TypeLocationStepProps {
  userId: string
  onNext: () => void
  onSaveAndExit: () => void
  isSaving: boolean
}

const TYPE_OPTIONS: { value: ListingType; label: string; description: string }[] = [
  { value: 'suite', label: 'Suite', description: 'A single suite inside a shared space' },
  { value: 'flagship', label: 'Flagship', description: 'A full standalone studio' },
  { value: 'territory', label: 'Territory', description: 'Rights to open new locations' },
  { value: 'bundle', label: 'Bundle', description: 'Two or more locations sold together' },
]

export function TypeLocationStep({ userId, onNext, onSaveAndExit, isSaving }: TypeLocationStepProps) {
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What are you selling?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTypeSelect(opt.value)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all min-h-[44px]
                focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2
                ${selectedType === opt.value
                  ? 'border-hs-red-600 bg-hs-red-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                }
              `}
            >
              <div className="font-medium text-gray-900">{opt.label}</div>
              <div className="text-sm text-gray-500 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="mt-2 text-sm text-hs-red-600">{errors.type.message}</p>
        )}
      </div>

      {selectedType && selectedType !== 'territory' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Location(s)</h3>
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
            <p className="mt-2 text-sm text-hs-red-600">{errors.locations.message}</p>
          )}
        </div>
      )}

      {selectedType === 'territory' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Define Territory</h3>
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

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onSaveAndExit}
          disabled={isSaving}
          className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2"
        >
          Save &amp; Exit
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedType || locations.length === 0}
          className="px-6 py-2.5 bg-hs-red-600 text-white rounded-lg font-medium hover:bg-hs-red-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2"
        >
          Next
        </button>
      </div>
    </div>
  )
}
