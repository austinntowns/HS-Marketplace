'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { PhotoUploader } from '../PhotoUploader'
import { PhotoGrid } from '../PhotoGrid'
import type { ListingFormData, Photo } from '@/lib/listings/types'

interface PhotosDetailsStepProps {
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
}

export function PhotosDetailsStep({ onSubmit, onBack, isSubmitting }: PhotosDetailsStepProps) {
  const { register, control, watch, formState: { errors } } = useFormContext<ListingFormData>()
  const photos = watch('photos') || []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Photos</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload 1-10 photos. Drag to reorder — first photo becomes the cover.
        </p>
        <Controller
          name="photos"
          control={control}
          render={({ field }) => (
            <>
              <PhotoUploader
                onUploadComplete={(photo: Photo) => {
                  field.onChange([...(field.value || []), photo])
                }}
                currentCount={photos.length}
                maxCount={10}
              />
              <PhotoGrid
                photos={field.value || []}
                onReorder={field.onChange}
                onRemove={(id) => {
                  field.onChange((field.value || []).filter((p: Photo) => p.id !== id))
                }}
              />
            </>
          )}
        />
        {errors.photos && (
          <p className="mt-2 text-sm text-red-600">{errors.photos.message}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Included Assets</h3>
        <div className="space-y-3">
          <label htmlFor="inventoryIncluded" className="flex items-center gap-3">
            <input
              id="inventoryIncluded"
              type="checkbox"
              {...register('inventoryIncluded')}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span>Inventory included</span>
          </label>
          <label htmlFor="laserIncluded" className="flex items-center gap-3">
            <input
              id="laserIncluded"
              type="checkbox"
              {...register('laserIncluded')}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span>Laser device included</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="otherAssets" className="block text-sm font-medium text-gray-700 mb-1">
          Other Assets (optional)
        </label>
        <input
          id="otherAssets"
          type="text"
          {...register('otherAssets')}
          placeholder="e.g., Custom furniture, display cases"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (optional)
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={4}
          maxLength={2000}
          placeholder="Any additional information for potential buyers..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
        <p className="mt-1 text-xs text-gray-500">Max 2000 characters</p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || photos.length === 0}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </div>
  )
}
