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

  const handleSubmit = async () => {
    // Validate all fields
    const isValid = await methods.trigger()
    if (!isValid) return

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
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()}>
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
          <PhotosDetailsStep
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            isSubmitting={isSubmitting}
          />
        )}
      </form>
    </FormProvider>
  )
}
