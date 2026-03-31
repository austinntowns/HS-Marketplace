'use client'

import { useFormContext } from 'react-hook-form'
import type { ListingFormData } from '@/lib/listings/types'

interface FinancialsStepProps {
  onNext: () => void
  onBack: () => void
  onSaveAndExit: () => void
  isSaving: boolean
}

export function FinancialsStep({ onNext, onBack, onSaveAndExit, isSaving }: FinancialsStepProps) {
  const { register, watch, formState: { errors } } = useFormContext<ListingFormData>()
  const locations = watch('locations') || []

  // Display auto-populated data from locations
  const totalTtmRevenue = locations.reduce((sum, loc) => sum + (loc.ttmRevenue || 0), 0)

  return (
    <div className="space-y-6">
      {/* Auto-populated fields (read-only) */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-gray-900">Verified data (pulled from Hello Sugar)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">TTM Revenue:</span>
            <span className="ml-2 font-medium text-gray-900">${(totalTtmRevenue / 100).toLocaleString()}</span>
          </div>
          {locations.map(loc => (
            <div key={loc.id}>
              <span className="text-gray-500">{loc.name}:</span>
              <span className="ml-2 text-gray-900">{loc.squareFootage} sq ft, MCR: {((loc.mcr || 0) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seller-entered fields */}
      <div>
        <label htmlFor="askingPrice" className="block text-sm font-medium text-gray-700 mb-1">
          Asking Price <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            id="askingPrice"
            type="number"
            {...register('askingPrice', { valueAsNumber: true })}
            placeholder="0"
            className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hs-red-500 focus:border-hs-red-500 min-h-[44px]"
          />
        </div>
        {errors.askingPrice && (
          <p className="mt-1 text-sm text-hs-red-600">{errors.askingPrice.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="ttmProfit" className="block text-sm font-medium text-gray-700 mb-1">
          TTM Profit (optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            id="ttmProfit"
            type="number"
            {...register('ttmProfit', { valueAsNumber: true })}
            placeholder="0"
            className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hs-red-500 focus:border-hs-red-500 min-h-[44px]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reasonForSelling" className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Selling (optional)
        </label>
        <textarea
          id="reasonForSelling"
          {...register('reasonForSelling')}
          rows={3}
          maxLength={500}
          placeholder="e.g., Relocating, consolidating portfolio, retiring..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hs-red-500 focus:border-hs-red-500 min-h-[44px]"
        />
        <p className="mt-1 text-xs text-gray-500">Helps buyers understand the opportunity. Max 500 characters.</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSaveAndExit}
            disabled={isSaving}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2"
          >
            Save &amp; Exit
          </button>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-hs-red-600 text-white rounded-lg font-medium hover:bg-hs-red-700 min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2"
        >
          Next
        </button>
      </div>
    </div>
  )
}
