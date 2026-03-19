'use client'

import { useFormContext } from 'react-hook-form'
import type { ListingFormData } from '@/lib/listings/types'

interface FinancialsStepProps {
  onNext: () => void
  onBack: () => void
}

export function FinancialsStep({ onNext, onBack }: FinancialsStepProps) {
  const { register, watch, formState: { errors } } = useFormContext<ListingFormData>()
  const locations = watch('locations') || []

  // Display auto-populated data from locations
  const totalTtmRevenue = locations.reduce((sum, loc) => sum + (loc.ttmRevenue || 0), 0)

  return (
    <div className="space-y-6">
      {/* Auto-populated fields (read-only) */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-700">Auto-populated from system data</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">TTM Revenue:</span>
            <span className="ml-2 font-medium">${(totalTtmRevenue / 100).toLocaleString()}</span>
          </div>
          {locations.map(loc => (
            <div key={loc.id}>
              <span className="text-gray-500">{loc.name}:</span>
              <span className="ml-2">{loc.squareFootage} sq ft, MCR: {((loc.mcr || 0) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seller-entered fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asking Price <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            {...register('askingPrice', { valueAsNumber: true })}
            placeholder="0"
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
        {errors.askingPrice && (
          <p className="mt-1 text-sm text-red-600">{errors.askingPrice.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          TTM Profit (optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            {...register('ttmProfit', { valueAsNumber: true })}
            placeholder="0"
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Selling (optional)
        </label>
        <textarea
          {...register('reasonForSelling')}
          rows={3}
          maxLength={500}
          placeholder="Why are you selling this location?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
        <p className="mt-1 text-xs text-gray-500">Max 500 characters</p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
