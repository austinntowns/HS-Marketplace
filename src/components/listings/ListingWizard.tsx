'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { TypeLocationStep } from './steps/TypeLocationStep'
import { FinancialsStep } from './steps/FinancialsStep'
import { PhotosDetailsStep } from './steps/PhotosDetailsStep'
import { listingSchema, getFieldsForStep } from '@/lib/listings/schemas'
import { saveDraft, submitListing } from '@/lib/listings/actions'
import type { ListingFormData } from '@/lib/listings/types'

interface ListingWizardProps {
  userId: string
}

export function ListingWizard({ userId }: ListingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [listingId, setListingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    mode: 'onBlur',
    defaultValues: {
      type: undefined,
      locations: [],
      askingPrice: 0,
      photos: [],
      inventoryIncluded: false,
      laserIncluded: false,
    },
  })

  const handleStepComplete = async (nextStep: number) => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(step)
    const isValid = await methods.trigger(fieldsToValidate)
    if (!isValid) return

    // Auto-save draft
    const values = methods.getValues()
    const result = await saveDraft(values, listingId || undefined)
    if (result.listingId && !listingId) {
      setListingId(result.listingId)
    }

    setStep(nextStep)
  }

  const handleSaveAndExit = async () => {
    const values = methods.getValues()
    const hasType = !!values.type
    const hasLocations = values.locations && values.locations.length > 0

    // If no existing draft and no meaningful data, just navigate away
    if (!listingId && !hasType && !hasLocations) {
      router.push('/seller/listings')
      return
    }

    // Only save if there's actual data worth saving
    try {
      await saveDraft(values, listingId || undefined)
    } catch {
      // Best-effort save; navigate regardless
    }
    router.push('/seller/listings')
  }

  const handleSubmit = async () => {
    // Validate all fields
    const isValid = await methods.trigger()
    if (!isValid) return

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      // Save final draft
      const values = methods.getValues()
      const saveResult = await saveDraft(values, listingId || undefined)
      const finalListingId = saveResult.listingId || listingId

      if (!finalListingId) {
        throw new Error('Failed to save listing')
      }

      // Submit for review
      await submitListing(finalListingId)

      // Redirect to success page
      router.push(`/seller/listings/${finalListingId}/submitted`)
    } catch (error) {
      console.error('Submit failed:', error)
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleSaveAndExit}
            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2 rounded"
          >
            Save &amp; Exit
          </button>
        </div>

        <StepIndicator current={step} total={3} />

        {step === 1 && (
          <TypeLocationStep
            userId={userId}
            onNext={() => handleStepComplete(2)}
          />
        )}

        {step === 2 && (
          <FinancialsStep
            onNext={() => handleStepComplete(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <>
            <PhotosDetailsStep
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              isSubmitting={isSubmitting}
            />
            {submitError && (
              <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {submitError}
              </div>
            )}
          </>
        )}
      </form>
    </FormProvider>
  )
}
